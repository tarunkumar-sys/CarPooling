/**
 * ============================================
 * CUSTOM 3D ISOMETRIC MAP PIN ICONS
 * ============================================
 * 
 * High-quality 3D isometric map pins for carpool app
 * - Soft-matte rounded teardrop shape
 * - Vibrant colors with gradients
 * - Smooth clay/plastic material effect
 * - Soft ambient occlusion shadows
 * - Studio lighting effect
 * - Trendy minimalist UI design
 */

import L from 'leaflet';

// ============================================
// PICKUP PIN - Electric Blue with 3D Effect
// ============================================
export const createPickupIcon3D = () => L.divIcon({
    html: `
        <div class="map-pin-container">
            <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Shadow (Ambient Occlusion) -->
                <ellipse cx="30" cy="75" rx="12" ry="3" fill="black" opacity="0.15"/>
                
                <!-- Main Pin Body - Teardrop Shape with Gradient -->
                <defs>
                    <linearGradient id="pickupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#2563eb;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
                    </linearGradient>
                    
                    <!-- Shine/Highlight Gradient -->
                    <radialGradient id="pickupShine" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.4" />
                        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                    </radialGradient>
                    
                    <!-- Inner Shadow -->
                    <radialGradient id="pickupShadow" cx="70%" cy="70%">
                        <stop offset="0%" style="stop-color:#000000;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#000000;stop-opacity:0.2" />
                    </radialGradient>
                </defs>
                
                <!-- Pin Shape - Rounded Teardrop -->
                <path d="M30 10 C 15 10, 10 20, 10 32 C 10 45, 30 65, 30 65 C 30 65, 50 45, 50 32 C 50 20, 45 10, 30 10 Z" 
                      fill="url(#pickupGradient)" 
                      stroke="#1e40af" 
                      stroke-width="1.5"
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"/>
                
                <!-- Highlight/Shine Effect -->
                <ellipse cx="25" cy="22" rx="12" ry="15" fill="url(#pickupShine)"/>
                
                <!-- Inner Shadow for Depth -->
                <path d="M30 10 C 15 10, 10 20, 10 32 C 10 45, 30 65, 30 65 C 30 65, 50 45, 50 32 C 50 20, 45 10, 30 10 Z" 
                      fill="url(#pickupShadow)" 
                      opacity="0.3"/>
                
                <!-- Inner Circle (White) -->
                <circle cx="30" cy="30" r="12" fill="white" opacity="0.95"/>
                
                <!-- Icon - Location Pin -->
                <path d="M30 22 C 26 22, 24 24, 24 27 C 24 30, 30 36, 30 36 C 30 36, 36 30, 36 27 C 36 24, 34 22, 30 22 Z" 
                      fill="#2563eb"/>
                <circle cx="30" cy="27" r="2" fill="white"/>
                
                <!-- Glossy Top Highlight -->
                <ellipse cx="30" cy="18" rx="8" ry="4" fill="white" opacity="0.3"/>
            </svg>
        </div>
    `,
    className: 'custom-3d-pin pickup-pin',
    iconSize: [60, 80],
    iconAnchor: [30, 75],
    popupAnchor: [0, -75],
});

// ============================================
// DESTINATION PIN - Vibrant Red with 3D Effect
// ============================================
export const createDestinationIcon3D = () => L.divIcon({
    html: `
        <div class="map-pin-container">
            <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Shadow -->
                <ellipse cx="30" cy="75" rx="12" ry="3" fill="black" opacity="0.15"/>
                
                <defs>
                    <linearGradient id="destGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#dc2626;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
                    </linearGradient>
                    
                    <radialGradient id="destShine" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.4" />
                        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                    </radialGradient>
                    
                    <radialGradient id="destShadow" cx="70%" cy="70%">
                        <stop offset="0%" style="stop-color:#000000;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#000000;stop-opacity:0.2" />
                    </radialGradient>
                </defs>
                
                <!-- Pin Shape -->
                <path d="M30 10 C 15 10, 10 20, 10 32 C 10 45, 30 65, 30 65 C 30 65, 50 45, 50 32 C 50 20, 45 10, 30 10 Z" 
                      fill="url(#destGradient)" 
                      stroke="#991b1b" 
                      stroke-width="1.5"
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"/>
                
                <!-- Highlight -->
                <ellipse cx="25" cy="22" rx="12" ry="15" fill="url(#destShine)"/>
                
                <!-- Inner Shadow -->
                <path d="M30 10 C 15 10, 10 20, 10 32 C 10 45, 30 65, 30 65 C 30 65, 50 45, 50 32 C 50 20, 45 10, 30 10 Z" 
                      fill="url(#destShadow)" 
                      opacity="0.3"/>
                
                <!-- Inner Circle -->
                <circle cx="30" cy="30" r="12" fill="white" opacity="0.95"/>
                
                <!-- Icon - Flag -->
                <path d="M26 24 L26 36 M26 24 L34 27 L26 30" 
                      stroke="#dc2626" 
                      stroke-width="2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      fill="#dc2626"/>
                
                <!-- Glossy Highlight -->
                <ellipse cx="30" cy="18" rx="8" ry="4" fill="white" opacity="0.3"/>
            </svg>
        </div>
    `,
    className: 'custom-3d-pin destination-pin',
    iconSize: [60, 80],
    iconAnchor: [30, 75],
    popupAnchor: [0, -75],
});

// ============================================
// CAR PIN - Electric Blue with 3D Car Icon
// ============================================
export const createCarIcon3D = (heading: number = 0) => L.divIcon({
    html: `
        <div class="map-pin-container" style="transform: rotate(${heading}deg);">
            <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Pulsing Ring Animation -->
                <circle cx="35" cy="35" r="30" fill="#3b82f6" opacity="0.2" class="pulse-ring"/>
                
                <defs>
                    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
                    </linearGradient>
                    
                    <radialGradient id="carShine" cx="40%" cy="40%">
                        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.6" />
                        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                    </radialGradient>
                    
                    <filter id="carShadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.3"/>
                    </filter>
                </defs>
                
                <!-- Main Circle Body -->
                <circle cx="35" cy="35" r="22" fill="url(#carGradient)" filter="url(#carShadow)"/>
                
                <!-- Shine Effect -->
                <circle cx="35" cy="35" r="22" fill="url(#carShine)"/>
                
                <!-- White Border -->
                <circle cx="35" cy="35" r="22" fill="none" stroke="white" stroke-width="3" opacity="0.8"/>
                
                <!-- Car Icon -->
                <g transform="translate(35, 35)">
                    <!-- Car Body -->
                    <path d="M-8 -2 L-6 -6 L6 -6 L8 -2 L8 4 L-8 4 Z" 
                          fill="white" 
                          stroke="white" 
                          stroke-width="1.5"/>
                    
                    <!-- Windows -->
                    <rect x="-5" y="-5" width="4" height="3" fill="#3b82f6" opacity="0.6"/>
                    <rect x="1" y="-5" width="4" height="3" fill="#3b82f6" opacity="0.6"/>
                    
                    <!-- Wheels -->
                    <circle cx="-5" cy="4" r="2" fill="white"/>
                    <circle cx="5" cy="4" r="2" fill="white"/>
                </g>
                
                <!-- Direction Arrow -->
                <path d="M35 10 L40 20 L35 17 L30 20 Z" fill="white" opacity="0.9"/>
                
                <!-- Glossy Highlight -->
                <ellipse cx="30" cy="25" rx="10" ry="8" fill="white" opacity="0.2"/>
            </svg>
        </div>
    `,
    className: 'custom-3d-pin car-pin',
    iconSize: [70, 70],
    iconAnchor: [35, 35],
    popupAnchor: [0, -35],
});

// ============================================
// ALTERNATIVE: Simpler Flat Design Pins
// ============================================
export const createPickupIconFlat = () => L.divIcon({
    html: `
        <div class="map-pin-flat">
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5 C 12 5, 8 10, 8 16 C 8 24, 20 40, 20 40 C 20 40, 32 24, 32 16 C 32 10, 28 5, 20 5 Z" 
                      fill="#10b981" 
                      stroke="white" 
                      stroke-width="2"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
                <circle cx="20" cy="16" r="5" fill="white"/>
            </svg>
        </div>
    `,
    className: 'custom-flat-pin',
    iconSize: [40, 50],
    iconAnchor: [20, 45],
});

export const createDestinationIconFlat = () => L.divIcon({
    html: `
        <div class="map-pin-flat">
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5 C 12 5, 8 10, 8 16 C 8 24, 20 40, 20 40 C 20 40, 32 24, 32 16 C 32 10, 28 5, 20 5 Z" 
                      fill="#ef4444" 
                      stroke="white" 
                      stroke-width="2"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
                <circle cx="20" cy="16" r="5" fill="white"/>
            </svg>
        </div>
    `,
    className: 'custom-flat-pin',
    iconSize: [40, 50],
    iconAnchor: [20, 45],
});
