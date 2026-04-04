import React from 'react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  hover?: boolean;
  glowing?: boolean;
  variant?: 'default' | 'neon' | 'cyber';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
  delay = 0,
  hover = true,
  glowing = false,
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'neon':
        return 'cyber-surface neon-border-blue';
      case 'cyber':
        return 'cyber-gradient text-white border-0';
      default:
        return 'bg-card text-card-foreground border border-border';
    }
  };

  const baseClasses = `
    rounded-lg 
    shadow-sm
    transition-all 
    duration-300 
    ease-in-out
    border-2
  `;

  const cardClasses = cn(
    baseClasses,
    getVariantClasses(),
    glowing ? 'neon-glow-blue' : '',
    onClick ? 'cursor-pointer' : '',
    className
  );

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? {
        scale: 1.02,
        y: -4
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      <motion.div
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export { AnimatedCard };