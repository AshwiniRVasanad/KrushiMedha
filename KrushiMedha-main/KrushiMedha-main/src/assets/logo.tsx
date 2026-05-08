import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Background Circle */}
      <circle cx="250" cy="250" r="235" fill="white" stroke="#042d1b" strokeWidth="10" />
      
      {/* Soil and Fields at bottom */}
      <path 
        d="M50 350 C 100 300, 200 300, 250 350 L 250 480 C 150 480, 50 450, 50 350 Z" 
        fill="#5d4037" 
      />
      <path 
        d="M250 350 C 300 300, 400 300, 450 350 L 450 450 C 350 480, 250 480, 250 350 Z" 
        fill="#2e7d32" 
      />
      {/* Field Lines */}
      <path d="M280 340 L 300 480" stroke="#1b5e20" strokeWidth="2" />
      <path d="M330 325 L 360 480" stroke="#1b5e20" strokeWidth="2" />
      <path d="M380 330 L 420 450" stroke="#1b5e20" strokeWidth="2" />

      {/* Sprout */}
      <path d="M120 400 Q 130 350, 150 350" stroke="#8bc34a" strokeWidth="5" fill="none" />
      <path d="M150 350 Q 170 330, 190 350 Q 170 370, 150 350" fill="#8bc34a" />
      <path d="M150 350 Q 130 330, 110 350 Q 130 370, 150 350" fill="#8bc34a" />

      {/* Large K */}
      <path 
        d="M180 100 V 400" 
        stroke="#2e7d32" 
        strokeWidth="40" 
        strokeLinecap="round" 
      />
      <path 
        d="M180 250 L 320 120" 
        stroke="#2e7d32" 
        strokeWidth="40" 
        strokeLinecap="round" 
      />
      <path 
        d="M230 205 L 320 380" 
        stroke="#2e7d32" 
        strokeWidth="40" 
        strokeLinecap="round" 
      />

      {/* Farmer Silhouette */}
      <path 
        d="M340 300 C 340 250, 380 230, 410 230 S 480 250, 480 300 V 400 H 340 Z" 
        fill="#042d1b" 
      />
      <circle cx="410" cy="180" r="40" fill="#042d1b" />
      {/* Smartphone */}
      <rect x="440" y="270" width="20" height="35" rx="3" transform="rotate(15, 450, 287)" fill="white" />

      {/* Sun Rays */}
      <g stroke="#fbc02d" strokeWidth="8" strokeLinecap="round">
        <line x1="300" y1="50" x2="310" y2="90" />
        <line x1="360" y1="70" x2="355" y2="110" />
        <line x1="410" y1="100" x2="395" y2="135" />
      </g>

      {/* Tech/Circuit Lines */}
      <g stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" fill="none">
        <circle cx="60" cy="100" r="8" strokeWidth="3" />
        <path d="M68 100 H 120 V 150" />
        <circle cx="40" cy="160" r="8" strokeWidth="3" />
        <path d="M48 160 H 90 V 210" />
      </g>

      {/* WiFi Icon */}
      <g transform="translate(380, 430) scale(0.5)" stroke="#042d1b" strokeWidth="15" fill="none" strokeLinecap="round">
        <path d="M0 0 C 20 -20, 60 -20, 80 0" />
        <path d="M15 15 C 25 5, 55 5, 65 15" />
        <circle cx="40" cy="40" r="10" fill="#042d1b" stroke="none" />
      </g>
    </svg>
  );
};
