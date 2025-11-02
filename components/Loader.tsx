import React, { useState, useEffect } from 'react';

const messages = [
  "Sketching the blueprints...",
  "Connecting the microservices...",
  "Aligning system components...",
  "Rendering the architecture...",
  "Consulting the design patterns...",
  "Finalizing the connections...",
];

const Loader: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center gap-4">
        <svg width="80" height="80" viewBox="0 0 100 100" strokeLinecap="round" strokeLinejoin="round">
            <style>{`
                .loader-path {
                    stroke-dasharray: 500;
                    stroke-dashoffset: 500;
                    animation: draw 3s ease-in-out infinite;
                }
                .loader-node {
                    animation: pop-in 3s ease-in-out infinite .3s; /* Delay pop-in until after lines start drawing */
                    transform-origin: center;
                    transform: scale(0);
                }
                @keyframes draw {
                    0% { stroke-dashoffset: 500; }
                    40% { stroke-dashoffset: 0; }
                    60% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -500; }
                }
                @keyframes pop-in {
                    0% { transform: scale(0); }
                    30% { transform: scale(1.1); }
                    50%, 100% { transform: scale(1); }
                }
            `}</style>
            <g stroke="var(--color-accent-text)" strokeWidth="2.5" fill="none">
                {/* Main Bus Line */}
                <path className="loader-path" style={{ animationDelay: '0s' }} d="M 20 50 H 80" />
                
                {/* Branching Lines */}
                <path className="loader-path" style={{ animationDelay: '0.2s' }} d="M 50 50 V 25" />
                <path className="loader-path" style={{ animationDelay: '0.4s' }} d="M 50 50 V 75" />
                
                {/* Nodes */}
                <rect className="loader-node" x="12" y="42" width="16" height="16" rx="4" fill="var(--color-accent-soft)" strokeWidth="2" />
                <rect className="loader-node" style={{ animationDelay: '0.5s' }} x="72" y="42" width="16" height="16" rx="4" fill="var(--color-accent-soft)" strokeWidth="2" />
                <circle className="loader-node" style={{ animationDelay: '0.7s' }} cx="50" cy="17" r="8" fill="var(--color-accent-soft)" strokeWidth="2" />
                <circle className="loader-node" style={{ animationDelay: '0.9s' }} cx="50" cy="83" r="8" fill="var(--color-accent-soft)" strokeWidth="2" />
            </g>
        </svg>
        <p className="text-[var(--color-text-secondary)] font-medium text-sm">{message}</p>
    </div>
  );
};

export default Loader;