# AgraRide — Advanced Carpooling Platform

<div align="center">

A production-ready carpooling platform with AI-powered license plate recognition, real-time GPS tracking, and global location support.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-success?style=for-the-badge)](https://agraride.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/tarunkumar-sys/CarPooling)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen?style=for-the-badge)](CHANGELOG.md)

</div>

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite, PWA |
| **Backend** | Node.js 18+, Express.js, SQLite, WebSocket |
| **AI / Vision** | Google Gemini AI, OpenCV.js, Tesseract.js |
| **Maps** | OpenStreetMap, Leaflet, Nominatim |
| **Tooling** | ESLint, Prettier, Jest, Playwright |

---

## Features

### AI & Computer Vision
- **License Plate Recognition** — Google Gemini AI with 95%+ accuracy and confidence scoring
- **OpenCV.js Preprocessing** — Edge detection and image enhancement before OCR
- **Tesseract.js Fallback** — Offline OCR processing for reliability
- **Smart Validation** — Indian license plate format validation (e.g. `UP80AB1234`)

### Real-Time & Location
- **Live GPS Tracking** — Location updates every 3 seconds via WebSocket
- **Global Coverage** — Worldwide geocoding with no geographical restrictions
- **Interactive Maps** — Location picker with real-time search powered by Leaflet

### Safety & Security
- **Emergency SOS** — One-click safety alerts with live location sharing and admin monitoring
- **JWT + Bcrypt** — Secure session management and password hashing
- **Role-Based Access** — User, admin, and emergency responder roles
- **SQL Injection Prevention** — Parameterized queries with `better-sqlite3`

### Progressive Web App
- **Offline Support** — Service Workers with background sync and intelligent caching
- **Push Notifications** — Smart browser notifications with scheduling
- **Installable** — App manifest with custom icons for native-like experience

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- GPS-enabled device and camera access for full feature support

### Installation

```bash
# Clone the repository
git clone https://github.com/tarunkumar-sys/CarPooling.git
cd CarPooling

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

**`.env` configuration:**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=./agraride.db
GEMINI_API_KEY=your_google_gemini_api_key
SESSION_SECRET=your_secure_session_secret
CORS_ORIGIN=http://localhost:5000
```

```bash
# Initialize database
npm run db:init

# Start development server
npm run dev
```

App runs at `http://localhost:3000`

---

## Project Structure

```
agraride/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Navbar, Toast, NotificationBell
│   │   ├── ride/          # GPS tracking and map components
│   │   ├── booking/       # Booking management
│   │   ├── ocr/           # AI OCR and computer vision
│   │   ├── profile/       # User profile and image upload
│   │   └── admin/         # Admin dashboard
│   ├── pages/             # Page components and routing
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Utility functions
├── server.ts              # Express server
├── db.ts                  # Database schema and config
├── public/                # Static assets and PWA manifest
└── docs/
    ├── SRS.md             # Software Requirements Specification
    ├── main.md            # Technical architecture
    └── TestCases.md       # Test cases and scenarios
```

---

## Testing

```bash
npm test                 # Run all tests
npm run test:coverage    # Coverage report
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run test:e2e         # Playwright end-to-end tests
```

**Testing strategy:** Unit (Jest) → Component (React Testing Library) → Integration (Supertest) → E2E (Playwright). Minimum 80% coverage required.

---

## Demo

**Live:** [https://agraride.onrender.com](https://agraride.onrender.com)

| Role | Email | Password |
|------|-------|----------|
| User | `demo@agraride.com` | `demo123` |
| Admin | `admin@agraride.com` | `admin123` |

---

## Roadmap

**v2.1.0 (Upcoming)**
- Email and SMS notification integration
- Payment gateway support
- Multi-language / i18n support

**v3.0.0 (Future)**
- ML-based route optimization
- Dynamic pricing engine
- Carbon footprint tracking and rewards
- Enterprise fleet management

---

## Contributing

```bash
git checkout -b feature/your-feature
# Make changes with tests and docs
git commit -m 'feat: describe your change'
git push origin feature/your-feature
# Open a Pull Request
```

Please follow TypeScript strict mode, ESLint/Prettier config, and maintain 80%+ test coverage on new code.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

**Third-party services:** Google Gemini AI (Google ToS), OpenStreetMap (ODbL), Nominatim (usage policy).

---

<div align="center">
  Built with ❤️ for sustainable transportation and smart mobility.
</div>
