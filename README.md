# 🚗 AgraRide - Smart Carpooling Platform

> A modern carpooling web application for Agra city with real-time GPS tracking, in-app messaging, and smart booking system.

## ✨ Key Features

- **User Authentication** - Secure registration and login system
- **Ride Management** - Offer and search rides with GPS coordinates
- **Smart Booking** - Counter-offer pricing and instant confirmations
- **Live GPS Tracking** - Real-time location updates every 3 seconds
- **Professional Maps** - Smooth, Uber-like map experience with real road routing
- **Auto-Fit Bounds** - Maps automatically center to show complete routes
- **OSRM Routing** - Accurate road-based routing with distance and duration
- **In-App Messaging** - Direct chat between drivers and passengers
- **Rating System** - 5-star reviews for trust and safety
- **SOS Emergency** - One-click emergency alerts to admin
- **Admin Dashboard** - Complete system monitoring and management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd agraride

# Install dependencies
npm install

# Start development server
npm run dev

# Access application
# Local: http://localhost:3000
# Network: http://<your-ip>:3000
```

### Default Admin Access
- Email: `admin@agraride.com`
- Password: `admin`

## 🛠️ Tech Stack

**Frontend**
- React 19 + TypeScript
- Tailwind CSS 4 (Orange theme)
- Framer Motion (Animations)
- Leaflet + Leaflet Routing Machine (Maps with OSRM)
- React Router v7

**Backend**
- Node.js + Express.js
- TypeScript
- SQLite (better-sqlite3)

**External APIs**
- OpenStreetMap (Maps)
- OSRM (Road Routing)
- Nominatim (Geocoding)
- Browser Geolocation API

## 📱 Core Functionality

### For Drivers
1. Create ride with route and pricing
2. Receive booking requests
3. Accept/reject bookings (including counter-offers)
4. Share live location during ride
5. Rate passengers after completion

### For Passengers
1. Search available rides
2. View driver details and ratings
3. Book rides with optional counter-offers
4. Track ride in real-time
5. Chat with driver
6. Rate driver after completion

### For Admins
1. Monitor system statistics
2. Manage users and rides
3. Handle SOS emergency alerts
4. View passenger-driver pairings
5. Direct database access

## 🗄️ Database Schema

7 core tables with relationships:
- **users** - User accounts and profiles
- **rides** - Ride offerings with GPS coordinates
- **bookings** - Booking requests and confirmations
- **locations** - Real-time GPS tracking data
- **messages** - In-app chat messages
- **ratings** - User reviews and ratings
- **sos_alerts** - Emergency alerts

## 📖 Documentation

- **[system.md](./system.md)** - Complete technical documentation
- **[roles.md](./roles.md)** - Team role-based documentation
- **[SRS.md](./SRS.md)** - Software requirements specification

## 🎨 Design System

- **Primary Color**: Orange (#f97316)
- **Typography**: Inter (body), Space Grotesk (headings)
- **Borders**: Minimal rounded (rounded-lg)
- **Shadows**: Subtle elevation
- **Responsive**: Mobile-first design

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # TypeScript type checking
npm run clean    # Clean build artifacts
```

## 🌐 Network Access

Server runs on `0.0.0.0:3000` for network accessibility:
- Test on mobile devices (same WiFi)
- Share with team members
- Access from any device on local network

## 🔒 Security Notes

**Current Implementation** (Development):
- Plain text passwords
- localStorage sessions
- No rate limiting

**Production Requirements**:
- Password hashing (bcrypt/argon2)
- JWT authentication
- HTTPS/SSL
- Rate limiting
- CORS configuration
- Environment variables

## 📊 Project Stats

- **Files**: 50+
- **Lines of Code**: 5000+
- **API Endpoints**: 40+
- **React Components**: 25+
- **Pages**: 8

## 🤝 Team Structure

Designed for 4-person development team:
1. **Frontend UI/UX Developer** - Auth, Home, Profile
2. **Backend API Developer** - RESTful APIs, Business Logic
3. **Database & Admin Developer** - Schema, Admin Dashboard
4. **Maps & Real-Time Developer** - GPS Tracking, Location Features

See [roles.md](./roles.md) for detailed responsibilities.

## 🔮 Future Enhancements

- Payment gateway integration (UPI, Razorpay)
- Push notifications
- Mobile app (React Native)
- AI-based ride matching
- Recurring ride scheduling
- Carbon footprint tracking
- Multi-language support (Hindi, English)

## 📄 License

Proprietary software for educational purposes.

## 🙏 Acknowledgments

- OpenStreetMap - Free map data
- Nominatim - Geocoding services
- Lucide - Icon library
- Tailwind CSS - Styling framework

---

**Built with ❤️ for Agra** | *Making carpooling safe, affordable, and sustainable*
