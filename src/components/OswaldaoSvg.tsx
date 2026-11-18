import React from 'react';

interface OswaldaoSvgGroupProps {
  transform?: string;
}

/**
 * Reusable vector art for Oswaldão:
 * Strong dad capybara with broad shoulders, blue dad bandana, and cool sunglasses.
 */
export const OswaldaoSvgGroup: React.FC<OswaldaoSvgGroupProps> = ({
  transform = 'translate(0, 0)',
}) => (
  <g transform={transform}>
    {/* Strong broad torso */}
    <ellipse
      cx="0"
      cy="2"
      rx="64"
      ry="48"
      fill="#8D5524"
      stroke="#3B1D0A"
      strokeWidth="5"
    />
    {/* Lighter warm chest */}
    <ellipse cx="14" cy="12" rx="34" ry="30" fill="#C68642" />
    {/* Muscular front arm waving/flexing */}
    <path
      d="M-38 -2 Q-64 -26 -48 -46"
      fill="none"
      stroke="#8D5524"
      strokeWidth="18"
      strokeLinecap="round"
    />
    <path
      d="M-38 -2 Q-64 -26 -48 -46"
      fill="none"
      stroke="#3B1D0A"
      strokeWidth="5"
      strokeLinecap="round"
    />
    {/* Blue dad bandana */}
    <path
      d="M-2 -24 Q26 -10 54 -22 L42 -4 Q22 4 4 -6 Z"
      fill="#0284C7"
      stroke="#0C4A6E"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Big head */}
    <circle
      cx="42"
      cy="-36"
      r="36"
      fill="#8D5524"
      stroke="#3B1D0A"
      strokeWidth="5"
    />
    {/* Rounded snout */}
    <ellipse cx="64" cy="-28" rx="18" ry="14" fill="#C68642" />
    {/* Nose */}
    <ellipse cx="75" cy="-32" rx="6" ry="4" fill="#2A170B" />
    {/* Confident smile */}
    <path
      d="M52 -20 Q62 -13 70 -20"
      fill="none"
      stroke="#2A170B"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* Ears + head fur tuft */}
    <circle
      cx="18"
      cy="-64"
      r="10"
      fill="#6B3E17"
      stroke="#3B1D0A"
      strokeWidth="4"
    />
    <path
      d="M34 -72 Q42 -84 50 -70"
      fill="#8D5524"
      stroke="#3B1D0A"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Cool Dark Sunglasses */}
    <g transform="translate(46, -44)">
      <line
        x1="-28"
        y1="3"
        x2="-12"
        y2="0"
        stroke="#0F172A"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="-14"
        y="-7"
        width="22"
        height="15"
        rx="4"
        fill="#0F172A"
        stroke="#FACC15"
        strokeWidth="2.5"
      />
      <rect
        x="11"
        y="-7"
        width="20"
        height="15"
        rx="4"
        fill="#0F172A"
        stroke="#FACC15"
        strokeWidth="2.5"
      />
      <line
        x1="7"
        y1="-1"
        x2="12"
        y2="-1"
        stroke="#FACC15"
        strokeWidth="3"
      />
      {/* Glossy diagonal lens shine */}
      <line
        x1="-9"
        y1="4"
        x2="-1"
        y2="-4"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="4"
        x2="23"
        y2="-4"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  </g>
);
