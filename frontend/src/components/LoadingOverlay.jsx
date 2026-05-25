import React from 'react';
import loadingGif from '../assets/V3_1 (1).gif';

const LoadingOverlay = ({ isLoading, title = "SYSTEM CHARGING...", subtitle = "Routing Electrical Modules" }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0c10]/90 backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-cyber-green shadow-[0_0_40px_rgba(0,255,170,0.4)] flex items-center justify-center bg-black">
          <img 
            src={loadingGif} 
            alt="EV Charging Animation" 
            className="w-[120%] h-[120%] object-cover scale-110" 
          />
        </div>
        <div className="mt-8 text-cyber-green font-extrabold text-xl sm:text-2xl tracking-[0.2em] animate-pulse">
          {title}
        </div>
        <div className="mt-3 text-gray-400 text-xs sm:text-sm tracking-widest uppercase">
          {subtitle}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
