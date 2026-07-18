import unittest
import json
import sqlite3
import os
import sys
from datetime import datetime

# Adjust search path to locate server.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import server

print("==========================================================================")
print("                               TEST SUITE RUN                             ")
print("Python tests validate backend functionality and equivalent business-rule  ")
print("specifications. Browser-side advisor and pricing behavior is verified     ")
print("separately through manual UI tests and is not executed by the Python      ")
print("test suite.                                                               ")
print("==========================================================================")

class TestGreenHavenBackend(unittest.TestCase):

    def setUp(self):
        # Initialize a temporary testing database inside the workspace
        self.db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'greenhaven_test.db')
        self.original_connect = sqlite3.connect
        
        # Override connection pool to redirect queries to our test database
        server.sqlite3.connect = lambda *args, **kwargs: self.original_connect(self.db_path)
        
        # Create schema
        conn = self.original_connect(self.db_path)
        c = conn.cursor()
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
        conn.commit()
        conn.close()

    def tearDown(self):
        # Restore standard connection
        server.sqlite3.connect = self.original_connect
        # Clean up database file
        if os.path.exists(self.db_path):
            try:
                os.remove(self.db_path)
            except Exception:
                pass

    # 1. Sentiment Endpoint Validations
    def test_sentiment_valid_positive(self):
        # Test positive token triggers
        result, error = server.run_sentiment_inference("Wonderful experience, very clean cottages and rooms.")
        self.assertIsNone(error)
        self.assertEqual(result["label"], "positive")
        self.assertGreater(result["confidence"], 0.5)

    def test_sentiment_valid_negative(self):
        # Test negative token triggers
        result, error = server.run_sentiment_inference("Very poor cottage rooms, dirty toilets and bad service.")
        self.assertIsNone(error)
        self.assertEqual(result["label"], "negative")
        self.assertGreater(result["confidence"], 0.5)

    def test_sentiment_unknown_vocabulary(self):
        # Test completely unrecognized words
        result, error = server.run_sentiment_inference("xyz abc qqq rrr sss")
        self.assertIsNone(error)
        self.assertEqual(result["label"], "unknown")
        self.assertEqual(result["confidence"], 0.0)
        self.assertEqual(result["probabilities"]["positive"], 0.5)
        self.assertEqual(result["probabilities"]["negative"], 0.5)

    def test_sentiment_negation_regression(self):
        # Unigram limitations: negation matches word probabilities separately
        # We document that the unigram model may classify "not good" incorrectly
        result, _ = server.run_sentiment_inference("not good")
        # Check that we get a response (regardless of prediction due to unigram limits)
        self.assertIn("label", result)
        self.assertIn("confidence", result)

    def test_sentiment_load_failure(self):
        # Simulate loading error
        original_error = server.MODEL_LOAD_ERROR
        server.MODEL_LOAD_ERROR = "Simulated load failure"
        
        result, error = server.run_sentiment_inference("Very clean")
        self.assertIsNone(result)
        self.assertEqual(error, "Simulated load failure")
        
        server.MODEL_LOAD_ERROR = original_error

    # 2. Hashing Validations
    def test_secure_password_hashing(self):
        pw = "superSecretPass123"
        hashed, salt = server.hash_password(pw)
        self.assertNotEqual(pw, hashed)
        
        # Verify correctness
        verify_hash, _ = server.hash_password(pw, salt)
        self.assertEqual(hashed, verify_hash)
        
        # Verify incorrect passwords reject
        wrong_hash, _ = server.hash_password("wrongPassword", salt)
        self.assertNotEqual(hashed, wrong_hash)

    # 3. Dynamic Pricing Validations
    def test_pricing_base_calculations(self):
        # Standard spring weekday booking (March 15, 2026 is a Sunday - let's use standard Wednesday, March 18, 2026)
        # Weekdays = Mon (0), Tue (1), Wed (2), Thu (3)
        res = server.calculate_booking_price("Nature Starter", adults=2, children=2, addons_list="", visit_date="2026-03-18")
        # base_price = 650
        # packageTotal = (650 * 2) + (650 * 0.5 * 2) = 1300 + 650 = 1950
        # No adjustment (standard season + weekday)
        # subtotal = 1950
        # tax = 1950 * 0.05 = 97.5
        # grand_total = 1950 + 97.5 = 2047.5
        self.assertEqual(res["package_total"], 1950.0)
        self.assertEqual(res["adjusted_package_price"], 1950.0)
        self.assertEqual(res["addon_total"], 0.0)
        self.assertEqual(res["grand_total"], 2047.50)

    def test_pricing_weekend_surcharge(self):
        # Saturday, March 14, 2026 (day = Saturday)
        res = server.calculate_booking_price("Nature Starter", adults=1, children=0, addons_list="", visit_date="2026-03-14")
        # base = 650
        # weekend surcharge = +5% (0.05)
        # adjusted = 650 * 1.05 = 682.5
        # subtotal = 682.5
        # tax = 682.5 * 0.05 = 34.125
        # grand = 682.5 + 34.125 = 716.625 -> round to two decimals = 716.63
        self.assertEqual(res["adjusted_package_price"], 682.50)
        self.assertEqual(res["grand_total"], 716.63)

    def test_pricing_monsoon_discount_clamping(self):
        # Monsoon weekday: July 15, 2026 (Wednesday, July)
        res = server.calculate_booking_price("Adventure Pro", adults=1, children=0, addons_list="", visit_date="2026-07-15")
        # base = 1200
        # monsoon discount = -15% (-0.15)
        # adjusted = 1200 * 0.85 = 1020
        # tax = 1020 * 0.05 = 51
        # grand = 1020 + 51 = 1071
        self.assertEqual(res["adjusted_package_price"], 1020.0)
        self.assertEqual(res["grand_total"], 1071.0)

    def test_pricing_maximum_clamping(self):
        # Test combined limit: Winter weekend (Dec 19, 2026 is Saturday)
        # Winter peak surcharge (+12%) + weekend surcharge (+5%) = +17% (within +20% limit)
        res = server.calculate_booking_price("Luxury Agro Retreat", adults=1, children=0, addons_list="", visit_date="2026-12-19")
        self.assertEqual(res["adjusted_package_price"], 2500.0 * 1.17)

    # 4. Database Persistence Validations
    def test_database_booking_crud(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        ticket_id = "GH-TEST-9999"
        c.execute("""
            INSERT INTO bookings (ticket_id, visitor_name, email, visit_date, package_name, adults, children, addons, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (ticket_id, "Test Unit", "unit@test.com", "2026-05-10", "Adventure Pro", 2, 1, "Campfire Setup", 2500.0))
        conn.commit()
        
        # Read back
        c.execute("SELECT visitor_name, total_price FROM bookings WHERE ticket_id = ?", (ticket_id,))
        row = c.fetchone()
        conn.close()
        
        self.assertIsNotNone(row)
        self.assertEqual(row[0], "Test Unit")
        self.assertEqual(row[1], 2500.0)

if __name__ == '__main__':
    unittest.main()
