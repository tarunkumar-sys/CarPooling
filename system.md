# AgraRide System Architecture

## System Overview

AgraRide is a comprehensive carpooling platform designed specifically for Agra city, featuring real-time tracking, AI-powered vehicle recognition, and emergency safety features.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Map System  │  │  OCR System  │      │
│  │  Components  │  │   (Leaflet)  │  │  (OpenCV.js) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (REST)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Auth      │  │    Rides     │  │   Bookings   │      │
│  │  Endpoints   │  │  Endpoints   │  │  Endpoints   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ User Manager │  │ Ride Manager │  │  SOS Manager │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (SQLite)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │    Rides     │  │   Bookings   │      │
│  │    Table     │  │    Table     │  │    Table     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Architecture

#### Component Hierarchy
```
App.tsx
├── AuthPage.tsx
├── Home.tsx
├── SearchRides.tsx
│   ├── RoutePreviewMap.tsx
│   └── BookingRequests.tsx
├── OfferRide.tsx
│   ├── LocationPicker.tsx
│   └── VehiclePlateRecognition.tsx
├── MyBookings.tsx
│   ├── SOSButton.tsx
│   └── RatingModal.tsx
├── MyRides.tsx
├── Profile.tsx
└── AdminDashboard.tsx
    ├── DatabaseManager.tsx
    └── AdminMap.tsx
```

#### State Management
- **React Context**: Global state (user, toast notifications)
- **Local State**: Component-specific state
- **URL State**: Route parameters and query strings

### 2. Backend Architecture

#### Server Structure
```typescript
Express Server (server.ts)
├── Authentication Middleware
├── API Routes
│   ├── /api/auth/*
│   ├── /api/rides/*
│   ├── /api/bookings/*
│   ├── /api/messages/*
│   ├── /api/ratings/*
│   └── /api/sos/*
└── Database Connection (db.ts)
```

#### Database Schema
```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'passenger',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rides Table
CREATE TABLE rides (
    id INTEGER PRIMARY KEY,
    driver_id INTEGER NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time DATETIME NOT NULL,
    price_per_seat REAL NOT NULL,
    available_seats INTEGER NOT NULL,
    vehicle_type TEXT,
    vehicle_number TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- Bookings Table
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY,
    ride_id INTEGER NOT NULL,
    passenger_id INTEGER NOT NULL,
    seats_booked INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    counter_offer_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id),
    FOREIGN KEY (passenger_id) REFERENCES users(id)
);

-- Messages Table
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    ride_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Ratings Table
CREATE TABLE ratings (
    id INTEGER PRIMARY KEY,
    ride_id INTEGER NOT NULL,
    rater_id INTEGER NOT NULL,
    rated_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id),
    FOREIGN KEY (rater_id) REFERENCES users(id),
    FOREIGN KEY (rated_id) REFERENCES users(id)
);

-- SOS Alerts Table
CREATE TABLE sos_alerts (
    id INTEGER PRIMARY KEY,
    ride_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (ride_id) REFERENCES rides(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## System Flows

### 1. User Registration Flow
```
User → AuthPage → POST /api/auth/register → Database → JWT Token → Home
```

### 2. Ride Offering Flow
```
Driver → OfferRide
    ↓
Upload Vehicle Image → VehiclePlateRecognition
    ↓
OpenCV Detection → Tesseract OCR → Validation
    ↓
Auto-fill Form → Select Locations (LocationPicker)
    ↓
POST /api/rides → Database → Success
```

### 3. Ride Booking Flow
```
Passenger → SearchRides → View Rides
    ↓
Select Ride → RoutePreviewMap (OSRM routing)
    ↓
Book Ride → POST /api/bookings → Pending Status
    ↓
Driver Approval → Status: Confirmed
    ↓
Live Tracking → LiveTrackingGPS
```

### 4. SOS Emergency Flow
```
User (Active Ride) → SOSButton → Confirm
    ↓
POST /api/sos → Database
    ↓
Admin Notification → AdminDashboard
    ↓
Admin Action → Update Status → Resolved
```

## Technology Stack

### Frontend Technologies
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Leaflet**: Maps
- **OpenCV.js**: Image processing
- **Tesseract.js**: OCR
- **date-fns**: Date formatting

### Backend Technologies
- **Node.js**: Runtime
- **Express**: Web framework
- **SQLite**: Database
- **bcrypt**: Password hashing
- **JWT**: Authentication

### External Services
- **OpenStreetMap**: Map tiles
- **OSRM**: Route calculation
- **Nominatim**: Geocoding

## Advanced Features

### 1. Vehicle License Plate Recognition

#### Architecture
```
Image Upload
    ↓
OpenCV.js Detection
├── Grayscale conversion
├── Gaussian blur
├── Canny edge detection
├── Contour analysis
└── ROI extraction
    ↓
Preprocessing
├── Resize (height=100px)
├── Bilateral filter
├── Adaptive threshold
└── Morphological operations
    ↓
Tesseract.js OCR
├── PSM: SINGLE_LINE
├── Whitelist: A-Z, 0-9
└── Character correction
    ↓
Validation
├── Indian plate regex
├── State code extraction
└── Format validation
    ↓
Auto-fill Form
```

#### Performance Optimizations
- Worker singleton pattern
- Debounced processing
- Memory management
- Async operations

### 2. Smart Map System

#### Route Calculation (Uber/Ola Style)
```
User Selects Route
    ↓
Instant Fallback (0ms)
├── Straight-line distance
├── Estimated duration
└── Display route immediately
    ↓
Background OSRM (500-2000ms)
├── Real road routing
├── Accurate distance/time
└── Update UI silently
```

#### Map Optimizations
- Zero re-renders
- Memoized components
- Stable callbacks
- Single initialization
- Proper cleanup

### 3. Real-time Tracking

#### GPS Tracking Flow
```
Active Ride → LiveTrackingGPS
    ↓
Simulated GPS Updates (every 5s)
    ↓
Update Marker Position
    ↓
Calculate Progress
    ↓
Update ETA
```

## Security Measures

### Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Session management
- Role-based access control

### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- CORS configuration
- File upload validation

### Privacy
- Client-side OCR (no server upload)
- Location data encryption
- User data anonymization
- GDPR compliance ready

## Performance Optimization

### Frontend Optimizations
- Code splitting
- Lazy loading
- Memoization (useMemo, useCallback)
- Virtual scrolling
- Image optimization

### Backend Optimizations
- Database indexing
- Query optimization
- Connection pooling
- Caching strategy
- Rate limiting

### Map Optimizations
- Tile caching
- Marker clustering
- Debounced updates
- Memory management
- Efficient rendering

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancing ready
- Database replication
- CDN integration

### Vertical Scaling
- Optimized queries
- Efficient algorithms
- Memory management
- Resource pooling

## Monitoring & Logging

### Error Tracking
- Frontend error boundaries
- API error logging
- Database error handling
- User action tracking

### Performance Monitoring
- API response times
- Database query performance
- Frontend rendering metrics
- User experience analytics

## Deployment Architecture

### Development Environment
```
Local Machine
├── Vite Dev Server (Port 5173)
├── Express Server (Port 3000)
└── SQLite Database (agraride.db)
```

### Production Environment
```
Cloud Server
├── Nginx (Reverse Proxy)
├── Node.js (Express API)
├── SQLite/PostgreSQL (Database)
└── Static Files (CDN)
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Ride Endpoints
- `GET /api/rides` - Get all rides
- `POST /api/rides` - Create ride
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Delete ride

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings/passenger/:id` - Get user bookings
- `PUT /api/bookings/:id` - Update booking status

### SOS Endpoints
- `POST /api/sos` - Create SOS alert
- `GET /api/sos` - Get all SOS alerts (admin)
- `PUT /api/sos/:id` - Update SOS status

## Future Enhancements

### Planned Features
1. Real-time chat with WebSocket
2. Push notifications
3. Payment integration (Razorpay/Stripe)
4. Advanced analytics dashboard
5. Machine learning for route optimization
6. Multi-language support
7. Dark mode
8. Progressive Web App (PWA)

### Scalability Roadmap
1. Migrate to PostgreSQL
2. Implement Redis caching
3. Add Elasticsearch for search
4. Implement microservices architecture
5. Add Kubernetes orchestration

---

This system architecture provides a solid foundation for a scalable, maintainable, and feature-rich carpooling platform.
