import React from 'react';
import { motion } from 'framer-motion';

const ApiKeyAnimation: React.FC = () => {
    const particles = Array.from({ length: 15 });

    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            {/* Pulsing background glows */}
            <motion.div
                className="absolute bg-pink-200/50 rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.3, 0.6],
                }}
                transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                style={{ width: '100%', height: '100%' }}
            />
            <motion.div
                className="absolute bg-pink-300/40 rounded-full"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: 2,
                }}
                style={{ width: '80%', height: '80%' }}
            />

            {/* Keyhole Icon */}
            <div className="relative w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-pink-100">
                 <svg className="w-12 h-12 text-[#A61E4D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 16v4" />
                    <path d="M10 20h4" />
                    <path d="M12 2v2" />
                    <path d="M12 8a7.5 7.5 0 00-7.5 7.5h15A7.5 7.5 0 0012 8z" />
                </svg>
            </div>
            
            {/* Orbiting Particles */}
            {particles.map((_, i) => {
                const angle = (i / particles.length) * 2 * Math.PI;
                const radius = 120 + Math.random() * 40;
                const duration = 8 + Math.random() * 8;
                const size = 4 + Math.random() * 4;

                return (
                    <motion.div
                        key={i}
                        className="absolute bg-gradient-to-br from-pink-400 to-pink-600 rounded-full"
                        style={{
                            width: size,
                            height: size,
                            top: '50%',
                            left: '50%',
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                        animate={{
                            x: [0, Math.cos(angle) * radius, 0, Math.cos(angle + Math.PI) * radius, 0],
                            y: [0, Math.sin(angle) * radius, 0, Math.sin(angle + Math.PI) * radius, 0],
                            scale: [1, 1.5, 1, 0.5, 1],
                            opacity: [1, 0.8, 1, 0.8, 1],
                        }}
                        transition={{
                            duration,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default ApiKeyAnimation;
