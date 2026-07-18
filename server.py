import http.server
import socketserver
import json
import sqlite3
import os
from datetime import datetime
import random
import hashlib
import uuid
import re
import math

SENTIMENT_MODEL = None
MODEL_LOAD_ERROR = None

def load_sentiment_model():
    global SENTIMENT_MODEL, MODEL_LOAD_ERROR
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'sentiment_model.json')
    if not os.path.exists(model_path):
        MODEL_LOAD_ERROR = "Model parameters file models/sentiment_model.json not found."
        return
    try:
        with open(model_path, 'r', encoding='utf-8') as f:
            SENTIMENT_MODEL = json.load(f)
    except Exception as e:
        MODEL_LOAD_ERROR = f"Failed to parse models/sentiment_model.json: {str(e)}"

# Load the model weights on server start
load_sentiment_model()

def run_sentiment_inference(text):
    global SENTIMENT_MODEL, MODEL_LOAD_ERROR
    if MODEL_LOAD_ERROR:
        return None, MODEL_LOAD_ERROR
    if not SENTIMENT_MODEL:
        return None, "Model parameters not loaded."
        
    cleaned = text.lower()
    cleaned = re.sub(r'[^\w\s]', '', cleaned)
    tokens = cleaned.split()
    
    stop_words = {"the", "and", "a", "of", "to", "in", "is", "for", "with", "on", "at", "was", "were", "had", "been"}
    valid_tokens = [t for t in tokens if t not in stop_words and len(t) > 2]
    
    vocab = SENTIMENT_MODEL["word_probabilities"]
    recognized_tokens = [t for t in valid_tokens if t in vocab]
    
    if not recognized_tokens:
        # Fallback for unknown vocabulary
        return {
            "label": "unknown",
            "confidence": 0.0,
            "probabilities": {
                "positive": 0.5,
                "negative": 0.5
            },
            "model": "multinomial-naive-bayes",
            "model_version": "1.0",
            "message": "Insufficient recognized vocabulary for reliable classification."
        }, None
        
    priors = SENTIMENT_MODEL["priors"]
    log_pos = math.log(priors["positive"])
    log_neg = math.log(priors["negative"])
    
    for t in recognized_tokens:
        log_pos += math.log(vocab[t]["positive"])
        log_neg += math.log(vocab[t]["negative"])
        
    # Log-sum-exp normalization
    max_log = max(log_pos, log_neg)
    exp_pos = math.exp(log_pos - max_log)
    exp_neg = math.exp(log_neg - max_log)
    sum_exp = exp_pos + exp_neg
    
    prob_pos = exp_pos / sum_exp
    prob_neg = exp_neg / sum_exp
    
    label = "positive" if prob_pos > prob_neg else "negative"
    confidence = prob_pos if label == "positive" else prob_neg
    
    # confidence represents probability, not guarantee of correctness.
    return {
      "label": label,
      "confidence": round(confidence, 2),
      "probabilities": {
        "positive": round(prob_pos, 2),
        "negative": round(prob_neg, 2)
      },
      "model": "multinomial-naive-bayes",
      "model_version": "1.0"
    }, None

def round_half_up(n, decimals=0):
    multiplier = 10 ** decimals
    return math.floor(n * multiplier + 0.5) / multiplier

def calculate_booking_price(package_name, adults, children, addons_list, visit_date):
    package_prices = {
        "Nature Starter": 650.0,
        "Adventure Pro": 1200.0,
        "Luxury Agro Retreat": 2500.0
    }
    base_price = package_prices.get(package_name, 0.0)
    package_total = (base_price * adults) + (base_price * 0.5 * children)
    
    addon_total = 0.0
    if isinstance(addons_list, str):
        addons_list = [a.strip() for a in addons_list.split(',') if a.strip()]
        
    for addon in addons_list:
        if "Bonfire" in addon or "Campfire" in addon:
            addon_total += 150.0
        elif "Guide" in addon:
            addon_total += 300.0
        elif "Buffet" in addon or "Dining" in addon:
            addon_total += 250.0 * (adults + children)
            
    seasonal_adjustment = 0.0
    weekend_adjustment = 0.0
    
    if visit_date:
        try:
            dt = datetime.strptime(visit_date, "%Y-%m-%d")
            month = dt.month - 1
            day = dt.weekday() # Monday=0, ..., Friday=4, Saturday=5, Sunday=6
            
            # Monsoon (June-Sept = 5 to 8)
            if 5 <= month <= 8:
                seasonal_adjustment = -0.15
            elif month in (10, 11, 0): # Nov, Dec, Jan
                seasonal_adjustment = 0.12
                
            # Weekend (Friday=4, Saturday=5, Sunday=6)
            if day in (4, 5, 6):
                weekend_adjustment = 0.05
        except Exception:
            pass
            
    combined_adjustment = seasonal_adjustment + weekend_adjustment
    if combined_adjustment > 0.20:
        combined_adjustment = 0.20
    elif combined_adjustment < -0.20:
        combined_adjustment = -0.20
        
    adjusted_package_price = package_total * (1.0 + combined_adjustment)
    subtotal = adjusted_package_price + addon_total
    tax_total = subtotal * 0.05
    grand_total = round_half_up(subtotal + tax_total, 2)
    
    return {
        "package_total": round_half_up(package_total, 2),
        "adjusted_package_price": round_half_up(adjusted_package_price, 2),
        "addon_total": round_half_up(addon_total, 2),
        "tax_total": round_half_up(tax_total, 2),
        "grand_total": grand_total
    }

PORT = int(os.environ.get('PORT', 8080))

# Password hashing helper
def hash_password(password, salt=None):
    if not salt:
        salt = uuid.uuid4().hex
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return hashed, salt

# Database initialization
def init_db():
    db_path = os.path.join(os.path.dirname(__file__), 'greenhaven.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # 1. Create Reviews Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            rating INTEGER,
            text TEXT NOT NULL,
            sentiment_label TEXT DEFAULT 'Neutral',
            sentiment_score REAL DEFAULT 0.50,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Run migrations if columns don't exist in existing reviews table
    try:
        c.execute("ALTER TABLE reviews ADD COLUMN sentiment_label TEXT DEFAULT 'Neutral'")
    except sqlite3.OperationalError:
        pass
    try:
        c.execute("ALTER TABLE reviews ADD COLUMN sentiment_score REAL DEFAULT 0.50")
    except sqlite3.OperationalError:
        pass

    # 2. Create Bookings Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE NOT NULL,
            visitor_name TEXT NOT NULL,
            email TEXT NOT NULL,
            visit_date TEXT NOT NULL,
            package_name TEXT NOT NULL,
            adults INTEGER NOT NULL,
            children INTEGER DEFAULT 0,
            addons TEXT,
            total_price REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 3. Create Contact Messages Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 4. Create Users Table (Securely recreated with salts if salt column is missing)
    try:
        c.execute("SELECT salt FROM users LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating users table to hash-and-salt credentials database schema...")
        c.execute("DROP TABLE IF EXISTS users")
        c.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                salt TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

    # 5. Create Chatbot Logs Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS chatbot_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            user_query TEXT NOT NULL,
            bot_response TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Seed default reviews if table is empty
    c.execute("SELECT COUNT(*) FROM reviews")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO reviews (name, title, rating, text, sentiment_label, sentiment_score) VALUES (?, ?, ?, ?, ?, ?)",
                  ("Sanjay Rao", "Family Visitor", 5, "The trekking and the cottage package were absolutely incredible. The local food is cooked organically and reminds us of traditional home dishes. Our kids loved the boating!", "Positive", 0.95))
        c.execute("INSERT INTO reviews (name, title, rating, text, sentiment_label, sentiment_score) VALUES (?, ?, ?, ?, ?, ?)",
                  ("Anjali K.", "Solo Backpacker", 4, "Great place for nature photographers and hikers. The guides are extremely knowledgeable about native fauna. Accommodation in the tents is very clean and standard.", "Positive", 0.88))
        print("Database seeded with default review comments.")

    # Seed default users if table is empty
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        admin_hash, admin_salt = hash_password("admin123")
        guest_hash, guest_salt = hash_password("guest123")
        c.execute("INSERT INTO users (username, password, salt, role) VALUES (?, ?, ?, ?)", ("admin", admin_hash, admin_salt, "admin"))
        c.execute("INSERT INTO users (username, password, salt, role) VALUES (?, ?, ?, ?)", ("guest", guest_hash, guest_salt, "user"))
        print("Database seeded with default secure user credentials.")
        
    conn.commit()
    conn.close()

# Request Handler for REST API and Static Files
class GreenHavenHandler(http.server.SimpleHTTPRequestHandler):
    
    # Custom API GET Requests
    def do_GET(self):
        db_path = os.path.join(os.path.dirname(__file__), 'greenhaven.db')
        
        # 0. API Health Check
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "database": "connected"}).encode('utf-8'))
            return
            
        # Favicon routing to prevent console 404 logs
        elif self.path == '/favicon.ico':
            try:
                favicon_path = os.path.join(os.path.dirname(__file__), 'favicon.svg')
                if os.path.exists(favicon_path):
                    with open(favicon_path, 'rb') as f:
                        self.send_response(200)
                        self.send_header('Content-Type', 'image/svg+xml')
                        self.end_headers()
                        self.wfile.write(f.read())
                        return
            except Exception:
                pass
            self.send_response(204)
            self.end_headers()
            return
            
        # 1. Single Booking Look-up Router
        elif self.path.startswith('/api/bookings/'):
            ticket_id = self.path.replace('/api/bookings/', '')
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("SELECT ticket_id, visitor_name, email, visit_date, package_name, adults, children, addons, total_price FROM bookings WHERE ticket_id = ?", (ticket_id,))
            row = c.fetchone()
            conn.close()
            
            if row:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                booking = {
                    "ticket_id": row[0],
                    "visitor_name": row[1],
                    "email": row[2],
                    "visit_date": row[3],
                    "package_name": row[4],
                    "adults": row[5],
                    "children": row[6],
                    "addons": row[7],
                    "total_price": row[8]
                }
                self.wfile.write(json.dumps(booking).encode('utf-8'))
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Ticket ID not found."}).encode('utf-8'))
            return

        # 2. Reviews Listing Router
        elif self.path == '/api/reviews':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("SELECT id, name, title, rating, text, sentiment_label, sentiment_score FROM reviews ORDER BY id DESC")
            rows = c.fetchall()
            conn.close()
            
            reviews = []
            for r in rows:
                reviews.append({
                    "id": r[0],
                    "name": r[1],
                    "title": r[2],
                    "rating": r[3],
                    "text": r[4],
                    "sentiment_label": r[5] if r[5] else "Neutral",
                    "sentiment_score": r[6] if r[6] is not None else 0.50
                })
            self.wfile.write(json.dumps(reviews).encode('utf-8'))
            return

        # 3. Administrative Statistics Logs
        elif self.path == '/api/admin/stats':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            
            # Fetch booking count and total revenue
            c.execute("SELECT COUNT(*), SUM(total_price) FROM bookings")
            b_count, t_revenue = c.fetchone()
            b_count = b_count if b_count is not None else 0
            t_revenue = t_revenue if t_revenue is not None else 0.0
            
            # Fetch package distribution counts
            c.execute("SELECT package_name, COUNT(*) FROM bookings GROUP BY package_name")
            packages = dict(c.fetchall())
            
            # Fetch sentiment labels count
            c.execute("SELECT sentiment_label, COUNT(*) FROM reviews GROUP BY sentiment_label")
            sentiments = dict(c.fetchall())
            
            # Fetch recent bookings log
            c.execute("SELECT ticket_id, visitor_name, email, visit_date, package_name, total_price, created_at FROM bookings ORDER BY id DESC LIMIT 50")
            booking_rows = c.fetchall()
            bookings_list = []
            for b in booking_rows:
                bookings_list.append({
                    "ticket_id": b[0],
                    "visitor_name": b[1],
                    "email": b[2],
                    "visit_date": b[3],
                    "package_name": b[4],
                    "total_price": b[5],
                    "created_at": b[6]
                })
                
            # Fetch reviews log
            c.execute("SELECT id, name, rating, text, sentiment_label, sentiment_score, created_at FROM reviews ORDER BY id DESC")
            review_rows = c.fetchall()
            reviews_list = []
            for r in review_rows:
                reviews_list.append({
                    "id": r[0],
                    "name": r[1],
                    "rating": r[2],
                    "text": r[3],
                    "sentiment_label": r[4] if r[4] else "Neutral",
                    "sentiment_score": r[5] if r[5] is not None else 0.50,
                    "created_at": r[6]
                })
                
            # Fetch contacts log
            c.execute("SELECT id, name, email, message, created_at FROM contact_messages ORDER BY id DESC")
            contact_rows = c.fetchall()
            contacts_list = []
            for co in contact_rows:
                contacts_list.append({
                    "id": co[0],
                    "name": co[1],
                    "email": co[2],
                    "message": co[3],
                    "created_at": co[4]
                })
                
            # Fetch chatbot analytics logs
            c.execute("SELECT COUNT(*) FROM chatbot_logs")
            chat_count = c.fetchone()[0]
            
            c.execute("SELECT session_id, user_query, bot_response, timestamp FROM chatbot_logs ORDER BY id DESC LIMIT 50")
            chat_rows = c.fetchall()
            chats_list = []
            for ch in chat_rows:
                chats_list.append({
                    "session_id": ch[0],
                    "user_query": ch[1],
                    "bot_response": ch[2],
                    "timestamp": ch[3]
                })
                
            conn.close()
            
            stats = {
                "booking_count": b_count,
                "total_revenue": t_revenue,
                "packages": packages,
                "sentiments": sentiments,
                "bookings": bookings_list,
                "reviews": reviews_list,
                "contacts": contacts_list,
                "chat_count": chat_count,
                "chats": chats_list
            }
            self.wfile.write(json.dumps(stats).encode('utf-8'))
            return
            
        else:
            # Fallback to standard handler for static files
            super().do_GET()

    # Custom API POST Requests
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        db_path = os.path.join(os.path.dirname(__file__), 'greenhaven.db')

        # 0. Sentiment Inference Endpoint
        if self.path == '/api/sentiment':
            try:
                text = data.get('text')
                if text is None or not isinstance(text, str) or len(text.strip()) == 0 or len(text) > 1000:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "error": "Text must be a non-empty string of at most 1000 characters."
                    }).encode('utf-8'))
                    return
                
                result, error = run_sentiment_inference(text)
                if error:
                    self.send_response(503)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "error": "Sentiment analysis service temporarily unavailable."
                    }).encode('utf-8'))
                    return
                    
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
                return
            except Exception as ex:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Internal server error occurred while processing sentiment request."
                }).encode('utf-8'))
                return

        # 1. Review Submission Endpoint
        elif self.path == '/api/reviews':
            name = data.get('name')
            rating = data.get('rating')
            text = data.get('text')
            sentiment_label = data.get('sentiment_label', 'Neutral')
            sentiment_score = data.get('sentiment_score', 0.50)
            
            if not name or not rating or not text:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing name, rating, or description."}).encode('utf-8'))
                return

            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("INSERT INTO reviews (name, title, rating, text, sentiment_label, sentiment_score) VALUES (?, ?, ?, ?, ?, ?)",
                      (name, "Verified Visitor", rating, text, sentiment_label, sentiment_score))
            new_id = c.lastrowid
            conn.commit()
            conn.close()

            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "id": new_id,
                "name": name,
                "title": "Verified Visitor",
                "rating": rating,
                "text": text,
                "sentiment_label": sentiment_label,
                "sentiment_score": sentiment_score
            }).encode('utf-8'))

        # 2. Booking Submission Endpoint
        elif self.path == '/api/bookings':
            name = data.get('name')
            email = data.get('email')
            date = data.get('date')
            package_name = data.get('package_name')
            adults = data.get('adults')
            children = data.get('children', 0)
            addons = data.get('addons', '')
            total_price = data.get('total_price')

            if not name or not email or not date or not package_name or adults is None or total_price is None:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing booking details."}).encode('utf-8'))
                return

            # Generate unique booking ticket ID: GH-YEAR-XXXX
            current_year = datetime.now().year
            random_num = random.randint(1000, 9999)
            ticket_id = f"GH-{current_year}-{random_num}"

            # Recalculate price on the backend to validate/overwrite
            try:
                pricing_calc = calculate_booking_price(package_name, int(adults), int(children), addons, date)
                final_total = pricing_calc["grand_total"]
            except Exception:
                final_total = float(total_price)

            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("""
                INSERT INTO bookings (ticket_id, visitor_name, email, visit_date, package_name, adults, children, addons, total_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (ticket_id, name, email, date, package_name, adults, children, addons, final_total))
            new_id = c.lastrowid
            conn.commit()
            conn.close()

            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "id": new_id,
                "ticket_id": ticket_id,
                "visitor_name": name,
                "email": email,
                "visit_date": date,
                "package_name": package_name,
                "adults": adults,
                "children": children,
                "addons": addons,
                "total_price": final_total
            }).encode('utf-8'))

        # 3. Contact Helpdesk Endpoint
        elif self.path == '/api/contact':
            name = data.get('name')
            email = data.get('email')
            message = data.get('message')

            if not name or not email or not message:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing details."}).encode('utf-8'))
                return

            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
                      (name, email, message))
            conn.commit()
            conn.close()

            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))

        # 4. Chatbot Conversation Logger Endpoint
        elif self.path == '/api/chatbot/logs':
            session_id = data.get('session_id', 'unknown')
            user_query = data.get('user_query', '')
            bot_response = data.get('bot_response', '')
            
            if not user_query or not bot_response:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing query or response payload."}).encode('utf-8'))
                return
                
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("INSERT INTO chatbot_logs (session_id, user_query, bot_response) VALUES (?, ?, ?)",
                      (session_id, user_query, bot_response))
            conn.commit()
            conn.close()
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))

        # 5. User Login Endpoint (Upgraded to SHA-256 Hashed Check)
        elif self.path == '/api/auth/login':
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing username or password."}).encode('utf-8'))
                return
                
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("SELECT id, username, password, salt, role FROM users WHERE username = ?", (username,))
            user = c.fetchone()
            conn.close()
            
            if user:
                user_id, uname, stored_hash, salt, role = user
                check_hash, _ = hash_password(password, salt)
                if check_hash == stored_hash:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "success": True,
                        "token": f"mock-token-{user_id}-{random.randint(1000, 9999)}",
                        "username": uname,
                        "role": role
                    }).encode('utf-8'))
                    return
            
            self.send_response(401)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid username or password."}).encode('utf-8'))

        # 6. User Registration Endpoint (Upgraded to SHA-256 Hashed Store)
        elif self.path == '/api/auth/register':
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing username or password."}).encode('utf-8'))
                return
                
            hashed_pass, salt = hash_password(password)
            try:
                conn = sqlite3.connect(db_path)
                c = conn.cursor()
                c.execute("INSERT INTO users (username, password, salt, role) VALUES (?, ?, ?, ?)", (username, hashed_pass, salt, "user"))
                conn.commit()
                conn.close()
                
                self.send_response(201)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except sqlite3.IntegrityError:
                self.send_response(409)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Username already exists."}).encode('utf-8'))
            
        else:
            self.send_response(404)
            self.end_headers()

    # Custom API DELETE Requests
    def do_DELETE(self):
        db_path = os.path.join(os.path.dirname(__file__), 'greenhaven.db')
        
        # 1. Admin Delete Bookings Router OR Guest Cancel Booking Router
        if self.path.startswith('/api/admin/bookings/'):
            ticket_id = self.path.replace('/api/admin/bookings/', '')
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("DELETE FROM bookings WHERE ticket_id = ?", (ticket_id,))
            conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return
            
        elif self.path.startswith('/api/bookings/'):
            ticket_id = self.path.replace('/api/bookings/', '')
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("DELETE FROM bookings WHERE ticket_id = ?", (ticket_id,))
            conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return

        # 2. Admin Delete Review Testimonials Router
        elif self.path.startswith('/api/admin/reviews/'):
            review_id = self.path.replace('/api/admin/reviews/', '')
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
            conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return

        # 3. Admin Delete Helpdesk Queries Router
        elif self.path.startswith('/api/admin/contacts/'):
            contact_id = self.path.replace('/api/admin/contacts/', '')
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("DELETE FROM contact_messages WHERE id = ?", (contact_id,))
            conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return
            
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    # Ensure correct working directory is the script folder to locate resources correctly
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    init_db()
    
    print(f"GreenHaven Eco-Retreat SQL Fullstack Server running on http://localhost:{PORT}")
    
    # Avoid port re-use socket binding block errors
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), GreenHavenHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.shutdown()
