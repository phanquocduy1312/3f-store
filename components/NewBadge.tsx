import React from 'react';
import { PawPrint } from 'lucide-react';

interface NewBadgeProps {
  className?: string;
}

export function NewBadge({ className = '' }: NewBadgeProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-between rounded-full bg-[#209405] p-1.5 pl-6 shadow-[0_6px_12px_rgba(32,148,5,0.3)] ${className}`}
      style={{
        background: 'linear-gradient(180deg, #4ed318 0%, #1a8103 100%)',
        boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.3), 0 6px 15px -3px rgba(26,129,3,0.5)',
      }}
    >
      {/* Dashed Inner Border */}
      <div 
        className="absolute inset-[4px] rounded-full border-[2px] border-dashed border-white/80 pointer-events-none"
      />

      {/* Text */}
      <span 
        className="text-white font-black text-3xl mr-4 whitespace-nowrap relative z-10"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          letterSpacing: '-1px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          lineHeight: '1',
          paddingBottom: '2px', // visual center
        }}
      >
        HÀNG MỚI
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
        <PawPrint 
          fill="#1f9104" 
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
