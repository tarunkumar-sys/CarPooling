# AgraRide - Advanced Technical Documentation

## System Architecture Overview

### Platform Description
AgraRide is a cutting-edge carpooling platform that leverages advanced AI, real-time tracking, and global location services to provide a comprehensive transportation solution. The system integrates Google Gemini AI for license plate recognition, real-time GPS tracking with WebSocket connections, and worldwide location support through OpenStreetMap and Nominatim services.

### Technology Stack

#### Frontend Architecture
- **React 19**: Latest React with concurrent features, Suspense, and automatic batching
- **TypeScript**: Strict type safety with comprehensive interfaces and generics
- **Tailwind CSS 4**: Utility-first styling with custom design system and semantic colors
- **Framer Motion**: Advanced animations and smooth transitions
- **Vite**: Lightning-fast build tool with hot module replacement and code splitting
- **PWA**: Service Workers for offline functionality and native app experience

#### Backend Infrastructure
- **Node.js 18+**: Event-driven runtime with ES modules and latest features
- **Express.js**: Web framework with comprehensive middleware pipeline
- **Better-SQLite3**: High-performance synchronous SQLite operations
- **TypeScript**: Server-side type safety with strict configuration
- **WebSocket**: Real-time communication with Socket.io integration

#### AI and Computer Vision
- **Google Gemini AI**: State-of-the-art language model for OCR text extraction
- **OpenCV.js**: Advanced computer vision for image preprocessing
- **Tesseract.js**: JavaScript OCR engine for offline fallback processing
- **Image Processing**: Client-side compression, format conversion, and validation

#### External Services Integration
- **OpenStreetMap**: Global mapping platform with comprehensive tile coverage
- **Nominatim**: Worldwide geocoding and reverse geocoding services
- **Browser APIs**: Geolocation, Camera, Notification, and Service Worker APIs

## Advanced Core Features

### 1. AI-Powered License Plate Recognition

#### Google Gemini AI Integration
- **Advanced OCR**: State-of-the-art text extraction from vehicle images
- **High Accuracy**: Superior performance compared to traditional OCR engines
- **Context Understanding**: AI-powered validation and error correction
- **API Integration**: Secure HTTPS communication with rate limiting and fallback

#### OpenCV.js Image Preprocessing
- **Grayscale Conversion**: Optimized for text recognition accuracy
- **Noise Reduction**: Advanced denoising algorithms for image clarity
- **Edge Detection**: Canny edge detection for license plate boundary identification
- **Contour Detection**: Automatic license plate region extraction
- **Image Enhancement**: Contrast adjustment and sharpening for better OCR results

#### Comprehensive OCR Pipeline
1. **Image Capture**: Camera API integration with compression and validation
2. **Preprocessing**: OpenCV.js enhancement and region detection
3. **Primary OCR**: Google Gemini AI text extraction with confidence scoring
4. **Validation**: Indian license plate format validation (UP80AB1234 pattern)
5. **Fallback Processing**: Tesseract.js for offline or backup processing
6. **Auto-fill Integration**: Automatic vehicle description population
7. **Visual Verification**: Real-time confidence indicators and manual override

### 2. Real-Time GPS Tracking System

#### Live Location Architecture
- **3-Second Updates**: High-frequency location tracking during active rides
- **WebSocket Communication**: Real-time bidirectional data flow
- **Geolocation API**: Browser-based GPS with accuracy optimization
- **Location Validation**: Coordinate validation and error handling
- **Battery Optimization**: Intelligent update frequency based on movement

#### Advanced Mapping Features
- **Route Visualization**: Dynamic route rendering with OpenStreetMap
- **Progress Tracking**: Real-time journey progress with milestone notifications
- **ETA Calculation**: Dynamic arrival time estimation with traffic considerations
- **Heading Indicators**: Direction and bearing information for navigation
- **Offline Maps**: Cached tile support for limited connectivity scenarios

#### Real-Time Communication
- **WebSocket Integration**: Socket.io for cross-browser compatibility
- **Connection Management**: Automatic reconnection and fallback mechanisms
- **Data Synchronization**: Real-time state synchronization across clients
- **Performance Optimization**: Efficient data transmission and compression

### 3. Global Location Services

#### Worldwide Location Support
- **No Geographic Restrictions**: Global coverage with comprehensive geocoding
- **Multi-tier Search Strategy**: Primary and fallback location resolution
- **Interactive Map Interface**: Click-to-select with drag-and-drop support
- **Search Functionality**: Text-based location search with autocomplete
- **Current Location Detection**: GPS-based location with manual override

#### Advanced Geocoding
- **Nominatim Integration**: OpenStreetMap-based geocoding service
- **Reverse Geocoding**: Coordinate to address conversion
- **Address Validation**: Format validation and standardization
- **Coordinate Fallback**: Manual coordinate entry for edge cases
- **Timeout Protection**: 5-second timeout with graceful degradation

### 4. Smart Notification System

#### Push Notification Architecture
- **Browser Integration**: Native browser notification API
- **Permission Management**: User consent and preference handling
- **Service Worker**: Background notification processing
- **Delivery Tracking**: Notification delivery confirmation and analytics

#### Notification Types and Scheduling
1. **Booking Notifications**: Real-time booking requests and responses
2. **Ride Updates**: Status changes, confirmations, and cancellations
3. **Departure Reminders**: Automated 30-minute pre-departure alerts
4. **Emergency Alerts**: SOS notifications with priority delivery
5. **System Announcements**: Maintenance and feature updates

#### In-App Notification Center
- **Notification History**: Comprehensive notification archive
- **Badge Counts**: Unread notification indicators
- **Read/Unread Status**: Notification state management
- **Categorization**: Organized by type and priority
- **Action Integration**: Direct action buttons within notifications

### 5. Advanced Booking Management

#### Sophisticated Booking Flow
1. **Ride Discovery**: Advanced search with filtering and sorting
2. **Seat Selection**: Real-time availability with instant updates
3. **Price Negotiation**: Counter-offer system with acceptance workflow
4. **Booking Confirmation**: Multi-step confirmation with notifications
5. **Real-time Updates**: Live booking status with push notifications
6. **Cancellation Management**: Flexible cancellation with reason tracking

#### Counter-Offer System
- **Price Negotiation**: Passenger-initiated price proposals
- **Driver Response**: Accept, reject, or counter-counter offers
- **Automated Expiration**: Time-limited offer validity
- **Notification Integration**: Real-time offer status updates
- **History Tracking**: Complete negotiation audit trail

#### Booking State Management
- **Pending**: Awaiting driver response with timeout handling
- **Confirmed**: Driver acceptance with seat reservation
- **Rejected**: Driver decline with optional reason
- **Cancelled**: Either party cancellation with refund processing
- **Completed**: Successful ride completion with rating prompt

### 6. Emergency SOS System

#### One-Click Emergency Response
- **Instant Alerts**: Immediate SOS activation with location data
- **Admin Notification**: Real-time emergency dashboard updates
- **Location Sharing**: Continuous location tracking during emergencies
- **Contact Integration**: Emergency contact notification system
- **Response Tracking**: Admin response time and resolution monitoring

#### Emergency Dashboard
- **Real-time Monitoring**: Live SOS alert display with priority sorting
- **Response Management**: Alert assignment and resolution tracking
- **Location Visualization**: Emergency location mapping and routing
- **Communication Tools**: Direct communication with emergency contacts
- **Escalation Procedures**: Automated escalation based on response time

## Enhanced Database Architecture

### Database Design Philosophy
The database architecture follows ACID principles with comprehensive foreign key relationships, optimized indexing, and transaction management for data integrity and performance.

### Core Tables Structure

#### Enhanced Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'emergency_responder')),
  phone TEXT,
  gender TEXT CHECK(gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  vehicle_type TEXT CHECK(vehicle_type IN ('2-wheeler', '4-wheeler', 'both')),
  profile_image TEXT,
  average_rating REAL DEFAULT 0 CHECK(average_rating >= 0 AND average_rating <= 5),
  total_rides INTEGER DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT 0,
  phone_verified BOOLEAN DEFAULT 0,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Advanced Rides Table
```sql
CREATE TABLE rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id INTEGER NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_lat REAL NOT NULL CHECK(origin_lat >= -90 AND origin_lat <= 90),
  origin_lng REAL NOT NULL CHECK(origin_lng >= -180 AND origin_lng <= 180),
  dest_lat REAL NOT NULL CHECK(dest_lat >= -90 AND dest_lat <= 90),
  dest_lng REAL NOT NULL CHECK(dest_lng >= -180 AND dest_lng <= 180),
  departure_time DATETIME NOT NULL,
  available_seats INTEGER NOT NULL CHECK(available_seats >= 1 AND available_seats <= 6),
  original_seats INTEGER NOT NULL,
  price_per_seat REAL NOT NULL CHECK(price_per_seat >= 0),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'started', 'completed', 'cancelled')),
  driver_vehicle TEXT,
  driver_vehicle_description TEXT,
  license_plate TEXT,
  license_plate_verified BOOLEAN DEFAULT 0,
  ocr_confidence REAL CHECK(ocr_confidence >= 0 AND ocr_confidence <= 1),
  distance_km REAL,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  route_data TEXT, -- JSON string for route information
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Comprehensive Bookings Table
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_id INTEGER NOT NULL,
  passenger_id INTEGER NOT NULL,
  seats_booked INTEGER NOT NULL CHECK(seats_booked >= 1),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  original_price REAL NOT NULL,
  counter_offer_price REAL,
  final_price REAL,
  counter_offer_message TEXT,
  rejection_reason TEXT,
  cancellation_reason TEXT,
  booking_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmation_time DATETIME,
  cancellation_time DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
  FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(ride_id, passenger_id) -- Prevent duplicate bookings
);
```

#### Enhanced Ratings Table
```sql
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_id INTEGER NOT NULL,
  rater_id INTEGER NOT NULL,
  rated_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  rating_type TEXT CHECK(rating_type IN ('driver_to_passenger', 'passenger_to_driver')),
  is_anonymous BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
  FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (rated_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(ride_id, rater_id, rated_id) -- Prevent duplicate ratings
);
```

#### Advanced Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  ride_id INTEGER,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'system', 'location', 'image')),
  read BOOLEAN DEFAULT 0,
  read_at DATETIME,
  is_system_message BOOLEAN DEFAULT 0,
  metadata TEXT, -- JSON string for additional message data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('booking', 'ride', 'system', 'emergency', 'reminder')),
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT 0,
  read_at DATETIME,
  action_url TEXT,
  metadata TEXT, -- JSON string for additional notification data
  scheduled_for DATETIME,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### SOS Alerts Table
```sql
CREATE TABLE sos_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  ride_id INTEGER,
  alert_type TEXT DEFAULT 'emergency' CHECK(alert_type IN ('emergency', 'safety', 'medical', 'other')),
  location_lat REAL,
  location_lng REAL,
  location_address TEXT,
  message TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'acknowledged', 'resolved', 'false_alarm')),
  acknowledged_by INTEGER,
  acknowledged_at DATETIME,
  resolved_by INTEGER,
  resolved_at DATETIME,
  resolution_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### Database Optimization

#### Indexing Strategy
```sql
-- Performance indexes for frequent queries
CREATE INDEX idx_rides_departure_time ON rides(departure_time);
CREATE INDEX idx_rides_origin_coords ON rides(origin_lat, origin_lng);
CREATE INDEX idx_rides_dest_coords ON rides(dest_lat, dest_lng);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_messages_read ON messages(receiver_id, read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_sos_alerts_status ON sos_alerts(status);

-- Composite indexes for complex queries
CREATE INDEX idx_rides_search ON rides(status, departure_time, available_seats);
CREATE INDEX idx_bookings_user_status ON bookings(passenger_id, status);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, ride_id);
```

#### Database Triggers
```sql
-- Auto-update timestamps
CREATE TRIGGER update_users_timestamp 
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER update_rides_timestamp 
  AFTER UPDATE ON rides
  BEGIN
    UPDATE rides SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Update user ratings automatically
CREATE TRIGGER update_user_rating 
  AFTER INSERT ON ratings
  BEGIN
    UPDATE users 
    SET average_rating = (
      SELECT AVG(rating) FROM ratings WHERE rated_id = NEW.rated_id
    ),
    total_ratings = (
      SELECT COUNT(*) FROM ratings WHERE rated_id = NEW.rated_id
    )
    WHERE id = NEW.rated_id;
  END;

-- Update available seats on booking confirmation
CREATE TRIGGER update_available_seats 
  AFTER UPDATE OF status ON bookings
  WHEN NEW.status = 'confirmed' AND OLD.status = 'pending'
  BEGIN
    UPDATE rides 
    SET available_seats = available_seats - NEW.seats_booked
    WHERE id = NEW.ride_id;
  END;
```

## Comprehensive API Architecture

### RESTful API Design

#### Authentication & User Management
```typescript
// Enhanced authentication endpoints
POST   /api/auth/register          // User registration with validation
POST   /api/auth/login             // Secure login with JWT tokens
POST   /api/auth/logout            // Session termination
POST   /api/auth/refresh           // Token refresh mechanism
GET    /api/auth/profile           // User profile retrieval
PUT    /api/auth/profile           // Profile updates with image upload
POST   /api/auth/verify-email      // Email verification
POST   /api/auth/reset-password    // Password reset functionality
PUT    /api/auth/change-password   // Password change with validation
```

#### Advanced Ride Management
```typescript
// Comprehensive ride endpoints
GET    /api/rides                  // Paginated ride listing with filters
GET    /api/rides/search           // Advanced search with geocoding
GET    /api/rides/:id              // Detailed ride information
POST   /api/rides                  // Ride creation with validation
PUT    /api/rides/:id              // Ride updates and modifications
DELETE /api/rides/:id              // Ride cancellation with notifications
GET    /api/rides/driver/:id       // Driver's ride history and statistics
POST   /api/rides/:id/start        // Start ride with GPS tracking
POST   /api/rides/:id/complete     // Complete ride with final location
GET    /api/rides/nearby           // Location-based ride discovery
```

#### Sophisticated Booking System
```typescript
// Enhanced booking management
GET    /api/bookings/passenger/:id // Passenger booking history
GET    /api/bookings/driver/:id    // Driver booking requests
GET    /api/bookings/ride/:id      // Ride-specific bookings
POST   /api/bookings               // Create booking with counter-offers
PUT    /api/bookings/:id/accept    // Accept booking with price confirmation
PUT    /api/bookings/:id/reject    // Reject booking with optional reason
PUT    /api/bookings/:id/cancel    // Cancel booking with refund processing
POST   /api/bookings/:id/counter   // Submit counter-offer
GET    /api/bookings/:id/status    // Real-time booking status
```

#### AI and OCR Services
```typescript
// Advanced OCR and AI endpoints
POST   /api/ocr/extract            // License plate OCR processing
POST   /api/ocr/validate           // Plate format validation
GET    /api/ocr/confidence/:id     // OCR confidence scoring
POST   /api/ai/verify-plate        // AI-powered plate verification
POST   /api/images/upload          // Secure image upload with compression
GET    /api/images/:id             // Image retrieval with caching
```

#### Real-Time Communication
```typescript
// WebSocket and messaging endpoints
GET    /api/messages/:userId       // Message history retrieval
POST   /api/messages               // Send message with notifications
PUT    /api/messages/:id/read      // Mark messages as read
GET    /api/messages/conversation  // Conversation thread
DELETE /api/messages/:id           // Delete message
GET    /api/chat/active            // Active chat sessions
```

#### Notification Management
```typescript
// Comprehensive notification system
GET    /api/notifications/:userId  // User notification history
POST   /api/notifications/send     // Send notification
PUT    /api/notifications/:id/read // Mark notification as read
DELETE /api/notifications/:id      // Delete notification
POST   /api/notifications/schedule // Schedule future notifications
GET    /api/notifications/settings // User notification preferences
PUT    /api/notifications/settings // Update notification preferences
```

#### Emergency and Safety
```typescript
// SOS and emergency endpoints
POST   /api/sos/alert              // Create emergency alert
GET    /api/sos/active             // Active emergency alerts
PUT    /api/sos/:id/acknowledge    // Acknowledge emergency alert
PUT    /api/sos/:id/resolve        // Resolve emergency alert
GET    /api/sos/history            // Emergency alert history
POST   /api/safety/report          // Safety incident reporting
```

#### Administrative Dashboard
```typescript
// Enhanced admin endpoints
GET    /api/admin/stats            // Comprehensive system statistics
GET    /api/admin/users            // User management with pagination
PUT    /api/admin/users/:id        // User account management
DELETE /api/admin/users/:id        // User account deletion
GET    /api/admin/rides            // Ride monitoring and management
GET    /api/admin/bookings         // Booking oversight
GET    /api/admin/alerts           // Emergency alert monitoring
POST   /api/admin/sql              // Direct SQL query execution
GET    /api/admin/logs             // System log retrieval
POST   /api/admin/backup           // Database backup creation
```

### API Security and Middleware

#### Authentication Middleware
```typescript
// JWT token validation and role-based access
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-based authorization
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### Input Validation and Sanitization
```typescript
// Comprehensive input validation using Joi
const rideValidationSchema = Joi.object({
  origin: Joi.string().required().max(255),
  destination: Joi.string().required().max(255),
  origin_lat: Joi.number().min(-90).max(90).required(),
  origin_lng: Joi.number().min(-180).max(180).required(),
  dest_lat: Joi.number().min(-90).max(90).required(),
  dest_lng: Joi.number().min(-180).max(180).required(),
  departure_time: Joi.date().iso().min('now').required(),
  available_seats: Joi.number().integer().min(1).max(6).required(),
  price_per_seat: Joi.number().min(0).required(),
  license_plate: Joi.string().pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/).optional()
});
```

#### Rate Limiting and Security
```typescript
// API rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers and CORS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## Security Measures

### Input Validation
- Server-side validation for all inputs
- Type checking with TypeScript
- SQL injection prevention
- XSS protection

### Authentication
- Secure password hashing
- Session management
- Role-based access control
- Token-based authentication (future)

### Data Protection
- HTTPS in production
- CORS configuration
- Rate limiting
- Input sanitization

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Memoization
- Virtual scrolling (large lists)

### Backend
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling

### Network
- Compression
- CDN for static assets
- API response caching
- Debouncing/throttling

## Mobile Responsiveness

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-First Approach
- Touch-friendly targets (44x44px minimum)
- Optimized layouts
- Progressive enhancement
- Offline capabilities

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] HTTPS enabled
- [ ] Error logging setup
- [ ] Performance monitoring
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CDN configured
- [ ] Backup strategy in place

### Environment Variables
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=./agraride.db
GEMINI_API_KEY=your_api_key
SESSION_SECRET=your_secret
CORS_ORIGIN=https://yourdomain.com
```

## Monitoring & Logging

### Metrics to Track
- Response times
- Error rates
- User activity
- Booking conversion
- System resources

### Logging
- Error logs
- Access logs
- Audit logs
- Performance logs

## Future Enhancements

### Phase 1
- Email notifications
- SMS notifications
- Payment integration
- Advanced search filters
- Ride scheduling

### Phase 2
- Mobile apps (iOS/Android)
- Real-time chat
- Ride sharing groups
- Loyalty program
- Analytics dashboard

### Phase 3
- AI-powered matching
- Dynamic pricing
- Multi-city support
- API for third-party integration
- Advanced analytics

## Troubleshooting

### Common Issues

**Database locked**
- Close other connections
- Check file permissions
- Restart server

**Map not loading**
- Check internet connection
- Verify API keys
- Clear browser cache

**Notifications not working**
- Check browser permissions
- Verify HTTPS connection
- Check notification settings

**OCR not detecting plates**
- Ensure good lighting
- Check image quality
- Try different angle
- Use manual entry fallback

## Best Practices

### Code Quality
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write meaningful comments
- Keep functions small and focused
- Use meaningful variable names

### Git Workflow
- Feature branches
- Descriptive commit messages
- Pull request reviews
- Semantic versioning

### Testing
- Unit tests for utilities
- Integration tests for API
- E2E tests for critical flows
- Manual testing on devices

## Support & Maintenance

### Regular Tasks
- Database backups (daily)
- Log rotation (weekly)
- Security updates (monthly)
- Performance review (monthly)
- User feedback review (weekly)

### Emergency Procedures
- Database restore process
- Rollback procedure
- Incident response plan
- Communication protocol

---

**Last Updated**: 2026-03-21
**Version**: 2.0.0
**Status**: Production Ready
