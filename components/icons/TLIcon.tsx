import React from 'react';

const TLIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "h-6 w-6"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 6h8" />
    <path d="M8 10h8" />
    <path d="M12 6v12" />
    <path d="M10 18h4" />
  </svg>
);

export default TLIcon;
