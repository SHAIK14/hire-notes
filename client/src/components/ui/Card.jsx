import { forwardRef } from 'react';

const Card = forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-white text-slate-950 shadow-sm ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };