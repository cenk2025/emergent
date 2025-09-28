'use client';

import { Utensils, Zap } from 'lucide-react';

export default function FinnishLogo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { container: 'h-8 w-8', text: 'text-lg', subtext: 'text-xs' },
    md: { container: 'h-12 w-12', text: 'text-2xl', subtext: 'text-sm' },
    lg: { container: 'h-16 w-16', text: 'text-3xl', subtext: 'text-base' },
    xl: { container: 'h-20 w-20', text: 'text-4xl', subtext: 'text-lg' }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* F Logo Icon */}
      <div className={`${currentSize.container} relative group cursor-pointer`}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFB000] via-[#FF6B35] to-[#00D4AA] rounded-xl animate-pulse"></div>
        
        {/* White background for F letter */}
        <div className="relative z-10 bg-white rounded-lg w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
          {/* F Letter Design */}
          <div className="relative">
            <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-[#FFB000] to-[#FF6B35] bg-clip-text text-transparent">
              F
            </div>
            {/* Small food icon overlay */}
            <Utensils className="absolute -top-1 -right-1 h-3 w-3 text-[#00D4AA]" />
          </div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00D4AA] rounded-full animate-bounce delay-100"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-0 left-0 w-1 h-1 bg-[#FFB000] rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${currentSize.text} font-extrabold fast-food-heading leading-none`}>
            FoodAi
          </h1>
          <p className={`${currentSize.subtext} font-medium text-[#636E72] -mt-1`}>
            Älykkäät ruokatarjoukset
          </p>
        </div>
      )}
    </div>
  );
}