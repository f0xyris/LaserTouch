import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = (direction: string) => ({
  hidden: {
    opacity: 0,
    y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
    x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
});

export const StaggeredContainer = ({
  children,
  className = '',
  staggerDelay = 0.1,
  direction = 'up',
}: StaggeredContainerProps) => {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ staggerChildren: staggerDelay }}
    >
      {children}
    </motion.div>
  );
};

export const StaggeredItem = ({
  children,
  className = '',
  direction = 'up',
}: {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}) => {
  return (
    <motion.div
      className={className}
      variants={itemVariants(direction)}
    >
      {children}
    </motion.div>
  );
};

// Компонент для анимации текста по буквам
export const AnimatedLetters = ({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  const letters = text.split('');

  return (
    <div className={className}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </div>
  );
};

// Компонент для анимации прогресс-бара
export const AnimatedProgress = ({
  value,
  max = 100,
  className = '',
  delay = 0,
}: {
  value: number;
  max?: number;
  className?: string;
  delay?: number;
}) => {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
      <motion.div
        className="bg-gradient-to-r from-mystical-500 to-accent-500 h-2 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: `${(value / max) * 100}%` }}
        viewport={{ once: true }}
        transition={{
          duration: 1.5,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      />
    </div>
  );
}; 