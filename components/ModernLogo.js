'use client';

import { Brain, Utensils } from 'lucide-react';

export default function ModernLogo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { container: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-lg' },
    md: { container: 'h-12 w-12', icon: 'h-6 w-6', text: 'text-2xl' },
    lg: { container: 'h-16 w-16', icon: 'h-8 w-8', text: 'text-3xl' },
    xl: { container: 'h-20 w-20', icon: 'h-10 w-10', text: 'text-4xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon */}
      <div className={`${currentSize.container} fast-food-icon relative group cursor-pointer`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFB000] via-[#FF6B35] to-[#00D4AA] rounded-xl animate-pulse"></div>
        <div className="relative z-10 bg-white rounded-lg w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <div className="relative">
            <Utensils className={`${currentSize.icon} text-[#FFB000] absolute`} />
            <Brain className={`${currentSize.icon} text-[#FF6B35] ml-1 mt-1`} />
          </div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00D4AA] rounded-full animate-bounce delay-100"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce delay-300"></div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${currentSize.text} font-extrabold fast-food-heading leading-none`}>
            FoodAi
          </h1>
          <p className="text-sm font-medium text-[#636E72] -mt-1">
            Akıllı yemek!
          </p>
        </div>
      )}
    </div>
  );
}