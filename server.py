import http.server
import socketserver
import json
import sqlite3
import os
from datetime import datetime
import random

PORT = 8080

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

    # Run migrations to alter table if columns don't exist in existing greenhaven.db
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

    # Seed default reviews if table is empty
    c.execute("SELECT COUNT(*) FROM reviews")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO reviews (name, title, rating, text, sentiment_label, sentiment_score) VALUES (?, ?, ?, ?, ?, ?)",
                  ("Sanjay Rao", "Family Visitor", 5, "The trekking and the cottage package were absolutely incredible. The local food is cooked organically and reminds us of traditional home dishes. Our kids loved the boating!", "Positive", 0.95))
        c.execute("INSERT INTO reviews (name, title, rating, text, sentiment_label, sentiment_score) VALUES (?, ?, ?, ?, ?, ?)",
                  ("Anjali K.", "Solo Backpacker", 4, "Great place for nature photographers and hikers. The guides are extremely knowledgeable about native fauna. Accommodation in the tents is very clean and standard.", "Positive", 0.88))
        print("Database seeded with default review comments.")
        
    conn.commit()
    conn.close()

# Request Handler for REST API and Static Files
class GreenHavenHandler(http.server.SimpleHTTPRequestHandler):
    
    # Custom API GET Requests
    def do_GET(self):
        if self.path == '/api/reviews':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            db_path = os.path.join(os.path.dirname(__file__), 'greenhaven.db')
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
        else:
            # Fallback to standard handler for static files (html, css, js, images)
            super().do_GET()
 
    # Custom API POST Requests
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        db_path = os.path.join(os.path.dirname(__file__), 'greenhaven.db')
 
        # 1. Review Submission Endpoint
        if self.path == '/api/reviews':
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

            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("""
                INSERT INTO bookings (ticket_id, visitor_name, email, visit_date, package_name, adults, children, addons, total_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (ticket_id, name, email, date, package_name, adults, children, addons, total_price))
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
                "total_price": total_price
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
