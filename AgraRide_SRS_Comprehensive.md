# SOFTWARE REQUIREMENTS SPECIFICATION

## AgraRide - Carpooling Platform

---

**Document Information:**
- **Document Title:** Software Requirements Specification for AgraRide
- **Version:** 2.0
- **Date:** April 12, 2026
- **Status:** Final
- **Classification:** Internal Use
- **Prepared by:** Development Team
- **Approved by:** Project Manager

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | March 2026 | Development Team | Initial Draft |
| 1.5 | March 2026 | Development Team | Added AI OCR Features |
| 2.0 | April 2026 | Development Team | Final Version with Complete Features |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [System Features](#4-system-features)
5. [External Interface Requirements](#5-external-interface-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Other Requirements](#7-other-requirements)
8. [Appendices](#8-appendices)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for AgraRide, an advanced carpooling platform designed to connect drivers and passengers for sustainable transportation. The system incorporates cutting-edge technologies including AI-powered license plate recognition, real-time GPS tracking, and comprehensive notification systems.

### 1.2 Scope

AgraRide is a web-based carpooling application that provides:
- **Core Functionality:** Ride offering, searching, and booking
- **Advanced Features:** AI-powered OCR, real-time tracking, smart notifications
- **Safety Features:** SOS emergency system, user verification
- **Administrative Tools:** Comprehensive dashboard and database management
- **Global Reach:** Worldwide location support with no geographical restrictions

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **Driver** | User offering a ride in their vehicle |
| **Passenger** | User booking a seat in an available ride |
| **OCR** | Optical Character Recognition for license plate scanning |
| **GPS** | Global Positioning System for location tracking |
| **SOS** | Emergency alert system |
| **API** | Application Programming Interface |
| **UI/UX** | User Interface/User Experience |
| **PWA** | Progressive Web Application |

### 1.4 References

- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- W3C Web Content Accessibility Guidelines (WCAG) 2.1
- Google Maps API Documentation
- OpenStreetMap API Documentation
- React 19 Documentation
- Node.js Documentation

### 1.5 Overview

This SRS document is organized into eight main sections covering system introduction, overall description, specific requirements, system features, interface requirements, non-functional requirements, other requirements, and appendices.

---

## 2. Overall Description

### 2.1 Product Perspective

AgraRide is a standalone web application that operates as:
- **Frontend:** React 19-based Progressive Web Application
- **Backend:** Node.js with Express framework
- **Database:** SQLite with better-sqlite3 for optimal performance
- **Integration:** Multiple third-party services for enhanced functionality

#### 2.1.1 System Context Diagram

```
[Users] ↔ [AgraRide Web App] ↔ [Backend Services]
                ↓
[External Services: Google Gemini AI, OpenStreetMap, Nominatim]
```

### 2.2 Product Functions

#### 2.2.1 Core Functions
- **User Management:** Registration, authentication, profile management
- **Ride Management:** Create, search, book, and manage rides
- **Real-time Tracking:** Live GPS location updates during rides
- **Communication:** In-app messaging between users
- **Payment Integration:** Price negotiation and counter-offers

#### 2.2.2 Advanced Functions
- **AI-Powered OCR:** Automatic license plate recognition and verification
- **Smart Notifications:** Push notifications with scheduling capabilities
- **Emergency System:** SOS alerts with admin monitoring
- **Analytics Dashboard:** Comprehensive administrative tools
- **Global Location Support:** Worldwide geocoding and mapping

### 2.3 User Classes and Characteristics

#### 2.3.1 Regular Users (Drivers/Passengers)
- **Technical Expertise:** Basic to intermediate computer skills
- **Usage Frequency:** Daily to weekly usage
- **Primary Goals:** Safe, convenient, and cost-effective transportation

#### 2.3.2 System Administrators
- **Technical Expertise:** Advanced technical skills
- **Usage Frequency:** Daily monitoring and management
- **Primary Goals:** System maintenance, user support, security monitoring

### 2.4 Operating Environment

#### 2.4.1 Client Environment
- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Devices:** Desktop computers, tablets, smartphones
- **Operating Systems:** Windows, macOS, Linux, iOS, Android
- **Network:** Internet connection required (3G/4G/5G/WiFi)

#### 2.4.2 Server Environment
- **Runtime:** Node.js 18+
- **Operating System:** Linux/Windows/macOS
- **Database:** SQLite 3
- **Memory:** Minimum 2GB RAM
- **Storage:** Minimum 10GB available space

### 2.5 Design and Implementation Constraints

#### 2.5.1 Technical Constraints
- Must be responsive and mobile-friendly
- Must work offline for core features
- Must support real-time updates
- Must integrate with external mapping services

#### 2.5.2 Regulatory Constraints
- Must comply with data protection regulations
- Must implement user privacy controls
- Must provide terms of service and privacy policy

### 2.6 Assumptions and Dependencies

#### 2.6.1 Assumptions
- Users have access to GPS-enabled devices
- Users have basic internet connectivity
- Users understand carpooling concepts

#### 2.6.2 Dependencies
- Google Gemini AI API availability
- OpenStreetMap service reliability
- Nominatim geocoding service
- Browser geolocation API support

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Authentication and Management

**REQ-001: User Registration**
- **Priority:** High
- **Description:** System shall allow users to register with name, email, password, phone, gender, and vehicle type
- **Input:** User registration form data
- **Processing:** Validate data, hash password, store in database
- **Output:** User account creation confirmation

**REQ-002: User Authentication**
- **Priority:** High
- **Description:** System shall authenticate users with email and password
- **Input:** Login credentials
- **Processing:** Verify credentials against database
- **Output:** Authentication token and user session

**REQ-003: Profile Management**
- **Priority:** Medium
- **Description:** Users shall be able to view and edit their profile information
- **Input:** Updated profile data
- **Processing:** Validate and update user information
- **Output:** Profile update confirmation

#### 3.1.2 Ride Management System

**REQ-004: Ride Creation**
- **Priority:** High
- **Description:** Drivers shall be able to create rides with comprehensive details
- **Input:** Origin, destination, departure time, seats, price, vehicle details
- **Processing:** Validate data, geocode locations, store ride information
- **Output:** Ride creation confirmation with unique ID

**REQ-005: License Plate OCR Integration**
- **Priority:** High
- **Description:** System shall provide AI-powered license plate recognition
- **Input:** Vehicle image upload
- **Processing:** 
  - OpenCV preprocessing (grayscale, denoise, edge detection)
  - Google Gemini AI text extraction
  - Indian license plate format validation (UP80AB1234)
  - Tesseract.js fallback OCR
- **Output:** Extracted and validated license plate number

**REQ-006: Ride Search and Discovery**
- **Priority:** High
- **Description:** Passengers shall be able to search for available rides
- **Input:** Search criteria (origin, destination, date, time)
- **Processing:** Query database, calculate distances, filter results
- **Output:** List of matching rides with details

**REQ-007: Ride Booking System**
- **Priority:** High
- **Description:** Passengers shall be able to book available rides
- **Input:** Ride selection, number of seats, optional counter-offer
- **Processing:** Check availability, create booking record, notify driver
- **Output:** Booking confirmation or rejection

#### 3.1.3 Real-Time GPS Tracking

**REQ-008: Live Location Tracking**
- **Priority:** High
- **Description:** System shall track driver location during active rides
- **Input:** GPS coordinates from driver's device
- **Processing:** Update location every 3 seconds, calculate route progress
- **Output:** Real-time location updates to passengers

**REQ-009: Route Visualization**
- **Priority:** High
- **Description:** System shall display route from origin to destination
- **Input:** Origin and destination coordinates
- **Processing:** Calculate optimal route, render on map
- **Output:** Interactive map with route visualization

**REQ-010: ETA Calculation**
- **Priority:** Medium
- **Description:** System shall calculate and display estimated time of arrival
- **Input:** Current location, destination, traffic data
- **Processing:** Calculate remaining distance and time
- **Output:** Updated ETA display

#### 3.1.4 Notification System

**REQ-011: Push Notifications**
- **Priority:** High
- **Description:** System shall send browser push notifications for important events
- **Input:** Notification trigger events
- **Processing:** Generate notification content, send to user's browser
- **Output:** Browser notification display

**REQ-012: Scheduled Notifications**
- **Priority:** Medium
- **Description:** System shall send automated reminders before ride departure
- **Input:** Ride departure time
- **Processing:** Schedule notification 30 minutes before departure
- **Output:** Departure reminder notification

**REQ-013: In-App Notification Center**
- **Priority:** Medium
- **Description:** System shall maintain notification history in notification bell
- **Input:** All notification events
- **Processing:** Store notifications, mark read/unread status
- **Output:** Notification center with badge count

#### 3.1.5 Communication System

**REQ-014: In-App Messaging**
- **Priority:** Medium
- **Description:** Users shall be able to send messages related to rides
- **Input:** Message content, recipient, ride context
- **Processing:** Store message, notify recipient
- **Output:** Message delivery confirmation

**REQ-015: Message History**
- **Priority:** Medium
- **Description:** System shall maintain message history per ride
- **Input:** Message queries
- **Processing:** Retrieve messages for specific ride/conversation
- **Output:** Chronological message list

#### 3.1.6 Rating and Review System

**REQ-016: Post-Ride Rating**
- **Priority:** Medium
- **Description:** Users shall be able to rate each other after completed rides
- **Input:** Rating (1-5 stars), optional written review
- **Processing:** Store rating, update user's average rating
- **Output:** Rating submission confirmation

**REQ-017: Rating Display**
- **Priority:** Medium
- **Description:** System shall display user ratings and reviews
- **Input:** User profile request
- **Processing:** Calculate average rating, retrieve recent reviews
- **Output:** Rating display with review history

#### 3.1.7 Emergency System

**REQ-018: SOS Alert System**
- **Priority:** High
- **Description:** Users shall be able to trigger emergency alerts during rides
- **Input:** SOS button activation
- **Processing:** Create emergency alert, notify administrators
- **Output:** Emergency alert confirmation and admin notification

**REQ-019: Emergency Monitoring**
- **Priority:** High
- **Description:** Administrators shall monitor and respond to SOS alerts
- **Input:** Emergency alert notifications
- **Processing:** Display alert details, track resolution status
- **Output:** Emergency response dashboard

#### 3.1.8 Administrative Functions

**REQ-020: User Management**
- **Priority:** High
- **Description:** Administrators shall manage user accounts
- **Input:** User management commands
- **Processing:** View, edit, delete, or change user roles
- **Output:** User management confirmation

**REQ-021: Ride Monitoring**
- **Priority:** High
- **Description:** Administrators shall monitor all ride activities
- **Input:** Ride monitoring requests
- **Processing:** Retrieve ride data, status, and statistics
- **Output:** Comprehensive ride monitoring dashboard

**REQ-022: Database Management**
- **Priority:** High
- **Description:** Administrators shall have direct database access
- **Input:** SQL queries and database commands
- **Processing:** Execute database operations safely
- **Output:** Query results and operation confirmations

### 3.2 Use Cases

#### 3.2.1 Use Case: Create Ride with OCR Verification

**Actors:** Driver
**Preconditions:** User is logged in as driver
**Main Flow:**
1. Driver navigates to "Offer Ride" page
2. Driver enters ride details (origin, destination, time, seats, price)
3. Driver uploads vehicle image for license plate scanning
4. System processes image with OpenCV preprocessing
5. Google Gemini AI extracts license plate text
6. System validates plate format and auto-fills vehicle description
7. Driver confirms ride details
8. System creates ride and sends confirmation

**Alternative Flows:**
- 4a. If Gemini AI fails, system uses Tesseract.js fallback
- 6a. If validation fails, driver can manually enter plate number

#### 3.2.2 Use Case: Real-Time Ride Tracking

**Actors:** Driver, Passenger
**Preconditions:** Ride is confirmed and started
**Main Flow:**
1. Driver starts the ride from dashboard
2. System begins GPS tracking every 3 seconds
3. Passenger views live tracking on map
4. System updates route progress and ETA
5. System sends notifications for key milestones
6. Driver marks ride as completed upon arrival

**Alternative Flows:**
- 2a. If GPS unavailable, system prompts for manual location
- 3a. If passenger offline, updates resume when reconnected

---

## 4. System Features

### 4.1 Feature: AI-Powered License Plate Recognition

**Priority:** High
**Risk:** Medium
**Complexity:** High

**Description:** Advanced OCR system using Google Gemini AI for automatic license plate detection and verification.

**Functional Requirements:**
- REQ-005: License Plate OCR Integration
- Image preprocessing with OpenCV.js
- AI text extraction with Google Gemini
- Format validation for Indian license plates
- Fallback OCR with Tesseract.js

**Input/Output:**
- Input: Vehicle image (JPEG/PNG)
- Output: Validated license plate number

### 4.2 Feature: Real-Time GPS Tracking

**Priority:** High
**Risk:** High
**Complexity:** High

**Description:** Live location tracking system with 3-second update intervals for active rides.

**Functional Requirements:**
- REQ-008: Live Location Tracking
- REQ-009: Route Visualization
- REQ-010: ETA Calculation

**Input/Output:**
- Input: GPS coordinates, route data
- Output: Live map updates, ETA calculations

### 4.3 Feature: Smart Notification System

**Priority:** High
**Risk:** Low
**Complexity:** Medium

**Description:** Comprehensive notification system with push notifications, scheduling, and in-app notification center.

**Functional Requirements:**
- REQ-011: Push Notifications
- REQ-012: Scheduled Notifications
- REQ-013: In-App Notification Center

**Input/Output:**
- Input: System events, user actions
- Output: Browser notifications, in-app alerts

### 4.4 Feature: Global Location Support

**Priority:** High
**Risk:** Medium
**Complexity:** Medium

**Description:** Worldwide location picker with no geographical restrictions using OpenStreetMap and Nominatim.

**Functional Requirements:**
- Worldwide geocoding and reverse geocoding
- Interactive map-based location selection
- Search functionality with fallback strategies
- Coordinate-based location entry

**Input/Output:**
- Input: Location search queries, map clicks
- Output: Validated location coordinates and addresses

### 4.5 Feature: Emergency SOS System

**Priority:** High
**Risk:** Medium
**Complexity:** Medium

**Description:** Emergency alert system for user safety during rides.

**Functional Requirements:**
- REQ-018: SOS Alert System
- REQ-019: Emergency Monitoring

**Input/Output:**
- Input: SOS button activation
- Output: Emergency alerts, admin notifications

---

## 5. External Interface Requirements

### 5.1 User Interfaces

#### 5.1.1 Web Application Interface
- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4 with custom design system
- **Responsive Design:** Mobile-first approach with breakpoints
- **Accessibility:** WCAG 2.1 AA compliance
- **Color Scheme:** Orange primary (#f97316) with semantic colors

#### 5.1.2 Design System Components
- **Navigation:** Responsive navbar with user authentication status
- **Forms:** Consistent input styling with validation feedback
- **Buttons:** Semantic color coding (primary, success, warning, danger)
- **Cards:** Elevated design for content organization
- **Modals:** Overlay dialogs for confirmations and forms

#### 5.1.3 Mobile Interface Considerations
- **Touch Targets:** Minimum 44x44px for accessibility
- **Gestures:** Swipe navigation where appropriate
- **Offline Indicators:** Clear offline/online status
- **Performance:** Optimized for mobile networks

### 5.2 Hardware Interfaces

#### 5.2.1 GPS Hardware
- **Requirement:** GPS-enabled device for location services
- **Accuracy:** Minimum 10-meter accuracy for tracking
- **Update Frequency:** 3-second intervals during active rides
- **Fallback:** Manual location entry if GPS unavailable

#### 5.2.2 Camera Hardware
- **Requirement:** Device camera for license plate scanning
- **Resolution:** Minimum 2MP for OCR accuracy
- **Formats:** JPEG, PNG image capture
- **Processing:** Client-side image compression before upload

### 5.3 Software Interfaces

#### 5.3.1 Google Gemini AI API
- **Purpose:** License plate text extraction
- **Protocol:** HTTPS REST API
- **Authentication:** API key-based authentication
- **Rate Limits:** Managed with request queuing
- **Fallback:** Tesseract.js for offline processing

#### 5.3.2 OpenStreetMap Services
- **Purpose:** Map tiles and visualization
- **Protocol:** HTTPS tile server requests
- **Format:** PNG/JPEG map tiles
- **Caching:** Browser-based tile caching
- **Attribution:** Required OSM attribution display

#### 5.3.3 Nominatim Geocoding API
- **Purpose:** Address to coordinate conversion
- **Protocol:** HTTPS REST API
- **Rate Limits:** 1 request per second
- **Fallback:** Coordinate-based location entry
- **Coverage:** Worldwide geocoding support

#### 5.3.4 Browser APIs
- **Geolocation API:** For current location detection
- **Notification API:** For push notifications
- **Service Worker API:** For offline functionality
- **Local Storage API:** For client-side data persistence

### 5.4 Communication Interfaces

#### 5.4.1 HTTP/HTTPS Protocol
- **Client-Server:** RESTful API communication
- **Security:** HTTPS encryption in production
- **Format:** JSON request/response format
- **Authentication:** Session-based authentication

#### 5.4.2 WebSocket Protocol
- **Purpose:** Real-time location updates
- **Implementation:** Socket.io for cross-browser compatibility
- **Fallback:** HTTP polling for unsupported browsers
- **Security:** Secure WebSocket (WSS) in production

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

#### 6.1.1 Response Time Requirements
- **Page Load Time:** Maximum 2 seconds for initial page load
- **API Response Time:** Maximum 1 second for database queries
- **Location Updates:** 3-second intervals for GPS tracking
- **OCR Processing:** Maximum 5 seconds for license plate recognition
- **Search Results:** Maximum 2 seconds for ride search queries

#### 6.1.2 Throughput Requirements
- **Concurrent Users:** Support minimum 100 concurrent users
- **Database Transactions:** Handle 1000 transactions per minute
- **API Requests:** Process 500 requests per minute
- **File Uploads:** Support 50 concurrent image uploads

#### 6.1.3 Resource Utilization
- **Memory Usage:** Maximum 512MB RAM per user session
- **CPU Usage:** Maximum 70% CPU utilization under normal load
- **Storage:** Efficient database indexing for optimal queries
- **Network:** Optimized payload sizes for mobile networks

### 6.2 Safety Requirements

#### 6.2.1 Data Safety
- **Backup Strategy:** Daily automated database backups
- **Data Recovery:** Maximum 1-hour recovery time objective
- **Data Integrity:** Foreign key constraints and validation
- **Audit Trail:** Comprehensive logging of all system actions

#### 6.2.2 User Safety
- **Emergency System:** SOS alerts with admin monitoring
- **User Verification:** License plate verification system
- **Privacy Protection:** Secure handling of personal information
- **Location Privacy:** Optional location sharing controls

### 6.3 Security Requirements

#### 6.3.1 Authentication and Authorization
- **Password Security:** Bcrypt hashing with salt rounds
- **Session Management:** Secure session tokens with expiration
- **Role-Based Access:** User and admin role separation
- **API Security:** Input validation and sanitization

#### 6.3.2 Data Protection
- **Encryption:** HTTPS/TLS encryption for data transmission
- **Input Validation:** Server-side validation for all inputs
- **SQL Injection Prevention:** Parameterized queries only
- **XSS Protection:** Content Security Policy implementation

#### 6.3.3 Privacy Requirements
- **Data Minimization:** Collect only necessary user data
- **Consent Management:** Clear privacy policy and consent
- **Data Retention:** Automatic deletion of old data
- **User Rights:** Data export and deletion capabilities

### 6.4 Software Quality Attributes

#### 6.4.1 Reliability
- **Availability:** 99% uptime target
- **Error Handling:** Graceful degradation on failures
- **Fault Tolerance:** Automatic recovery from common errors
- **Data Consistency:** ACID compliance for critical operations

#### 6.4.2 Usability
- **User Experience:** Intuitive navigation and workflows
- **Accessibility:** WCAG 2.1 AA compliance
- **Mobile Optimization:** Touch-friendly interface design
- **Error Messages:** Clear, actionable error feedback

#### 6.4.3 Maintainability
- **Code Quality:** TypeScript for type safety
- **Documentation:** Comprehensive code and API documentation
- **Modularity:** Component-based architecture
- **Testing:** Unit and integration test coverage

#### 6.4.4 Portability
- **Cross-Platform:** Support for major operating systems
- **Browser Compatibility:** Modern browser support
- **Device Independence:** Responsive design for all screen sizes
- **Network Adaptability:** Offline-first architecture

---

## 7. Other Requirements

### 7.1 Database Requirements

#### 7.1.1 Database Schema
- **Users Table:** User account and profile information
- **Rides Table:** Ride details with GPS coordinates
- **Bookings Table:** Booking requests and status
- **Ratings Table:** User ratings and reviews
- **Messages Table:** In-app communication history
- **Notifications Table:** Notification history and status

#### 7.1.2 Data Relationships
- **Foreign Keys:** Maintain referential integrity
- **Indexes:** Optimize query performance
- **Constraints:** Ensure data validity
- **Triggers:** Automatic timestamp updates

#### 7.1.3 Data Management
- **Backup Strategy:** Daily incremental backups
- **Archive Policy:** Archive old data after 2 years
- **Migration Support:** Version-controlled schema changes
- **Performance Monitoring:** Query optimization tracking

### 7.2 Internationalization Requirements

#### 7.2.1 Language Support
- **Primary Language:** English (US)
- **Future Support:** Hindi, regional Indian languages
- **Text Encoding:** UTF-8 for all text data
- **Date/Time:** Localized formatting support

#### 7.2.2 Regional Adaptations
- **Currency:** Indian Rupee (₹) primary, multi-currency future
- **Address Formats:** Indian address format support
- **Phone Numbers:** Indian phone number validation
- **License Plates:** Indian license plate format validation

### 7.3 Legal and Compliance Requirements

#### 7.3.1 Data Protection Compliance
- **Privacy Policy:** Comprehensive privacy policy
- **Terms of Service:** Clear terms and conditions
- **Data Processing:** Lawful basis for data processing
- **User Consent:** Explicit consent for data collection

#### 7.3.2 Regulatory Compliance
- **Transportation Laws:** Compliance with local carpooling regulations
- **Tax Requirements:** Support for applicable tax calculations
- **Insurance Considerations:** Clear liability disclaimers
- **Age Restrictions:** Minimum age requirements for users

### 7.4 Installation and Deployment Requirements

#### 7.4.1 Development Environment
- **Node.js:** Version 18 or higher
- **Package Manager:** npm or yarn
- **Database:** SQLite 3 for development
- **Build Tools:** Vite for frontend bundling

#### 7.4.2 Production Environment
- **Server:** Linux/Windows server environment
- **Web Server:** Nginx or Apache reverse proxy
- **SSL Certificate:** Valid SSL certificate for HTTPS
- **Monitoring:** Application performance monitoring

#### 7.4.3 Deployment Process
- **CI/CD Pipeline:** Automated testing and deployment
- **Environment Variables:** Secure configuration management
- **Database Migration:** Automated schema updates
- **Rollback Strategy:** Quick rollback capability

---

## 8. Appendices

### 8.1 Glossary

| Term | Definition |
|------|------------|
| **Carpooling** | Sharing a car journey with other passengers |
| **Geocoding** | Converting addresses to geographic coordinates |
| **OCR** | Optical Character Recognition technology |
| **Progressive Web App** | Web application with native app-like features |
| **Real-time** | Immediate data processing and updates |
| **RESTful API** | Representational State Transfer web service |
| **Responsive Design** | Design that adapts to different screen sizes |
| **SOS** | International distress signal |
| **WebSocket** | Protocol for real-time communication |

### 8.2 Technology Stack Details

#### 8.2.1 Frontend Technologies
- **React 19:** Latest React version with concurrent features
- **TypeScript:** Type-safe JavaScript development
- **Tailwind CSS 4:** Utility-first CSS framework
- **Framer Motion:** Animation library for smooth transitions
- **React Router:** Client-side routing
- **Leaflet:** Interactive map library
- **Lucide React:** Modern icon library

#### 8.2.2 Backend Technologies
- **Node.js 18+:** JavaScript runtime environment
- **Express.js:** Web application framework
- **Better-SQLite3:** High-performance SQLite driver
- **TypeScript:** Type-safe server development
- **Cors:** Cross-origin resource sharing
- **Helmet:** Security middleware

#### 8.2.3 AI and External Services
- **Google Gemini AI:** Advanced language model for OCR
- **Tesseract.js:** JavaScript OCR library
- **OpenCV.js:** Computer vision library
- **OpenStreetMap:** Open-source mapping platform
- **Nominatim:** Geocoding service

### 8.3 API Endpoint Documentation

#### 8.3.1 Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update user profile
```

#### 8.3.2 Ride Management Endpoints
```
GET /api/rides - Get all active rides
GET /api/rides/:id - Get ride details
POST /api/rides - Create new ride
PUT /api/rides/:id - Update ride
DELETE /api/rides/:id - Cancel ride
GET /api/rides/driver/:driverId - Get driver's rides
```

#### 8.3.3 Booking Endpoints
```
GET /api/bookings/passenger/:passengerId - Get passenger bookings
GET /api/bookings/ride/:rideId - Get ride bookings
POST /api/bookings - Create booking
PUT /api/bookings/:id/accept - Accept booking
PUT /api/bookings/:id/reject - Reject booking
PUT /api/bookings/:id/cancel - Cancel booking
```

### 8.4 Database Schema

#### 8.4.1 Users Table
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 8.4.2 Rides Table
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
  distance_km REAL,
  estimated_duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id)
);
```

### 8.5 Error Codes and Messages

#### 8.5.1 Authentication Errors
- **AUTH001:** Invalid email or password
- **AUTH002:** Account not found
- **AUTH003:** Account already exists
- **AUTH004:** Session expired
- **AUTH005:** Insufficient permissions

#### 8.5.2 Ride Management Errors
- **RIDE001:** Ride not found
- **RIDE002:** Insufficient seats available
- **RIDE003:** Invalid ride parameters
- **RIDE004:** Cannot modify past rides
- **RIDE005:** OCR processing failed

#### 8.5.3 System Errors
- **SYS001:** Database connection error
- **SYS002:** External service unavailable
- **SYS003:** File upload failed
- **SYS004:** Invalid request format
- **SYS005:** Rate limit exceeded

### 8.6 Testing Requirements

#### 8.6.1 Unit Testing
- **Coverage:** Minimum 80% code coverage
- **Framework:** Jest for JavaScript/TypeScript testing
- **Components:** React Testing Library for component tests
- **API:** Supertest for API endpoint testing

#### 8.6.2 Integration Testing
- **Database:** Test database operations and transactions
- **API:** End-to-end API workflow testing
- **External Services:** Mock external service integrations
- **Real-time Features:** WebSocket connection testing

#### 8.6.3 Performance Testing
- **Load Testing:** Simulate concurrent user load
- **Stress Testing:** Test system limits and recovery
- **OCR Performance:** Test image processing speed
- **Database Performance:** Query optimization validation


---

*This document is confidential and proprietary. Distribution is restricted to authorized personnel only.*