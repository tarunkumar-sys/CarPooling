/**
 * Database Configuration and Schema Setup
 * 
 * This file initializes the SQLite database with all required tables:
 * - users: User accounts (drivers and passengers)
 * - rides: Ride offerings with route and pricing details
 * - bookings: Booking requests and confirmations
 * - locations: Real-time GPS location tracking
 * - messages: In-app chat between users
 * - ratings: User rating and review system
 * - sos_alerts: Emergency alert system
 */

import Database from 'better-sqlite3';
import path from 'path';

// Initialize SQLite database connection
const db = new Database('agraride.db');

// ========== CREATE DATABASE TABLES ==========

db.exec(`
  -- Users table: Stores all user accounts (drivers, passengers, admins)
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',  -- 'user' or 'admin'
    phone TEXT,
    gender TEXT,  -- 'male', 'female', 'other'
    vehicle_type TEXT  -- 'bike', '4-wheeler', 'scooter'
  );

  -- Rides table: Stores ride offerings from drivers
  CREATE TABLE IF NOT EXISTS rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    available_seats INTEGER NOT NULL,
    price_per_seat REAL NOT NULL,
    status TEXT DEFAULT 'active',  -- 'active', 'completed', 'cancelled'
    FOREIGN KEY (driver_id) REFERENCES users (id)
  );

  -- Bookings table: Stores passenger booking requests
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    passenger_id INTEGER,
    seats_booked INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',  -- 'pending', 'confirmed', 'rejected', 'cancelled'
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (passenger_id) REFERENCES users (id)
  );

  -- Locations table: Real-time GPS tracking for active rides
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    latitude REAL,
    longitude REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides (id)
  );

  -- Messages table: In-app chat between users
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id)
  );

  -- Ratings table: User reviews and ratings after completed rides
  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    rater_id INTEGER,
    rated_user_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (rater_id) REFERENCES users (id),
    FOREIGN KEY (rated_user_id) REFERENCES users (id)
  );

  -- SOS Alerts table: Emergency alerts during rides
  CREATE TABLE IF NOT EXISTS sos_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER,
    user_id INTEGER,
    status TEXT DEFAULT 'active',  -- 'active', 'resolved'
    resolved_reason TEXT,  -- Reason provided when resolving SOS
    resolved_by INTEGER,   -- Admin user ID who resolved the SOS
    resolved_at DATETIME,  -- Timestamp when SOS was resolved
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (resolved_by) REFERENCES users (id)
  );
`);

// ========== ALTER TABLES (Add missing columns for existing databases) ==========

// Add gender column if it doesn't exist
try { db.exec("ALTER TABLE users ADD COLUMN gender TEXT;"); } catch (e) {}

// Add vehicle_type column if it doesn't exist
try { db.exec("ALTER TABLE users ADD COLUMN vehicle_type TEXT;"); } catch (e) {}

// Add status column to bookings if it doesn't exist
try { db.exec("ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'pending';"); } catch (e) {}

// Add counter_offer_price column to bookings for negotiation feature
try { db.exec("ALTER TABLE bookings ADD COLUMN counter_offer_price REAL;"); } catch (e) {}

// Add user_id to locations for multi-user tracking
try { db.exec("ALTER TABLE locations ADD COLUMN user_id INTEGER;"); } catch (e) {}

// Add GPS coordinates to rides for map integration
try { db.exec("ALTER TABLE rides ADD COLUMN origin_lat REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN origin_lng REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN dest_lat REAL;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN dest_lng REAL;"); } catch (e) {}

// Add driver_vehicle and driver_vehicle_description to rides table
try { db.exec("ALTER TABLE rides ADD COLUMN driver_vehicle TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN driver_vehicle_description TEXT;"); } catch (e) {}

// Add license plate verification tracking
try { db.exec("ALTER TABLE rides ADD COLUMN license_plate TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE rides ADD COLUMN license_plate_verified INTEGER DEFAULT 0;"); } catch (e) {}

// Add SOS resolution tracking columns
try { db.exec("ALTER TABLE sos_alerts ADD COLUMN resolved_reason TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE sos_alerts ADD COLUMN resolved_by INTEGER;"); } catch (e) {}
try { db.exec("ALTER TABLE sos_alerts ADD COLUMN resolved_at DATETIME;"); } catch (e) {}

// Add profile_image column to users table for profile photos
try { db.exec("ALTER TABLE users ADD COLUMN profile_image TEXT;"); } catch (e) {}

// Add unique constraint to ratings table to prevent duplicate ratings
try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_rating ON ratings(ride_id, rater_id, rated_user_id);"); } catch (e) {}

// ========== SEED DEFAULT ADMIN USER ==========

// Seed Admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@agraride.com');
if (!adminExists) {
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'System Admin',
    'admin@agraride.com',
    'admin', // In a real app, this would be hashed
    'admin'
  );
}

export default db;
