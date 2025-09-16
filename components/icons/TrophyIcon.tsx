// Fix: Created the TrophyIcon component.
import React from 'react';

const TrophyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1 9 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 15.75c0-4.418-3.582-8.25-8.25-8.25S3 11.332 3 15.75m16.5 0v.001M12 12v-6" />
    </svg>
);

export default TrophyIcon;
