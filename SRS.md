# Software Requirements Specification (SRS) - AgraRide

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for AgraRide, a carpooling application for Agra, India.

### 1.2 Scope
AgraRide is a web-based carpooling platform that connects drivers and passengers traveling on similar routes within Agra city. It includes real-time GPS tracking, in-app messaging, booking management, and an admin dashboard.

### 1.3 Definitions
- **Driver**: User offering a ride
- **Passenger**: User booking a ride
- **Ride**: A journey from origin to destination
- **Booking**: A passenger's request to join a ride
- **Counter-offer**: Passenger's proposed alternative price

---

## 2. Overall Description

### 2.1 Product Perspective
AgraRide is a standalone web application with:
- React-based frontend
- Express.js backend
- SQLite database
- OpenStreetMap integration

### 2.2 Product Functions
- User registration and authentication
- Ride creation and management
- Ride search and booking
- Real-time GPS tracking
- In-app messaging
- Rating and review system
- SOS emergency alerts
- Admin dashboard

### 2.3 User Classes
1. **Regular Users** - Drivers and passengers
2. **Administrators** - System managers

### 2.4 Operating Environment
- **Client**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server**: Node.js 18+
- **Database**: SQLite 3
- **Network**: Internet connection required

---

## 3. Functional Requirements

### 3.1 User Authentication

**FR-1.1**: System shall allow users to register with name, email, password, phone, gender, and vehicle type.

**FR-1.2**: System shall authenticate users with email and password.

**FR-1.3**: System shall maintain user sessions using localStorage.

**FR-1.4**: System shall support two roles: 'user' and 'admin'.

### 3.2 Ride Management

**FR-2.1**: Drivers shall be able to create rides with:
- Origin and destination (with GPS coordinates)
- Departure time
- Available seats (1-6)
- Price per seat
- Vehicle type

**FR-2.2**: System shall display all active rides to passengers.

**FR-2.3**: Drivers shall be able to edit and delete their rides.

**FR-2.4**: System shall automatically mark rides as completed when destination is reached.

### 3.3 Booking System

**FR-3.1**: Passengers shall be able to book available rides.

**FR-3.2**: Passengers shall be able to make counter-offers on ride prices.

**FR-3.3**: Drivers shall receive booking requests and counter-offers.

**FR-3.4**: Drivers shall be able to accept or reject bookings.

**FR-3.5**: System shall prevent duplicate bookings for same ride.

**FR-3.6**: System shall reduce available seats when booking is confirmed.

**FR-3.7**: System shall track booking status: pending, confirmed, rejected.

### 3.4 Real-Time GPS Tracking

**FR-4.1**: System shall capture driver's GPS location during active rides.

**FR-4.2**: System shall update location every 3 seconds.

**FR-4.3**: System shall display driver location on map for passengers.

**FR-4.4**: System shall show route from origin to destination.

**FR-4.5**: System shall calculate distance and ETA.

### 3.5 Messaging System

**FR-5.1**: Users shall be able to send messages to other users in same ride.

**FR-5.2**: System shall maintain message history per ride.

**FR-5.3**: System shall display inbox with all conversations.

**FR-5.4**: Messages shall be ordered chronologically.

### 3.6 Rating System

**FR-6.1**: Users shall be able to rate other users after completed rides.

**FR-6.2**: Ratings shall be on 1-5 star scale.

**FR-6.3**: Users shall be able to add optional written reviews.

**FR-6.4**: System shall calculate and display average ratings.

**FR-6.5**: System shall display recent reviews on user profiles.

### 3.7 SOS Emergency System

**FR-7.1**: Users shall be able to trigger SOS alerts during rides.

**FR-7.2**: SOS alerts shall be immediately visible on admin dashboard.

**FR-7.3**: SOS alerts shall include ride details and participant information.

**FR-7.4**: Admins shall be able to resolve SOS alerts.

### 3.8 Admin Dashboard

**FR-8.1**: Admins shall view system statistics (users, rides, bookings).

**FR-8.2**: Admins shall manage all users (view, delete, change roles).

**FR-8.3**: Admins shall manage all rides (view, complete, delete).

**FR-8.4**: Admins shall monitor active SOS alerts.

**FR-8.5**: Admins shall have direct database access.

**FR-8.6**: Admins shall be able to execute SQL queries.

### 3.9 User Profile

**FR-9.1**: Users shall view their profile with statistics.

**FR-9.2**: Users shall edit their profile information.

**FR-9.3**: System shall display user's total rides, ratings, and reviews.

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-1.1**: System shall load pages within 2 seconds.

**NFR-1.2**: API responses shall complete within 1 second.

**NFR-1.3**: Location updates shall occur every 3 seconds.

**NFR-1.4**: System shall support at least 100 concurrent users.

### 4.2 Security

**NFR-2.1**: System shall validate all user inputs.

**NFR-2.2**: System shall use parameterized SQL queries to prevent injection.

**NFR-2.3**: System shall implement role-based access control.

**NFR-2.4**: Production system shall use password hashing.

**NFR-2.5**: Production system shall use HTTPS encryption.

### 4.3 Usability

**NFR-3.1**: Interface shall be intuitive and easy to navigate.

**NFR-3.2**: System shall be responsive on mobile, tablet, and desktop.

**NFR-3.3**: System shall provide clear error messages.

**NFR-3.4**: System shall use consistent design language (orange theme).

### 4.4 Reliability

**NFR-4.1**: System shall have 99% uptime.

**NFR-4.2**: System shall handle errors gracefully without crashing.

**NFR-4.3**: Database shall maintain data integrity with foreign keys.

### 4.5 Maintainability

**NFR-5.1**: Code shall be well-documented with comments.

**NFR-5.2**: System shall use TypeScript for type safety.

**NFR-5.3**: Code shall follow consistent naming conventions.

**NFR-5.4**: System shall have modular component structure.

### 4.6 Portability

**NFR-6.1**: System shall run on Windows, macOS, and Linux.

**NFR-6.2**: Frontend shall work on all modern browsers.

**NFR-6.3**: System shall be accessible on local network.

---

## 5. System Features

### 5.1 User Authentication
- Priority: High
- Risk: Low
- Complexity: Low

### 5.2 Ride Management
- Priority: High
- Risk: Medium
- Complexity: Medium

### 5.3 Booking System
- Priority: High
- Risk: Medium
- Complexity: High

### 5.4 GPS Tracking
- Priority: High
- Risk: High
- Complexity: High

### 5.5 Messaging
- Priority: Medium
- Risk: Low
- Complexity: Medium

### 5.6 Rating System
- Priority: Medium
- Risk: Low
- Complexity: Low

### 5.7 SOS Alerts
- Priority: High
- Risk: Medium
- Complexity: Medium

### 5.8 Admin Dashboard
- Priority: High
- Risk: Low
- Complexity: Medium

---

## 6. External Interface Requirements

### 6.1 User Interfaces
- Web-based responsive interface
- Orange color theme (#f97316)
- Minimal rounded borders (rounded-lg)
- Tailwind CSS styling
- Framer Motion animations

### 6.2 Hardware Interfaces
- GPS-enabled devices for location tracking
- Standard computer/mobile hardware

### 6.3 Software Interfaces
- **OpenStreetMap**: Map tiles and visualization
- **Nominatim**: Geocoding and reverse geocoding
- **Browser Geolocation API**: GPS coordinates

### 6.4 Communication Interfaces
- HTTP/HTTPS protocol
- RESTful API
- JSON data format

---

## 7. Other Requirements

### 7.1 Database Requirements
- SQLite 3 database
- 7 tables with relationships
- Foreign key constraints
- Auto-incrementing primary keys

### 7.2 Legal Requirements
- User data privacy
- Terms of service
- Privacy policy

### 7.3 Localization
- Focus on Agra city
- Indian Rupee (₹) currency
- English language interface

---

## 8. Appendix

### 8.1 Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: SQLite with better-sqlite3
- **Maps**: Leaflet, OpenStreetMap
- **Build Tool**: Vite

### 8.2 Default Admin Credentials
- Email: `admin@agraride.com`
- Password: `admin`

### 8.3 API Endpoints
- 40+ RESTful API endpoints
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format

---

**Document Version**: 1.0
**Last Updated**: March 2026
**Status**: Active Development
