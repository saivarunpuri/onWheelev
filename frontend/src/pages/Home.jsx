import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Zap, ShieldAlert, Navigation2, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-cyber-bg">
      
      {/* Background aesthetic blobs */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-cyber-green/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-[400px] h-[400px] bg-cyber-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 w-full flex-grow flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left Hand: Premium Typography copy */}
        <div className="flex-1 flex flex-col text-left max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-xs font-semibold tracking-wider uppercase mb-6 w-fit">
            <Zap className="w-3.5 h-3.5 fill-cyber-green" />
            <span>Eliminating Range Anxiety</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Powering Every <br />
            Journey. <span className="text-cyber-green drop-shadow-[0_0_15px_rgba(0,229,118,0.3)]">Sustainably.</span>
          </h1>

          <p className="mt-6 text-gray-400 text-sm sm:text-base leading-relaxed">
            Plan your long-distance EV trips intelligently, predict battery metrics dynamically, 
            and connect instantly with on-site emergency charging networks when battery drops critically low. 
            All in one futuristic dashboard.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/planner" className="btn-cyber-primary text-sm flex items-center space-x-2 group">
              <Navigation2 className="w-4 h-4 text-black rotate-90" />
              <span>Plan Your Trip</span>
              <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link to="/stations" className="btn-cyber-secondary text-sm flex items-center space-x-2">
              <Compass className="w-4 h-4" />
              <span>Find Charging Stations</span>
            </Link>
          </div>
        </div>

        {/* Right Hand: Elegant EV Charging Hero Vector */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center relative">
          <div className="relative w-full max-w-[480px] h-[340px] bg-cyber-card/40 border border-cyber-gray-800 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-sm group hover:border-cyber-green/30 transition-all duration-500">
            
            {/* Holographic scanner active lines */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyber-green/5 to-transparent h-1/2 w-full animate-pulse pointer-events-none" />

            {/* Title HUD */}
            <div className="flex justify-between items-center text-xs text-gray-500 border-b border-cyber-gray-800 pb-3">
              <span className="font-mono">SYS_VEHICLE_SCAN: ONLINE</span>
              <span className="text-cyber-green font-bold animate-pulse">CHARGE_READY</span>
            </div>

            {/* Glowing charging EV vector drawing */}
            <div className="flex-grow flex items-center justify-center relative my-4">
              {/* Electric pulse ring */}
              <div className="absolute w-36 h-36 border border-cyber-green/10 rounded-full animate-ping" />
              <div className="absolute w-28 h-28 border border-cyber-accent/15 rounded-full animate-pulse" />
              
              <svg className="w-48 h-32 text-cyber-green drop-shadow-[0_0_12px_rgba(0,229,118,0.25)]" viewBox="0 0 100 60" fill="none">
                {/* EV Car silhouette */}
                <path d="M10 38 H22 L26 30 H74 L78 38 H90 V46 H84 C84 41, 74 41, 74 46 H26 C26 41, 16 41, 16 46 H10 Z" fill="#0B0C10" stroke="#00E576" strokeWidth="1.5" />
                {/* Wheels */}
                <circle cx="21" cy="46" r="6" fill="#121212" stroke="#00E576" strokeWidth="1.5" />
                <circle cx="21" cy="46" r="2.5" fill="#00E576" />
                <circle cx="79" cy="46" r="6" fill="#121212" stroke="#00E576" strokeWidth="1.5" />
                <circle cx="79" cy="46" r="2.5" fill="#00E576" />
                {/* Charging plug connection */}
                <path d="M90 42 H96 V28 H93" fill="none" stroke="#1DE9B6" strokeWidth="1.5" strokeDasharray="3" />
                <rect x="91" y="24" width="4" height="4" fill="#1DE9B6" rx="1" />
              </svg>
            </div>

            {/* EV Stats Overlay Panel */}
            <div className="grid grid-cols-3 gap-2 text-center border-t border-cyber-gray-800 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Range Est</span>
                <span className="text-sm font-extrabold text-white">465 km</span>
              </div>
              <div className="flex flex-col border-x border-cyber-gray-800">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Health</span>
                <span className="text-sm font-extrabold text-cyber-green">98%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Charge Speed</span>
                <span className="text-sm font-extrabold text-cyber-accent">150 kW</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Grid of Core Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 border-t border-cyber-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="cyber-card-glow flex flex-col text-left group">
            <div className="p-3 rounded-lg bg-cyber-green/10 text-cyber-green w-fit mb-4 group-hover:bg-cyber-green/20 transition-all duration-300">
              <Navigation2 className="w-5 h-5 text-cyber-green rotate-90" />
            </div>
            <h3 className="font-bold text-white text-base">Smart Trip Planner</h3>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              AI-driven highway routing calculates charging stops, battery status, and travel time efficiently.
            </p>
          </div>

          <div className="cyber-card-glow flex flex-col text-left group">
            <div className="p-3 rounded-lg bg-cyber-green/10 text-cyber-green w-fit mb-4 group-hover:bg-cyber-green/20 transition-all duration-300">
              <Zap className="w-5 h-5 text-cyber-green" />
            </div>
            <h3 className="font-bold text-white text-base">Charging Stations</h3>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              Discover real-time fast and slow chargers near your current coordinates and highways.
            </p>
          </div>

          <div className="cyber-card-glow flex flex-col text-left group">
            <div className="p-3 rounded-lg bg-cyber-green/10 text-cyber-green w-fit mb-4 group-hover:bg-cyber-green/20 transition-all duration-300">
              <ShieldAlert className="w-5 h-5 text-cyber-green" />
            </div>
            <h3 className="font-bold text-white text-base">Emergency Assistance</h3>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              Call portable charging rescues directly to your GPS coordinates if your battery drains out.
            </p>
          </div>

          <div className="cyber-card-glow flex flex-col text-left group">
            <div className="p-3 rounded-lg bg-cyber-green/10 text-cyber-green w-fit mb-4 group-hover:bg-cyber-green/20 transition-all duration-300">
              <CheckCircle2 className="w-5 h-5 text-cyber-green" />
            </div>
            <h3 className="font-bold text-white text-base">Dashboard Analytics</h3>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              Store your past trips, vehicle models, payments history, and monitor carbon offsets.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;
