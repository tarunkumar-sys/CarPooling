# AgraRide - Carpooling Platform

A modern, full-featured carpooling platform for Agra city with real-time tracking, SOS features, and advanced vehicle recognition.

## 🚀 Features

### Core Functionality
- **Ride Sharing**: Offer and search for rides within Agra
- **Real-time Tracking**: Live GPS tracking with Leaflet maps
- **Smart Routing**: OSRM-powered route calculation with instant fallback
- **Booking System**: Request, confirm, and manage ride bookings
- **Rating System**: Rate drivers and passengers after rides
- **Messaging**: In-app communication between users

### Advanced Features
- **SOS System**: Emergency alert system for active rides
- **Vehicle Recognition**: AI-powered license plate detection using OpenCV.js and Tesseract.js
- **Admin Dashboard**: Comprehensive management interface
- **User Profiles**: Detailed user information and ride history
- **Location Picker**: Interactive map-based location selection

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Leaflet** for maps
- **OpenCV.js** for image processing
- **Tesseract.js** for OCR

### Backend
- **Node.js** with Express
- **SQLite** database
- **RESTful API** architecture

## 📁 Project Structure

```
agraride/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin components
│   │   ├── booking/        # Booking components
│   │   ├── common/         # Shared components
│   │   ├── ocr/            # Vehicle recognition system
│   │   └── ride/           # Ride-related components
│   ├── contexts/           # React contexts
│   ├── pages/              # Page components
│   └── types.ts            # TypeScript definitions
├── server.ts               # Express server
├── db.ts                   # Database configuration
└── docs/                   # Documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd agraride
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Initialize database
```bash
npm run db:init
```

5. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📖 Documentation

- **[System Architecture](system.md)** - Complete system design and architecture
- **[User Roles](roles.md)** - User roles and permissions
- **[Main Features](main.md)** - Detailed feature documentation
- **[Test Cases](TestCases.md)** - Testing scenarios and cases
- **[SRS](SRS.md)** - Software Requirements Specification

## 🎯 Key Features

### 1. Vehicle License Plate Recognition
- Browser-based ALPR system
- OpenCV.js for plate detection
- Tesseract.js for OCR
- Indian license plate validation
- Auto-fill vehicle information

### 2. Smart Map System
- Instant route display (Uber/Ola style)
- OSRM routing with fallback
- Zero flickering
- Optimized for performance
- Mobile responsive

### 3. SOS Emergency System
- One-click emergency alerts
- Location sharing
- Admin monitoring
- Emergency contact display

### 4. Booking Management
- Real-time booking status
- Counter-offer system
- Booking history
- Rating and reviews

## 🔐 User Roles

### Passenger
- Search and book rides
- Track active rides
- Rate drivers
- Manage bookings

### Driver
- Offer rides
- Manage ride requests
- Vehicle verification
- Earnings tracking

### Admin
- User management
- Ride monitoring
- SOS handling
- System analytics

## 🗺️ Map Features

### Route Preview
- Instant display with fallback calculation
- OSRM routing in background
- Distance and duration estimation
- Pricing calculation

### Live Tracking
- Real-time GPS updates
- Route progress indicator
- ETA calculation
- Driver location sharing

### Location Picker
- Interactive map selection
- Address search
- Geocoding with multiple fallbacks
- Coordinate precision

## 🚨 Safety Features

### SOS System
- Emergency button on active rides
- Location sharing with authorities
- Admin notification
- Emergency contact display

### Verification
- License plate verification
- User ratings
- Ride history
- Identity verification

## 📱 Mobile Support

- Fully responsive design
- Touch-optimized interface
- Camera access for OCR
- GPS tracking
- Push notifications (planned)

## 🧪 Testing

Run tests:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

## 🚀 Deployment

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## 📊 Performance

- **Initial Load**: < 2s
- **Route Calculation**: < 1s (instant fallback)
- **OCR Processing**: 1-2s
- **Map Rendering**: 60fps
- **Zero Re-renders**: Optimized React components

## 🔧 Configuration

### Environment Variables
```env
PORT=3000
DATABASE_URL=./agraride.db
NODE_ENV=production
```

### Map Configuration
- Default center: Agra (27.1767, 78.0081)
- Zoom levels: 12-19
- Tile provider: OpenStreetMap

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Development Team**: Full-stack developers
- **Design Team**: UI/UX designers
- **QA Team**: Quality assurance engineers

## 📞 Support

For support, email support@agraride.com or join our Slack channel.

## 🎉 Acknowledgments

- OpenStreetMap for map tiles
- OSRM for routing
- Tesseract.js for OCR
- OpenCV.js for image processing
- React community for amazing tools

---

Built with ❤️ for Agra city
