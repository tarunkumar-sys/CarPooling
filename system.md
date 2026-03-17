# AgraRide - System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [User Types & Roles](#user-types--roles)
4. [Core Features](#core-features)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Technical Stack](#technical-stack)
9. [Setup & Installation](#setup--installation)

---

## System Overview

**AgraRide** is a comprehensive carpooling web application for Agra, India. It connects drivers and passengers on similar routes to reduce traffic congestion, save costs, and promote sustainable transportation.

### Key Objectives
- Reduce traffic congestion in Agra
- Enable cost-sharing for commuters
- Provide safe carpooling with GPS tracking
- Emergency SOS alert system
- Real-time communication between users

### Target Users
- Daily commuters in Agra
- Students and office workers
- Occasional travelers within the city

---

## Architecture

### System Architecture
```
┌─────────────────────────────────────────┐
│     CLIENT (Browser)                     │
│  - React 19 + TypeScript                │
│  - Tailwind CSS (Orange theme)          │
│  - Framer Motion                         │
│  - Leaflet/OpenStreetMap                │
└─────────────────────────────────────────┘
              ↕ HTTP/REST API
┌─────────────────────────────────────────┐
│     SERVER (Node.js)                     │
│  - Express.js Backend                    │
│  - RESTful API endpoints                │
│  - Business logic layer                 │
└─────────────────────────────────────────┘
              ↕ SQL Queries
┌─────────────────────────────────────────┐
│     DATABASE (SQLite)                    │
│  - 7 tables with relationships          │
│  - better-sqlite3                       │
└─────────────────────────────────────────┘
```

### Design Patterns
- **MVC Pattern** - Model-View-Controller separation
- **Repository Pattern** - Centralized database access
- **RESTful API** - Standard HTTP methods and status codes
- **SPA Pattern** - Single Page Application with React Router

---


## User Types & Roles

### 1. Regular User (Driver/Passenger)
**Capabilities:**
- Register and login
- Offer rides as driver
- Search and book rides as passenger
- Real-time GPS tracking
- In-app messaging
- Rate other users
- Trigger SOS alerts
- View profile and statistics

### 2. Administrator
**Capabilities:**
- All regular user features
- View system statistics
- Manage users (view, delete, change roles)
- Manage rides (view, complete, delete)
- Monitor SOS alerts
- Direct database access
- SQL query execution

**Default Admin:**
- Email: `admin@agraride.com`
- Password: `admin`

---

## Core Features

### 1. User Authentication
- Registration with name, email, password, phone, gender, vehicle type
- Login with email and password
- Session persistence via localStorage
- Role-based access control (user/admin)

### 2. Ride Management

**Offer Ride (Driver):**
- Select vehicle type (2-wheeler/4-wheeler)
- Pick origin and destination on map
- Set departure time
- Define available seats (1-6)
- Set price per seat
- GPS coordinates stored automatically

**Search Rides (Passenger):**
- View all active rides
- See driver details and ratings
- Preview route on map
- Check available seats
- Make counter-offers on price

### 3. Booking System
- Request booking with seat count
- Optional counter-offer pricing
- Driver receives notification
- Accept/reject bookings
- Automatic seat management
- Status tracking (pending/confirmed/rejected)

### 4. Real-Time GPS Tracking
- Location updates every 3 seconds
- Driver position shared with passengers
- Interactive map with markers
- Route visualization
- Auto-complete when near destination
- Progress tracking

### 5. In-App Messaging
- Direct chat between users
- Ride-specific conversations
- Message history
- Inbox management
- Real-time updates (polling every 3s)

### 6. Rating System
- 5-star rating scale
- Optional written reviews
- Average rating on profiles
- Post-ride rating prompts
- Rating history visible to all

### 7. SOS Emergency System
- One-click emergency button
- Instant admin notification
- Ride details included
- Live tracking link
- Alert resolution tracking

### 8. Admin Dashboard
- System statistics (users, rides, bookings)
- User management table
- Ride monitoring
- SOS alert center
- Database management interface
- Passenger-driver pairings view

---


## Database Schema

### Tables Overview

#### 1. users
Stores all user accounts

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| name | TEXT | Full name |
| email | TEXT UNIQUE | Email address |
| password | TEXT | Password (plain text in dev) |
| role | TEXT | 'user' or 'admin' |
| phone | TEXT | Contact number |
| gender | TEXT | 'male', 'female', 'other' |
| vehicle_type | TEXT | 'bike', '4-wheeler', 'scooter' |

#### 2. rides
Stores ride offerings

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| driver_id | INTEGER FK | References users(id) |
| origin | TEXT | Starting location |
| destination | TEXT | Ending location |
| departure_time | TEXT | ISO datetime |
| available_seats | INTEGER | Seats available |
| price_per_seat | REAL | Price in INR |
| status | TEXT | 'active', 'completed', 'cancelled' |
| origin_lat | REAL | Origin GPS latitude |
| origin_lng | REAL | Origin GPS longitude |
| dest_lat | REAL | Destination GPS latitude |
| dest_lng | REAL | Destination GPS longitude |

#### 3. bookings
Stores booking requests

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| ride_id | INTEGER FK | References rides(id) |
| passenger_id | INTEGER FK | References users(id) |
| seats_booked | INTEGER | Number of seats |
| status | TEXT | 'pending', 'confirmed', 'rejected' |
| counter_offer_price | REAL | Optional counter-offer |

#### 4. locations
Real-time GPS tracking

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| ride_id | INTEGER FK | References rides(id) |
| user_id | INTEGER FK | References users(id) |
| latitude | REAL | GPS latitude |
| longitude | REAL | GPS longitude |
| updated_at | DATETIME | Last update time |

#### 5. messages
In-app chat messages

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| ride_id | INTEGER FK | References rides(id) |
| sender_id | INTEGER FK | References users(id) |
| receiver_id | INTEGER FK | References users(id) |
| content | TEXT | Message text |
| timestamp | DATETIME | Message time |

#### 6. ratings
User reviews

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| ride_id | INTEGER FK | References rides(id) |
| rater_id | INTEGER FK | User giving rating |
| rated_user_id | INTEGER FK | User being rated |
| rating | INTEGER | 1-5 stars |
| comment | TEXT | Optional review |
| timestamp | DATETIME | Rating time |

#### 7. sos_alerts
Emergency alerts

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| ride_id | INTEGER FK | References rides(id) |
| user_id | INTEGER FK | User who triggered |
| status | TEXT | 'active', 'resolved' |
| timestamp | DATETIME | Alert time |

### Relationships
```
users (1) ──drives──> (N) rides
users (1) ──books──> (N) bookings
rides (1) ──has──> (N) bookings
rides (1) ──tracks──> (N) locations
rides (1) ──contains──> (N) messages
rides (1) ──receives──> (N) ratings
rides (1) ──triggers──> (N) sos_alerts
```

---


## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Authenticate user

### Rides
- `GET /api/rides` - List all active rides
- `POST /api/rides` - Create new ride
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Delete ride (cascade)
- `POST /api/rides/complete/:id` - Mark ride complete
- `GET /api/rides/driver/:driverId` - Get driver's rides

### Bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/accept/:id` - Accept booking
- `POST /api/bookings/reject/:id` - Reject booking
- `GET /api/bookings/driver/:driverId` - Driver's requests
- `GET /api/bookings/passenger/:passengerId` - Passenger's bookings
- `GET /api/bookings/check/:rideId/:passengerId` - Check booking status

### Messages
- `GET /api/messages/:rideId` - Get ride messages
- `POST /api/messages` - Send message
- `GET /api/inbox/:userId` - Get user's conversations

### Ratings
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/:userId` - Get user's ratings

### Locations
- `POST /api/locations` - Update location
- `GET /api/locations/:rideId` - Get ride locations

### SOS Alerts
- `POST /api/sos` - Trigger SOS alert
- `POST /api/sos/resolve/:id` - Resolve alert

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/rides` - All rides
- `GET /api/admin/users` - All users
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/role` - Change user role
- `GET /api/admin/db/tables` - List database tables
- `GET /api/admin/db/table/:tableName` - Get table data
- `POST /api/admin/db/query` - Execute SQL query

### Users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile

---

## Frontend Components

### Pages
- `Home.tsx` - Landing page with features
- `AuthPage.tsx` - Login/Register forms
- `SearchRides.tsx` - Browse and book rides
- `OfferRide.tsx` - Create new ride
- `MyRides.tsx` - Driver's ride management
- `MyBookings.tsx` - Passenger's bookings
- `Profile.tsx` - User profile and stats
- `AdminDashboard.tsx` - Admin control panel

### Common Components
- `Navbar.tsx` - Navigation with active states
- `AnimatedLogo.tsx` - Animated brand logo
- `Inbox.tsx` - Message inbox

### Ride Components
- `GoogleMap.tsx` - Live tracking map
- `SimulatedMap.tsx` - Admin tracking map
- `LocationPicker.tsx` - Interactive location selector
- `RoutePreview.tsx` - Route visualization
- `Chat.tsx` - In-app messaging
- `RatingModal.tsx` - Rating submission
- `StarRating.tsx` - Star display component

### Booking Components
- `BookingRequests.tsx` - Driver's booking requests

### Admin Components
- `DatabaseManager.tsx` - Database interface

---


## Technical Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with orange theme
- **Framer Motion** - Smooth animations
- **React Router v7** - Client-side routing
- **Leaflet** - Interactive maps
- **Leaflet Routing Machine** - Real road-based routing with OSRM
- **Lucide React** - Icon library
- **date-fns** - Date formatting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **better-sqlite3** - Fast SQLite database

### Development Tools
- **Vite** - Lightning-fast build tool
- **tsx** - TypeScript execution
- **ESLint** - Code linting

### External APIs
- **OpenStreetMap** - Map tiles
- **OSRM (Open Source Routing Machine)** - Real road-based routing
- **Nominatim** - Geocoding
- **Browser Geolocation API** - GPS tracking

### Design System
- **Primary Color**: Orange (#f97316)
- **Typography**: Inter (body), Space Grotesk (headings)
- **Borders**: Minimal rounded (rounded-lg)
- **Shadows**: Subtle elevation (shadow-sm, shadow-md)
- **Responsive**: Mobile-first approach

---

## Setup & Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Modern web browser

### Installation Steps

1. **Clone repository**
```bash
git clone <repository-url>
cd agraride
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment variables** (Optional)
Create `.env` file:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```
Note: App works with OpenStreetMap by default

4. **Start development server**
```bash
npm run dev
```

5. **Access application**
- Local: `http://localhost:3000`
- Network: `http://<your-ip>:3000`

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # TypeScript type checking
npm run clean    # Clean build artifacts
```

### Database Initialization
- Database file: `agraride.db`
- Auto-created on first run
- Default admin user seeded automatically
- Schema migrations handled automatically

### Network Access
Server runs on `0.0.0.0:3000` for network accessibility:
- Test on mobile devices (same WiFi)
- Share with team members
- Access from tablets and other devices

---

## Security Considerations

### Current Implementation (Development)
- Plain text passwords
- localStorage for sessions
- No rate limiting
- No HTTPS

### Production Requirements
- **Password Hashing**: Use bcrypt or argon2
- **Authentication**: Implement JWT tokens
- **HTTPS**: SSL/TLS encryption
- **Rate Limiting**: Prevent abuse
- **CORS**: Configure allowed origins
- **Environment Variables**: Secure sensitive data
- **Input Validation**: Server-side validation
- **SQL Injection**: Use parameterized queries (already implemented)

---

## Performance Optimization

### Current Optimizations
- SQLite for fast local database
- Parameterized SQL queries
- Efficient React component structure
- Lazy loading potential
- Minimal dependencies

### Future Enhancements
- Redis caching
- CDN for static assets
- Database indexing
- Code splitting
- Image optimization
- Service workers for offline support

---

## Testing Strategy

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Ride creation with GPS
- [ ] Booking with counter-offers
- [ ] Real-time location tracking
- [ ] In-app messaging
- [ ] Rating submission
- [ ] SOS alert triggering
- [ ] Admin dashboard functions
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Automated Testing (Future)
- Unit tests for components
- Integration tests for API
- End-to-end tests for user flows
- Performance testing
- Security testing

---

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deployment Platforms
- **Vercel** - Frontend deployment
- **Railway** - Full-stack deployment
- **Heroku** - Full-stack deployment
- **DigitalOcean** - VPS deployment
- **AWS** - Scalable cloud deployment

### Environment Configuration
- Set NODE_ENV=production
- Configure database path
- Set up HTTPS
- Configure CORS
- Set up monitoring

---

## Troubleshooting

### Common Issues

**Database locked error:**
- Close other connections
- Restart server
- Check file permissions

**Port already in use:**
- Change port in server.ts
- Kill process using port 3000

**GPS not working:**
- Enable location permissions
- Use HTTPS in production
- Check browser compatibility

**Map not loading:**
- Check internet connection
- Verify OpenStreetMap access
- Check console for errors

---

## Contributing

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use Tailwind CSS classes
- Write descriptive commit messages
- Comment complex logic

### Git Workflow
1. Create feature branch
2. Implement feature
3. Test thoroughly
4. Create pull request
5. Code review
6. Merge to main

---

## License

Proprietary software for educational purposes.

---

## Support

For issues or questions:
- Review documentation files
- Check SRS for requirements
- Contact development team

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Status**: Active Development
