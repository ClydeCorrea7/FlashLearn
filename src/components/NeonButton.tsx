import React from 'react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  animate?: boolean;
  glowing?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  animate = true,
  glowing = true,
  type = 'button'
}, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'cyber-gradient text-white border-0 neon-glow-blue';
      case 'secondary':
        return 'bg-[var(--cyber-surface)] text-foreground neon-border-blue';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      default:
        return 'cyber-gradient text-white border-0 neon-glow-blue';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-[6px]';
      case 'md':
        return 'px-4 py-3 text-[8px]';
      case 'lg':
        return 'px-6 py-4 text-[10px]';
      default:
        return 'px-4 py-3 text-[8px]';
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-md
    font-['Press_Start_2P'] 
    tracking-wider 
    uppercase 
    transition-all 
    duration-200 
    ease-in-out
    relative
    overflow-hidden
    border-3
    focus-visible:outline-none 
    focus-visible:ring-2 
    focus-visible:ring-ring 
    focus-visible:ring-offset-2
    disabled:pointer-events-none 
    disabled:opacity-50
  `;

  const buttonClasses = cn(
    baseClasses,
    getVariantClasses(),
    getSizeClasses(),
    glowing ? 'animate-pixel-glow' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  );

  if (animate) {
    return (
      <motion.button
        ref={ref}
        type={type}
        className={buttonClasses}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { 
          scale: 1.05,
          y: -2
        }}
        whileTap={disabled ? {} : { 
          scale: 0.95,
          y: 0
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      >
        <motion.div
          className="relative z-10 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {children}
        </motion.div>
        
        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear'
          }}
        />
        
        {/* Pixel shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500 ease-out" />
      </motion.button>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Static shine effect for non-animated version */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500 ease-out" />
    </button>
  );
});

NeonButton.displayName = 'NeonButton';

export { NeonButton };