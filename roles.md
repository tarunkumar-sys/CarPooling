# AgraRide - Team Role Documentation

## Team Structure

This document divides the AgraRide system into 4 distinct roles for a 4-person development team.

### Team Collaboration
- **Agile Methodology**: 2-week sprints
- **Daily Standups**: 15-minute sync meetings
- **Code Reviews**: All PRs reviewed before merge
- **Documentation**: Keep docs updated

---

## Role 1: Frontend UI/UX Developer

### Responsibilities
- User interface design and implementation
- User experience optimization
- Authentication pages
- Home and landing pages
- Profile and user-facing components
- Responsive design
- Animations and transitions

### Features Owned

#### 1. Authentication System
**Files**: `src/pages/AuthPage.tsx`, `src/App.tsx`
- Login/Register forms with validation
- Session management (localStorage)
- Animated transitions
- Error handling
- Responsive mobile design

#### 2. Home & Landing Page
**Files**: `src/pages/Home.tsx`
- Hero section with Taj Mahal background
- Feature cards
- Call-to-action buttons
- Framer Motion animations
- Responsive grid layouts

#### 3. User Profile Page
**Files**: `src/pages/Profile.tsx`
- Display user information
- Show statistics (rides, ratings)
- Edit profile functionality
- Recent reviews section
- Responsive card layouts

#### 4. Navigation & Layout
**Files**: `src/components/common/Navbar.tsx`, `src/components/common/AnimatedLogo.tsx`
- Top navigation with active states
- Mobile hamburger menu
- User profile dropdown
- Logout functionality
- Animated logo

#### 5. Styling & Design System
**Files**: `src/index.css`
- Global styles with orange theme
- Reusable CSS classes
- Typography system
- Responsive breakpoints
- Animation utilities

### Technologies
- React 19, TypeScript
- Tailwind CSS (Orange theme)
- Framer Motion
- React Router
- Responsive design

### API Endpoints Used
- `POST /api/register`
- `POST /api/login`
- `GET /api/ratings/:userId`
- `GET /api/users/:id`
- `PUT /api/users/:id`

---


## Role 2: Backend API Developer

### Responsibilities
- RESTful API design and implementation
- Business logic layer
- Authentication endpoints
- Ride and booking management APIs
- Error handling and validation
- API documentation

### Features Owned

#### 1. Authentication APIs
**Files**: `server.ts` (Auth section)
- `POST /api/register` - Register new user
- `POST /api/login` - Authenticate user
- Input validation
- Error handling

#### 2. Ride Management APIs
**Files**: `server.ts` (Rides section)
- `GET /api/rides` - List all active rides
- `POST /api/rides` - Create new ride
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Delete ride with cascade
- `POST /api/rides/complete/:id` - Mark complete
- `GET /api/rides/driver/:driverId` - Get driver's rides

#### 3. Booking System APIs
**Files**: `server.ts` (Bookings section)
- `POST /api/bookings` - Create booking with counter-offer
- `POST /api/bookings/accept/:id` - Accept booking
- `POST /api/bookings/reject/:id` - Reject booking
- `GET /api/bookings/driver/:driverId` - Driver's requests
- `GET /api/bookings/passenger/:passengerId` - Passenger's bookings
- `GET /api/bookings/check/:rideId/:passengerId` - Check status

#### 4. Messaging APIs
**Files**: `server.ts` (Chat section)
- `GET /api/messages/:rideId` - Get messages
- `POST /api/messages` - Send message
- `GET /api/inbox/:userId` - Get conversations

#### 5. Rating System APIs
**Files**: `server.ts` (Ratings section)
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/:userId` - Get user ratings

#### 6. Location Tracking APIs
**Files**: `server.ts` (Locations section)
- `POST /api/locations` - Update location
- `GET /api/locations/:rideId` - Get ride locations

### Technologies
- Node.js & Express.js
- TypeScript
- RESTful API design
- SQL with better-sqlite3
- Error handling
- HTTP status codes

### Database Tables Used
- users, rides, bookings
- messages, ratings, locations

---

## Role 3: Database & Admin Systems Developer

### Responsibilities
- Database schema design and management
- Admin dashboard implementation
- System monitoring and statistics
- User management features
- Database query interface
- SOS alert system

### Features Owned

#### 1. Database Schema & Setup
**Files**: `db.ts`
- Design and create all 7 tables
- Define relationships and foreign keys
- Handle schema migrations
- Seed initial data (admin user)
- Ensure data integrity

#### 2. Admin Dashboard Frontend
**Files**: `src/pages/AdminDashboard.tsx`
- System statistics overview
- Tab navigation (Overview, Rides, Users, Security, Database)
- Real-time data polling
- Responsive admin interface

#### 3. User Management System
**Files**: `src/pages/AdminDashboard.tsx` (Users tab), `server.ts`
- View all users in table
- Search users
- Delete users with cascade
- Change user roles
- Display user details

**APIs**:
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/role` - Change role

#### 4. Ride Management System
**Files**: `src/pages/AdminDashboard.tsx` (Rides tab), `server.ts`
- View all rides
- Search and filter rides
- Delete rides
- Mark rides as completed
- Track rides live

**APIs**:
- `GET /api/admin/rides` - List all rides

#### 5. SOS Alert System
**Files**: `src/pages/AdminDashboard.tsx` (Security tab), `server.ts`
- Display active SOS alerts
- Show ride and user details
- Track ride location
- Resolve alerts

**APIs**:
- `POST /api/sos` - Create SOS alert
- `POST /api/sos/resolve/:id` - Resolve alert

#### 6. Database Management Interface
**Files**: `src/components/admin/DatabaseManager.tsx`, `server.ts`
- List all database tables
- View table contents
- Execute custom SQL queries

**APIs**:
- `GET /api/admin/db/tables` - List tables
- `GET /api/admin/db/table/:tableName` - Get table data
- `POST /api/admin/db/query` - Execute query

#### 7. System Statistics
**Files**: `server.ts`
- `GET /api/admin/stats` - System statistics

### Technologies
- SQLite database design
- SQL queries (SELECT, INSERT, UPDATE, DELETE, JOIN)
- Database relationships
- Cascade deletes
- React table components
- Admin UI patterns

---


## Role 4: Maps & Real-Time Features Developer

### Responsibilities
- Map integration and visualization
- Real-time GPS location tracking
- Location picker components
- Route preview and navigation
- Ride search and booking UI
- My Rides and My Bookings pages

### Features Owned

#### 1. Map Integration
**Files**: 
- `src/components/ride/GoogleMap.tsx`
- `src/components/ride/SimulatedMap.tsx`
- `src/components/ride/LocationPicker.tsx`
- `src/components/ride/RoutePreview.tsx`

**Responsibilities**:
- Integrate Leaflet/OpenStreetMap
- Display markers for locations
- Show routes between points
- Real-time location updates
- Interactive map controls

#### 2. Location Picker
**Files**: `src/components/ride/LocationPicker.tsx`
- Interactive map for selecting locations
- Search functionality (Nominatim API)
- Current location detection
- Click to select on map
- Display coordinates

#### 3. Real-Time Tracking
**Files**: `src/components/ride/GoogleMap.tsx`
- Fetch locations every 3 seconds
- Display driver position
- Show route progress
- Multiple user tracking
- Auto-refresh

#### 4. Search Rides Page
**Files**: `src/pages/SearchRides.tsx`
- Browse available rides
- View driver details
- Route preview on map
- Booking with counter-offers
- Real-time updates

#### 5. Offer Ride Page
**Files**: `src/pages/OfferRide.tsx`
- Create ride form
- Location picker integration
- Vehicle selection
- Seat and price configuration
- GPS coordinate capture

#### 6. My Rides Page
**Files**: `src/pages/MyRides.tsx`
- Display driver's rides
- Booking requests management
- Accept/reject bookings
- Live tracking button
- Ride statistics

#### 7. My Bookings Page
**Files**: `src/pages/MyBookings.tsx`
- Display passenger's bookings
- Booking status tracking
- Live tracking button
- Rating after completion

### Technologies
- Leaflet & React-Leaflet
- OpenStreetMap
- Nominatim Geocoding API
- Browser Geolocation API
- Real-time polling
- GPS coordinates

### API Endpoints Used
- `GET /api/rides`
- `POST /api/rides`
- `GET /api/bookings/*`
- `POST /api/bookings`
- `GET /api/locations/:rideId`
- `POST /api/locations`

---

## Cross-Role Collaboration

### Communication
- Daily standups for sync
- Code reviews for quality
- Shared documentation
- Issue tracking

### Integration Points
- Frontend ↔ Backend: API contracts
- Backend ↔ Database: Schema design
- Maps ↔ Backend: Location APIs
- UI ↔ Maps: Component integration

### Best Practices
- Write clean, documented code
- Follow TypeScript types
- Use consistent naming
- Test your changes
- Update documentation

---

## Development Workflow

### Git Workflow
1. Create feature branch
2. Implement feature
3. Test locally
4. Create pull request
5. Code review
6. Merge to main

### Testing Checklist
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] API returns correct data
- [ ] Database updates correctly
- [ ] No TypeScript errors

---

## Quick Reference

### File Structure
```
agraride/
├── src/
│   ├── pages/          # Main pages
│   ├── components/     # Reusable components
│   ├── types.ts        # TypeScript interfaces
│   └── index.css       # Global styles
├── server.ts           # Backend API
├── db.ts               # Database setup
└── package.json        # Dependencies
```

### Key Commands
```bash
npm run dev      # Start development
npm run build    # Build for production
npm run lint     # Check TypeScript
```

### Default Admin
- Email: `admin@agraride.com`
- Password: `admin`

---

**Last Updated**: March 2026
