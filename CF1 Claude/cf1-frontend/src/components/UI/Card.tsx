import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  border?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'medium',
  shadow = 'small',
  border = true,
  hoverable = false,
  onClick
}) => {
  const paddingStyles = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const shadowStyles = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg'
  };

  const baseStyles = `
    bg-white dark:bg-gray-800 rounded-lg
    ${border ? 'border border-gray-200 dark:border-gray-700' : ''}
    ${shadowStyles[shadow]}
    ${paddingStyles[padding]}
    ${hoverable ? 'hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div 
      className={baseStyles}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;