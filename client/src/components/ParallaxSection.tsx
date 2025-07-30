import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode, useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  offset?: number;
}

export const ParallaxSection = ({
  children,
  className = '',
  speed = 0.5,
  offset = 0,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, offset - 100 * speed]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
};

// Компонент для анимации фоновых элементов
export const FloatingElement = ({
  children,
  className = '',
  speed = 1,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  delay?: number;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4 + speed,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

// Компонент для анимации счетчиков
export const AnimatedCounter = ({
  value,
  className = '',
  duration = 2,
  delay = 0,
}: {
  value: number;
  className?: string;
  duration?: number;
  delay?: number;
}) => {
  const { ref, isVisible } = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        const increment = value / (duration * 60); // 60 FPS
        let current = 0;
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= value) {
            setCount(value);
            clearInterval(counter);
          } else {
            setCount(Math.floor(current));
          }
        }, 1000 / 60);

        return () => clearInterval(counter);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, value, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {count}
    </span>
  );
};

// Компонент для более спокойной анимации иконок
export const GentleIcon = ({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}; 