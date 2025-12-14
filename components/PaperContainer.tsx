import React, { PropsWithChildren } from 'react';

interface PaperContainerProps extends PropsWithChildren {
  className?: string;
}

export const PaperContainer: React.FC<PaperContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`
      relative bg-paper text-ink w-full max-w-3xl mx-auto 
      min-h-[600px] md:min-h-[700px] p-8 md:p-16 
      shadow-paper rounded-sm border border-stone-200/50
      flex flex-col
      ${className}
    `}>
      {/* Decorative top edge (simulating stack of paper) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 border-b border-stone-200/30"></div>
      
      {/* Inner texture overlay (subtle noise) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-black mix-blend-overlay"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
