# Software Requirements Specification (SRS) - AgraRide

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for AgraRide, an advanced carpooling platform with AI-powered features, real-time tracking, and global location support.

### 1.2 Scope
AgraRide is a comprehensive web-based carpooling platform that provides:
- **Global Coverage**: Worldwide location support with no geographical restrictions
- **AI Integration**: Google Gemini AI-powered license plate OCR with OpenCV preprocessing
- **Real-time Features**: Live GPS tracking with 3-second update intervals
- **Smart Notifications**: Push notifications with scheduling and in-app notification center
- **Safety Features**: SOS emergency system with admin monitoring
- **Advanced UI**: React 19 with TypeScript and Tailwind CSS 4

### 1.3 Definitions
- **Driver**: User offering a ride with verified vehicle information
- **Passenger**: User booking a ride with real-time tracking access
- **OCR**: Optical Character Recognition for automatic license plate detection
- **SOS**: Emergency alert system for user safety
- **PWA**: Progressive Web Application with offline capabilities
- **Counter-offer**: Passenger's proposed alternative price with negotiation system

---

## 2. Overall Description

### 2.1 Product Perspective
AgraRide is a cutting-edge standalone web application featuring:
- **Frontend**: React 19 with TypeScript and Tailwind CSS 4
- **Backend**: Node.js 18+ with Express.js and better-sqlite3
- **AI Integration**: Google Gemini AI for OCR, OpenCV.js for image processing
- **Mapping**: OpenStreetMap with Leaflet for global coverage
- **Real-time**: WebSocket connections for live tracking

### 2.2 Product Functions
- **Advanced Authentication**: Role-based access with profile management
- **AI-Powered OCR**: Automatic license plate recognition and verification
- **Global Ride Management**: Worldwide location support with geocoding
- **Real-time Tracking**: Live GPS updates every 3 seconds during rides
- **Smart Notifications**: Push notifications with scheduling capabilities
- **Communication**: In-app messaging with notification center
- **Safety Features**: SOS emergency system with admin monitoring
- **Analytics Dashboard**: Comprehensive administrative tools with database access

### 2.3 User Classes
1. **Regular Users** - Drivers and passengers with verified profiles
2. **System Administrators** - Advanced users with full system access
3. **Emergency Responders** - Users monitoring SOS alerts

### 2.4 Operating Environment
- **Client**: Modern browsers with PWA support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Server**: Node.js 18+ with TypeScript support
- **Database**: SQLite 3 with better-sqlite3 driver
- **Network**: Internet required, offline capabilities for core features
- **Hardware**: GPS-enabled devices, camera for OCR functionality

---

## 3. Functional Requirements

### 3.1 User Authentication and Management

**FR-1.1**: System shall allow users to register with comprehensive profile information including name, email, password, phone, gender, vehicle type, and profile image.

**FR-1.2**: System shall authenticate users with secure session management and role-based access control.

**FR-1.3**: System shall maintain user sessions with localStorage and provide profile management capabilities.

**FR-1.4**: System shall support multiple roles: 'user', 'admin', and emergency responder roles.

### 3.2 Advanced Ride Management

**FR-2.1**: Drivers shall create rides with comprehensive details including:
- Global origin and destination with GPS coordinates
- Departure time with timezone support
- Available seats (1-6) and price per seat
- Vehicle type and detailed description
- AI-verified license plate information

**FR-2.1a**: System shall provide AI-powered License Plate OCR featuring:
- Camera-based image capture with compression
- OpenCV.js preprocessing (grayscale, denoise, edge detection, contour detection)
- Google Gemini AI text extraction with high accuracy
- Indian license plate format validation (UP80AB1234 pattern)
- Tesseract.js fallback OCR for offline processing
- Visual verification indicator with confidence scoring
- Auto-fill vehicle description with extracted plate number

**FR-2.2**: System shall display all active rides with advanced filtering and sorting options.

**FR-2.3**: Drivers shall edit and delete rides with proper validation and notification to affected passengers.

**FR-2.4**: System shall automatically manage ride lifecycle with status tracking and completion detection.

### 3.3 Advanced Booking System

**FR-3.1**: Passengers shall book rides with seat selection and optional counter-offer pricing.

**FR-3.2**: System shall support price negotiation with counter-offer functionality and acceptance/rejection workflow.

**FR-3.3**: Drivers shall receive real-time booking notifications with detailed passenger information.

**FR-3.4**: System shall manage booking states: pending, confirmed, rejected, cancelled, completed with proper transitions.

**FR-3.5**: System shall prevent overbooking with real-time seat availability tracking.

**FR-3.6**: System shall automatically update available seats and send confirmations to all parties.

### 3.4 Real-Time GPS Tracking System

**FR-4.1**: System shall capture and process driver GPS location with 3-second update intervals during active rides.

**FR-4.2**: System shall provide live location updates to passengers with route visualization and progress tracking.

**FR-4.3**: System shall display interactive maps with route from origin to destination using OpenStreetMap.

**FR-4.4**: System shall calculate and update ETA with traffic considerations and route optimization.

**FR-4.5**: System shall provide heading/direction indicators and distance tracking with milestone notifications.

### 3.5 Smart Notification System

**FR-5.1**: System shall send browser push notifications for critical events with proper permission handling.

**FR-5.2**: System shall provide scheduled notifications including 30-minute departure reminders and ride status updates.

**FR-5.3**: System shall maintain comprehensive notification center with badge counts, read/unread status, and history.

**FR-5.4**: System shall support multiple notification types: booking events, ride updates, emergency alerts, and system announcements.

### 3.6 Global Location Services

**FR-6.1**: System shall provide worldwide location picker with interactive map interface and search functionality.

**FR-6.2**: System shall support multiple geocoding strategies with Nominatim API and coordinate fallback.

**FR-6.3**: System shall implement location validation with reverse geocoding and automatic map adjustment.

**FR-6.4**: System shall provide current location detection with 5-second timeout protection and offline coordinate selection.

### 3.7 Communication and Messaging

**FR-7.1**: Users shall send contextual messages related to specific rides with real-time delivery.

**FR-7.2**: System shall maintain comprehensive message history per ride with chronological ordering.

**FR-7.3**: System shall provide inbox interface with conversation management and unread indicators.

**FR-7.4**: System shall support message notifications and delivery confirmations.

### 3.8 Rating and Review System

**FR-8.1**: Users shall rate each other after completed rides using 1-5 star scale with optional written reviews.

**FR-8.2**: System shall calculate and display average ratings with review history and statistics.

**FR-8.3**: System shall provide rating analytics and user reputation management.

**FR-8.4**: System shall display recent reviews on user profiles with moderation capabilities.

### 3.9 Emergency SOS System

**FR-9.1**: Users shall trigger SOS alerts during rides with one-click emergency button.

**FR-9.2**: System shall immediately notify administrators with ride details, participant information, and location data.

**FR-9.3**: System shall provide emergency response dashboard with alert management and resolution tracking.

**FR-9.4**: System shall maintain emergency contact integration and escalation procedures.

### 3.10 Advanced Admin Dashboard

**FR-10.1**: Administrators shall access comprehensive system statistics including users, rides, bookings, and performance metrics.

**FR-10.2**: Administrators shall manage all users with view, edit, delete, and role change capabilities.

**FR-10.3**: Administrators shall monitor all rides with status management, completion controls, and deletion capabilities.

**FR-10.4**: Administrators shall have direct database access with SQL query execution and backup management.

**FR-10.5**: Administrators shall monitor active SOS alerts with response tracking and resolution management.

### 3.11 User Profile and Statistics

**FR-11.1**: Users shall view comprehensive profiles with ride statistics, ratings, and achievement tracking.

**FR-11.2**: Users shall edit profile information with image upload and verification status display.

**FR-11.3**: System shall display user statistics including total rides, average ratings, and review summaries.

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

**NFR-1.1**: System shall load pages within 2 seconds with optimized bundle sizes and code splitting.

**NFR-1.2**: API responses shall complete within 1 second with proper database indexing and query optimization.

**NFR-1.3**: Location updates shall occur every 3 seconds with WebSocket connections and fallback polling.

**NFR-1.4**: System shall support minimum 100 concurrent users with horizontal scaling capabilities.

**NFR-1.5**: OCR processing shall complete within 5 seconds with Google Gemini AI and Tesseract.js fallback.

### 4.2 Security Requirements

**NFR-2.1**: System shall validate all user inputs with comprehensive server-side validation and sanitization.

**NFR-2.2**: System shall use parameterized SQL queries with better-sqlite3 to prevent injection attacks.

**NFR-2.3**: System shall implement role-based access control with JWT tokens and session management.

**NFR-2.4**: Production system shall use bcrypt password hashing with salt rounds and secure session storage.

**NFR-2.5**: Production system shall enforce HTTPS encryption with proper SSL certificate management.

**NFR-2.6**: System shall implement Content Security Policy (CSP) and XSS protection mechanisms.

### 4.3 Usability Requirements

**NFR-3.1**: Interface shall be intuitive with React 19 components and consistent design patterns.

**NFR-3.2**: System shall be fully responsive on mobile, tablet, and desktop with Tailwind CSS 4.

**NFR-3.3**: System shall provide clear, actionable error messages with proper validation feedback.

**NFR-3.4**: System shall use consistent orange theme (#f97316) with semantic color system for actions.

**NFR-3.5**: System shall comply with WCAG 2.1 AA accessibility standards with proper ARIA labels.

### 4.4 Reliability Requirements

**NFR-4.1**: System shall maintain 99% uptime with proper error handling and graceful degradation.

**NFR-4.2**: System shall handle errors gracefully without crashing with comprehensive try-catch blocks.

**NFR-4.3**: Database shall maintain data integrity with foreign key constraints and transaction management.

**NFR-4.4**: System shall provide automatic recovery from common failures with retry mechanisms.

### 4.5 Maintainability Requirements

**NFR-5.1**: Code shall be well-documented with TypeScript interfaces and comprehensive comments.

**NFR-5.2**: System shall use TypeScript for type safety across frontend and backend components.

**NFR-5.3**: Code shall follow consistent naming conventions with ESLint and Prettier configuration.

**NFR-5.4**: System shall have modular component structure with reusable React components and hooks.

**NFR-5.5**: System shall include comprehensive testing with Jest and React Testing Library.

### 4.6 Portability Requirements

**NFR-6.1**: System shall run on Windows, macOS, and Linux with Node.js 18+ support.

**NFR-6.2**: Frontend shall work on all modern browsers with progressive enhancement.

**NFR-6.3**: System shall be accessible on local network with proper CORS configuration.

**NFR-6.4**: System shall support offline functionality with Service Workers and local storage.

---

## 5. System Features

### 5.1 AI-Powered License Plate Recognition
- **Priority**: High | **Risk**: Medium | **Complexity**: High
- Google Gemini AI integration with OpenCV preprocessing
- Tesseract.js fallback for offline processing
- Indian license plate format validation
- Visual verification indicators

### 5.2 Real-Time GPS Tracking System
- **Priority**: High | **Risk**: High | **Complexity**: High
- 3-second location update intervals
- WebSocket-based real-time communication
- Route visualization with OpenStreetMap
- ETA calculation with traffic considerations

### 5.3 Smart Notification System
- **Priority**: High | **Risk**: Low | **Complexity**: Medium
- Browser push notifications with permission handling
- Scheduled notifications and reminders
- In-app notification center with badge counts
- Multiple notification types and delivery methods

### 5.4 Global Location Support
- **Priority**: High | **Risk**: Medium | **Complexity**: Medium
- Worldwide location picker with no restrictions
- Nominatim geocoding with coordinate fallback
- Interactive map-based selection
- Multi-tier search strategies

### 5.5 Emergency SOS System
- **Priority**: High | **Risk**: Medium | **Complexity**: Medium
- One-click emergency alerts
- Admin monitoring dashboard
- Real-time location sharing during emergencies
- Escalation procedures and response tracking

### 5.6 Advanced Booking Management
- **Priority**: High | **Risk**: Medium | **Complexity**: High
- Counter-offer pricing system
- Real-time seat availability tracking
- Booking state management
- Automated notifications and confirmations

### 5.7 Comprehensive Admin Dashboard
- **Priority**: High | **Risk**: Low | **Complexity**: Medium
- System statistics and analytics
- User and ride management
- Direct database access with SQL queries
- SOS alert monitoring and response

### 5.8 Rating and Review System
- **Priority**: Medium | **Risk**: Low | **Complexity**: Low
- 1-5 star rating system
- Written reviews and feedback
- Average rating calculations
- User reputation management

---

## 6. External Interface Requirements

### 6.1 User Interfaces
- **Framework**: React 19 with TypeScript and Tailwind CSS 4
- **Design System**: Orange theme (#f97316) with semantic color coding
- **Responsive Design**: Mobile-first approach with breakpoints at 640px, 1024px
- **Accessibility**: WCAG 2.1 AA compliance with proper ARIA labels
- **PWA Features**: Service Workers, offline functionality, app-like experience

### 6.2 Hardware Interfaces
- **GPS Hardware**: GPS-enabled devices for location tracking with 10m accuracy
- **Camera Hardware**: Device camera for license plate OCR (minimum 2MP resolution)
- **Touch Interface**: Touch-friendly targets (44x44px minimum) for mobile devices
- **Network Hardware**: Internet connectivity (3G/4G/5G/WiFi) for real-time features

### 6.3 Software Interfaces

#### 6.3.1 Google Gemini AI API
- **Purpose**: Advanced license plate text extraction
- **Protocol**: HTTPS REST API with JSON responses
- **Authentication**: API key-based with rate limiting
- **Fallback**: Tesseract.js for offline processing

#### 6.3.2 OpenStreetMap Services
- **Purpose**: Global map tiles and visualization
- **Protocol**: HTTPS tile server requests
- **Format**: PNG/JPEG map tiles with proper attribution
- **Caching**: Browser-based tile caching for performance

#### 6.3.3 Nominatim Geocoding API
- **Purpose**: Worldwide address to coordinate conversion
- **Protocol**: HTTPS REST API with rate limiting (1 req/sec)
- **Coverage**: Global geocoding with multi-language support
- **Fallback**: Coordinate-based location entry

#### 6.3.4 Browser APIs
- **Geolocation API**: Current location detection with permission handling
- **Notification API**: Push notifications with user consent
- **Service Worker API**: Offline functionality and background sync
- **Camera API**: Image capture for OCR processing

### 6.4 Communication Interfaces
- **HTTP/HTTPS**: RESTful API communication with JSON format
- **WebSocket**: Real-time location updates with Socket.io
- **Security**: HTTPS encryption, CORS configuration, CSP headers
- **Authentication**: JWT tokens with secure session management

---

## 7. Other Requirements

### 7.1 Database Requirements
- **Database Engine**: SQLite 3 with better-sqlite3 driver for optimal performance
- **Schema Design**: 7 tables with comprehensive relationships and constraints
- **Data Integrity**: Foreign key constraints, ACID compliance, transaction management
- **Performance**: Proper indexing, query optimization, connection pooling
- **Backup Strategy**: Daily automated backups with point-in-time recovery

### 7.2 Legal and Compliance Requirements
- **Privacy Policy**: Comprehensive data protection and user privacy
- **Terms of Service**: Clear terms, conditions, and liability disclaimers
- **Data Protection**: GDPR-compliant data processing and user consent
- **Age Restrictions**: Minimum age requirements and verification
- **Transportation Laws**: Compliance with local carpooling regulations

### 7.3 Localization and Internationalization
- **Primary Language**: English (US) with UTF-8 encoding
- **Currency Support**: Indian Rupee (₹) primary, multi-currency future support
- **Address Formats**: Indian address format with international expansion
- **Phone Validation**: Indian phone number format with country code support
- **License Plates**: Indian format validation with regional variations

### 7.4 Technology Stack Requirements

#### 7.4.1 Frontend Technologies
- **React 19**: Latest React with concurrent features and Suspense
- **TypeScript**: Type-safe development with strict mode
- **Tailwind CSS 4**: Utility-first styling with custom design system
- **Framer Motion**: Smooth animations and transitions
- **Leaflet**: Interactive maps with OpenStreetMap integration
- **Lucide React**: Modern icon library with consistent styling

#### 7.4.2 Backend Technologies
- **Node.js 18+**: JavaScript runtime with ES modules support
- **Express.js**: Web framework with middleware support
- **Better-SQLite3**: High-performance SQLite driver
- **TypeScript**: Server-side type safety
- **Helmet**: Security middleware for HTTP headers
- **CORS**: Cross-origin resource sharing configuration

#### 7.4.3 AI and External Services
- **Google Gemini AI**: Advanced language model for OCR
- **OpenCV.js**: Computer vision for image preprocessing
- **Tesseract.js**: JavaScript OCR library for fallback
- **Nominatim**: Open-source geocoding service
- **OpenStreetMap**: Global mapping platform

---

## 8. Appendix

### 8.1 Technology Stack Details

#### 8.1.1 Frontend Architecture
- **React 19**: Component-based architecture with hooks and context
- **TypeScript**: Strict type checking with interfaces and generics
- **Tailwind CSS 4**: Utility-first styling with custom configuration
- **Vite**: Fast build tool with hot module replacement
- **PWA**: Service Workers for offline functionality

#### 8.1.2 Backend Architecture
- **Node.js 18+**: Event-driven, non-blocking I/O
- **Express.js**: RESTful API with middleware pipeline
- **Better-SQLite3**: Synchronous SQLite operations
- **TypeScript**: Server-side type safety and interfaces
- **Security**: Helmet, CORS, input validation

#### 8.1.3 AI and Computer Vision
- **Google Gemini AI**: State-of-the-art language model for OCR
- **OpenCV.js**: Image preprocessing and computer vision
- **Tesseract.js**: Open-source OCR engine for fallback
- **Image Processing**: Compression, format conversion, validation

#### 8.1.4 Mapping and Location Services
- **OpenStreetMap**: Global map data and tiles
- **Leaflet**: Interactive map library with plugins
- **Nominatim**: Geocoding and reverse geocoding
- **Geolocation API**: Browser-based location services

### 8.2 API Endpoints Summary

#### 8.2.1 Authentication & Users
```
POST /api/auth/register - User registration with validation
POST /api/auth/login - User authentication with session
POST /api/auth/logout - Session termination
GET /api/auth/profile - User profile retrieval
PUT /api/auth/profile - Profile updates with image upload
```

#### 8.2.2 Ride Management
```
GET /api/rides - Active rides with filtering
GET /api/rides/:id - Detailed ride information
POST /api/rides - Ride creation with validation
PUT /api/rides/:id - Ride updates and modifications
DELETE /api/rides/:id - Ride cancellation
GET /api/rides/driver/:driverId - Driver's ride history
```

#### 8.2.3 Booking System
```
GET /api/bookings/passenger/:passengerId - Passenger bookings
GET /api/bookings/ride/:rideId - Ride booking details
POST /api/bookings - Booking creation with counter-offers
PUT /api/bookings/:id/accept - Booking acceptance
PUT /api/bookings/:id/reject - Booking rejection
PUT /api/bookings/:id/cancel - Booking cancellation
```

#### 8.2.4 Advanced Features
```
POST /api/ocr/extract - License plate OCR processing
GET /api/notifications/:userId - User notifications
POST /api/messages - Message sending
GET /api/messages/:userId - Message history
POST /api/sos - Emergency alert creation
GET /api/admin/stats - System statistics
```

### 8.3 Database Schema Details

#### 8.3.1 Enhanced Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  phone TEXT,
  gender TEXT,
  vehicle_type TEXT,
  profile_image TEXT,
  average_rating REAL DEFAULT 0,
  total_rides INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT 0,
  phone_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 8.3.2 Enhanced Rides Table
```sql
CREATE TABLE rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id INTEGER NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_lat REAL NOT NULL,
  origin_lng REAL NOT NULL,
  dest_lat REAL NOT NULL,
  dest_lng REAL NOT NULL,
  departure_time DATETIME NOT NULL,
  available_seats INTEGER NOT NULL,
  price_per_seat REAL NOT NULL,
  status TEXT DEFAULT 'active',
  driver_vehicle TEXT,
  driver_vehicle_description TEXT,
  license_plate TEXT,
  license_plate_verified BOOLEAN DEFAULT 0,
  ocr_confidence REAL,
  distance_km REAL,
  estimated_duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id)
);
```

#### 8.3.3 Enhanced Bookings Table
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_id INTEGER NOT NULL,
  passenger_id INTEGER NOT NULL,
  seats_booked INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  counter_offer_price REAL,
  accepted_price REAL,
  booking_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmation_time DATETIME,
  cancellation_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(id),
  FOREIGN KEY (passenger_id) REFERENCES users(id)
);
```

### 8.4 Default Configuration

#### 8.4.1 Admin Credentials
- **Email**: `admin@agraride.com`
- **Password**: `admin123` (change in production)
- **Role**: `admin`
- **Permissions**: Full system access

#### 8.4.2 Environment Variables
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=./agraride.db
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_session_secret
CORS_ORIGIN=https://yourdomain.com
UPLOAD_MAX_SIZE=10485760
OCR_TIMEOUT=30000
```

---

**Document Version**: 2.0
**Last Updated**: April 12, 2026
**Status**: Production Ready
**Next Review**: July 2026
