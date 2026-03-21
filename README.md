# AgraRide - Carpooling Platform

A modern, production-ready carpooling platform for Agra, India, built with React, TypeScript, and Express.

## 🚀 Features

### Core Functionality
- **Ride Offering**: Drivers can offer rides with detailed information
- **Ride Search**: Passengers can search and book available rides
- **Real-time Tracking**: Live GPS tracking during rides
- **Smart Notifications**: Push notifications for booking events
- **License Plate OCR**: Automatic vehicle verification using AI
- **Route Preview**: Interactive map-based route visualization
- **Rating System**: Post-ride ratings for drivers and passengers
- **SOS Emergency**: Emergency alert system for safety

### User Management
- **Role-based Access**: User, Driver, and Admin roles
- **Profile Management**: Complete user profile with preferences
- **Booking History**: Track all past and upcoming rides
- **Inbox System**: In-app messaging between users

### Technical Features
- **Mobile-First Design**: Responsive UI optimized for all devices
- **Semantic Color System**: Consistent UI with meaningful colors
- **Location Picker**: Worldwide location support with no restrictions
- **Offline Support**: Core features work without internet
- **Performance Optimized**: Fast loading and smooth interactions

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for maps and geocoding

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agraride
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   - `GEMINI_API_KEY`: For AI-powered features
   - Other configuration as needed

4. **Initialize database**
   ```bash
   npm run db:init
   ```

## 🚦 Running the Application

### Development Mode
```bash
npm run dev
```
Access the app at `http://localhost:5000`

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
agraride/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── common/         # Shared components (Navbar, Toast, etc.)
│   │   ├── ride/           # Ride-related components
│   │   ├── booking/        # Booking components
│   │   ├── ocr/            # OCR and AI components
│   │   └── admin/          # Admin dashboard components
│   ├── pages/              # Page components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── index.css           # Global styles
├── server.ts               # Express server
├── db.ts                   # Database configuration
└── public/                 # Static assets
```

## 🎨 Design System

### Color Palette
- **Brand Orange** (#f97316): Primary actions
- **Green** (#10b981): Success/Confirmed
- **Amber** (#f59e0b): Warning/Pending
- **Red** (#ef4444): Danger/Cancel
- **Blue** (#3b82f6): Informational

### Components
- Buttons: `.btn-primary`, `.btn-success`, `.btn-warning`, `.btn-danger`
- Badges: `.badge-success`, `.badge-warning`, `.badge-danger`
- Cards: `.card`, `.card-elevated`
- Inputs: `.input-field`

## 🔐 Security

- Input validation on client and server
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting (production)
- Secure session management

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📚 Documentation

- `roles.md` - User roles and permissions
- `TestCases.md` - Test cases and scenarios
- `SRS.md` - Software Requirements Specification
- `main.md` - Main documentation and architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed for Agra's sustainable transportation initiative.

## 🆘 Support

For issues and questions:
- Check documentation files
- Review test cases
- Contact support team

## 🔄 Version History

### v2.0.0 (Current)
- Worldwide location support
- Enhanced notification system
- Mobile-first redesign
- Production-ready optimizations
- Bug fixes and improvements

### v1.0.0
- Initial release
- Basic carpooling features
- Agra-focused functionality

---

**Made with ❤️ for sustainable transportation in Agra**
