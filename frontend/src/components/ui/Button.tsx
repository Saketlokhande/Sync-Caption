import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = 'default', isLoading, variant = 'default', children, disabled, ...props }, ref) => {
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    const variants = {
      default: {
        background: 'linear-gradient(black, black) padding-box, linear-gradient(to right, #3b82f6, #a855f7, #ec4899) border-box',
        border: '1px solid transparent',
        boxShadow: '0 0 20px -5px rgba(59, 130, 246, 0.3)',
      },
      outline: {
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'none',
      },
      ghost: {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      },
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg text-sm font-medium text-white ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          sizes[size],
          className
        )}
        style={variants[variant]}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
