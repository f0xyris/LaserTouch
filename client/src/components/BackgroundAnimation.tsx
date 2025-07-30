import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const BackgroundAnimation = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 10 + 10,
          delay: Math.random() * 5,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-mystical-400/30 dark:bg-mystical-300/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Компонент для анимации градиентного фона
export const GradientBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-mystical-50/20 via-transparent to-accent-50/20 dark:from-mystical-900/10 dark:to-accent-900/10"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            'linear-gradient(45deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            'linear-gradient(45deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

// Компонент для анимации волн
export const WaveAnimation = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0">
      <motion.div
        className="w-full h-32 bg-gradient-to-t from-mystical-100/20 to-transparent dark:from-mystical-800/20"
        animate={{
          clipPath: [
            'polygon(0 100%, 100% 100%, 100% 80%, 0 60%)',
            'polygon(0 100%, 100% 100%, 100% 60%, 0 80%)',
            'polygon(0 100%, 100% 100%, 100% 80%, 0 60%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}; 