/**
 * Generates school logo PNG files for icon.png, adaptive-icon.png, splash.png
 * Run: node generate-logo.js
 */
const fs = require('fs');
const path = require('path');

// SVG templates
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <!-- Background -->
  <rect width="1024" height="1024" rx="200" fill="#1a237e"/>
  <!-- Outer ring -->
  <circle cx="512" cy="512" r="420" fill="none" stroke="#FFB300" stroke-width="12" opacity="0.6"/>
  <!-- Inner circle -->
  <circle cx="512" cy="512" r="350" fill="rgba(255,255,255,0.08)"/>
  <!-- Book shape -->
  <rect x="280" y="380" width="220" height="260" rx="12" fill="#FFB300"/>
  <rect x="300" y="395" width="180" height="230" rx="8" fill="#1a237e"/>
  <line x1="390" y1="395" x2="390" y2="625" stroke="#FFB300" stroke-width="4" opacity="0.5"/>
  <!-- Right page -->
  <rect x="524" y="380" width="220" height="260" rx="12" fill="#FFB300" opacity="0.9"/>
  <rect x="544" y="395" width="180" height="230" rx="8" fill="#1565c0"/>
  <!-- Lines on book -->
  <line x1="320" y1="450" x2="375" y2="450" stroke="rgba(255,179,0,0.6)" stroke-width="6" stroke-linecap="round"/>
  <line x1="320" y1="480" x2="375" y2="480" stroke="rgba(255,179,0,0.5)" stroke-width="5" stroke-linecap="round"/>
  <line x1="320" y1="510" x2="375" y2="510" stroke="rgba(255,179,0,0.4)" stroke-width="5" stroke-linecap="round"/>
  <line x1="564" y1="450" x2="700" y2="450" stroke="rgba(255,255,255,0.5)" stroke-width="6" stroke-linecap="round"/>
  <line x1="564" y1="480" x2="700" y2="480" stroke="rgba(255,255,255,0.4)" stroke-width="5" stroke-linecap="round"/>
  <line x1="564" y1="510" x2="700" y2="510" stroke="rgba(255,255,255,0.3)" stroke-width="5" stroke-linecap="round"/>
  <!-- Graduation cap -->
  <polygon points="512,180 350,270 512,360 674,270" fill="#FFB300"/>
  <rect x="640" y="270" width="12" height="80" rx="6" fill="#FFB300"/>
  <circle cx="646" cy="356" r="16" fill="#FFB300"/>
  <!-- Stars -->
  <text x="220" y="760" font-size="60" fill="#FFB300" opacity="0.7">★</text>
  <text x="740" y="760" font-size="60" fill="#FFB300" opacity="0.7">★</text>
  <!-- School text -->
  <text x="512" y="870" font-size="72" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Arial">EduConnect</text>
  <text x="512" y="930" font-size="36" fill="#FFB300" text-anchor="middle" font-family="Arial" letter-spacing="6">PARENT</text>
</svg>`;

const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">
  <rect width="1284" height="2778" fill="#1a237e"/>
  <!-- Decorative circles -->
  <circle cx="1100" cy="200" r="300" fill="rgba(255,255,255,0.03)"/>
  <circle cx="200" cy="2600" r="250" fill="rgba(255,179,0,0.05)"/>
  <!-- Center logo -->
  <circle cx="642" cy="1200" r="260" fill="rgba(255,255,255,0.08)" stroke="#FFB300" stroke-width="8" opacity="0.6"/>
  <circle cx="642" cy="1200" r="200" fill="rgba(255,255,255,0.05)"/>
  <!-- Book icon (simplified) -->
  <rect x="500" y="1090" width="130" height="160" rx="10" fill="#FFB300"/>
  <rect x="514" y="1102" width="102" height="136" rx="6" fill="#1a237e"/>
  <rect x="654" y="1090" width="130" height="160" rx="10" fill="#FFB300" opacity="0.85"/>
  <rect x="668" y="1102" width="102" height="136" rx="6" fill="#1565c0"/>
  <!-- Graduation cap -->
  <polygon points="642,1010 530,1070 642,1130 754,1070" fill="#FFB300"/>
  <!-- App name -->
  <text x="642" y="1540" font-size="90" font-weight="800" fill="#ffffff" text-anchor="middle" font-family="Arial" letter-spacing="2">EduConnect</text>
  <text x="642" y="1610" font-size="44" fill="#FFB300" text-anchor="middle" font-family="Arial" letter-spacing="8">PARENT PORTAL</text>
  <!-- Tagline -->
  <text x="642" y="1680" font-size="30" fill="rgba(255,255,255,0.5)" text-anchor="middle" font-family="Arial" letter-spacing="2">Stay Connected · Stay Informed</text>
</svg>`;

// Write SVG files (for reference)
const assetsDir = path.join(__dirname, 'assets');
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSvg);

console.log('SVG files written to assets/');
console.log('To convert to PNG, use: npx sharp-cli -i assets/icon.svg -o assets/icon.png resize 1024 1024');
console.log('Or use any SVG to PNG converter with the generated SVG files.');
