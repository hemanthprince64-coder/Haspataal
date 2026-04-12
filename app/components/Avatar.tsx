"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ imageUrl, name, size = 'md', className = '' }) => {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-24 h-24 text-2xl',
  };
  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 96,
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // 1. IMAGE PRIORITY
  if (imageUrl && !error) {
    return (
      <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 ${className}`}>
        <Image
          src={imageUrl}
          alt={name || "Profile"}
          width={sizePixels[size]}
          height={sizePixels[size]}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // 2. INITIAL PRIORITY
  if (name) {
    return (
      <div className={`${sizeClasses[size]} rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-700 font-black flex-shrink-0 ${className}`}>
        {initial}
      </div>
    );
  }

  // 3. DEFAULT PLACEHOLDER
  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0 ${className}`}>
      👤
    </div>
  );
};

export default Avatar;
