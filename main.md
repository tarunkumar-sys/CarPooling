# AgraRide - Technical Documentation

## System Architecture

### Overview
AgraRide is a full-stack carpooling platform built with modern web technologies, designed for scalability, performance, and user experience.

### Technology Stack

#### Frontend
- **React 19**: UI library with latest features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **Motion (Framer Motion)**: Smooth animations
- **React Router**: Client-side routing
- **Leaflet**: Interactive maps
- **Lucide React**: Modern icon library

#### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Better-SQLite3**: Database
- **TypeScript**: Type-safe server code

#### AI & Services
- **Google Gemini AI**: License plate OCR
- **Tesseract.js**: Backup OCR engine
- **OpenCV.js**: Image processing
- **Nominatim**: Geocoding service

## Core Features

### 1. Ride Management

#### Offer Ride
- Vehicle type selection (2-wheeler/4-wheeler)
- Location picker with worldwide support
- Date/time selection
- Price and seat configuration
- License plate verification with OCR

#### Search Rides
- Real-time search with filters
- Map-based visualization
- Distance calculation
- Price comparison
- Instant booking

### 2. Booking System

#### Booking Flow
1. Passenger searches for rides
2. Views ride details and route
3. Requests booking (with optional counter-offer)
4. Driver accepts/rejects
5. Confirmation notification sent
6. 30-minute departure reminder
7. Live tracking during ride
8. Post-ride rating

#### Booking States
- **Pending**: Awaiting driver response
- **Confirmed**: Driver accepted
- **Rejected**: Driver declined
- **Cancelled**: Either party cancelled
- **Completed**: Ride finished

### 3. Location Services

#### Location Picker
- Interactive map interface
- Search functionality (worldwide)
- Click-to-select on map
- Reverse geocoding
- Current location detection
- No distance restrictions

#### Features
- Multi-tier search strategy
- Fallback to coordinates
- Automatic map adjustment
- 5-second timeout protection
- Offline coordinate selection

### 4. Notification System

#### Notification Types
1. **Booking Request**: Driver receives when passenger books
2. **Booking Confirmed**: Passenger receives on acceptance
3. **Booking Rejected**: Passenger receives on rejection
4. **Booking Cancelled**: Both parties on cancellation
5. **Departure Reminder**: 30 minutes before departure
6. **Ride Started**: When driver starts the ride
7. **Ride Completed**: When ride finishes

#### Delivery Methods
- **Push Notifications**: Browser notifications
- **In-App Notifications**: Notification bell with badge
- **Toast Messages**: Immediate feedback
- **Scheduled Reminders**: Automated timing

### 5. Real-Time Tracking

#### GPS Tracking
- Live driver location updates
- Route visualization
- ETA calculation
- Distance tracking
- Heading/direction indicator

#### Safety Features
- SOS emergency button
- Location sharing
- Emergency contacts
- Ride monitoring

### 6. License Plate OCR

#### AI-Powered Verification
- Camera capture interface
- Automatic plate detection
- AI extraction (Gemini)
- Fallback OCR (Tesseract)
- Validation and formatting

#### Process Flow
1. User captures vehicle image
2. OpenCV detects plate region
3. AI extracts text
4. System validates format
5. Auto-fills vehicle details

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  phone TEXT,
  gender TEXT,
  vehicle_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Rides Table
```sql
CREATE TABLE rides (
  id INTEGER PRIMARY KEY,
  driver_id INTEGER NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_lat REAL,
  origin_lng REAL,
  dest_lat REAL,
  dest_lng REAL,
  departure_time DATETIME NOT NULL,
  available_seats INTEGER NOT NULL,
  price_per_seat REAL NOT NULL,
  status TEXT DEFAULT 'active',
  driver_vehicle TEXT,
  driver_vehicle_description TEXT,
  license_plate TEXT,
  license_plate_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id)
)
```

### Bookings Table
```sql
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
)
```

### Ratings Table
```sql
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
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  ride_id INTEGER,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (ride_id) REFERENCES rides(id)
)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Rides
- `GET /api/rides` - Get all active rides
- `GET /api/rides/:id` - Get ride details
- `POST /api/rides` - Create new ride
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Cancel ride
- `GET /api/rides/driver/:driverId` - Get driver's rides

### Bookings
- `GET /api/bookings/passenger/:passengerId` - Get passenger bookings
- `GET /api/bookings/ride/:rideId` - Get ride bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/accept` - Accept booking
- `PUT /api/bookings/:id/reject` - Reject booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Ratings
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/user/:userId` - Get user ratings

### Messages
- `GET /api/messages/:userId` - Get user messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

### OCR
- `POST /api/ocr/extract` - Extract license plate from image

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
