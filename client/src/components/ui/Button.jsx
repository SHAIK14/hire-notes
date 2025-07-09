import { forwardRef } from 'react';

const Button = forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-800',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-100',
    ghost: 'hover:bg-slate-100 hover:text-slate-900',
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };