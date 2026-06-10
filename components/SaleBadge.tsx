import React from 'react';
import { PawPrint } from 'lucide-react';

interface SaleBadgeProps {
  discount?: number | string;
  className?: string;
}

export function SaleBadge({ discount = 30, className = '' }: SaleBadgeProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-between rounded-full bg-[#cc0000] p-1.5 pl-5 shadow-[0_6px_12px_rgba(204,0,0,0.3)] ${className}`}
      style={{
        background: 'linear-gradient(180deg, #ed0a17 0%, #b8000a 100%)',
        boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.3), inset 0 -4px 8px rgba(0,0,0,0.3), 0 6px 15px -3px rgba(184,0,10,0.5)',
      }}
    >
      {/* Dashed Inner Border */}
      <div 
        className="absolute inset-[4px] rounded-full border-[2px] border-dashed border-white/80 pointer-events-none"
      />

      {/* Text */}
      <span 
        className="text-white font-black text-4xl mr-4 whitespace-nowrap relative z-10"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          letterSpacing: '-1.5px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          lineHeight: '1',
          paddingBottom: '2px', // visual center
        }}
      >
        -{discount}%
      </span>

      {/* Circle with Paw */}
      <div 
        className="relative z-10 flex items-center justify-center rounded-full bg-white"
        style={{
          width: '56px',
          height: '56px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)',
          flexShrink: 0
        }}
      >
        {/* We use an SVG to do the gradient fill, but if we use lucide-react we can just give it a solid color */}
        {/* The design has a slightly darker red, inner shadow might be hard on a standard icon, so we use drop-shadow or a solid deep red */}
        <PawPrint 
          fill="#c9000a" 
          strokeWidth={0} 
          className="w-8 h-8"
          style={{
            filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.5)) drop-shadow(0 -1px 2px rgba(0,0,0,0.3))' // Bevel effect
          }}
        />
      </div>
    </div>
  );
}
