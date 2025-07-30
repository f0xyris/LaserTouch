import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export const AnimatedButton = ({
  children,
  className = '',
  delay = 0,
  onClick,
  href,
  variant = 'default',
}: AnimatedButtonProps) => {
  const buttonVariants = {
    initial: { 
      scale: 1,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    hover: { 
      scale: 1.05,
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.2)',
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

  const content = (
    <motion.div
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className="relative overflow-hidden"
    >
      <Button
        variant={variant}
        className={`relative ${className}`}
        onClick={onClick}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-mystical-500/20 to-accent-500/20"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
    >
      {content}
    </motion.div>
  );
};

// Компонент для анимированной иконки
export const AnimatedIcon = ({
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
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 200 }}
      whileHover={{
        scale: 1.1,
        rotate: 5,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
};

// Компонент для анимированного бейджа
export const AnimatedBadge = ({
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
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-mystical-100 text-mystical-800 dark:bg-mystical-800 dark:text-mystical-100 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}; 