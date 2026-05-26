import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Zap, 
  ShieldAlert, 
  Navigation2, 
  CheckCircle2, 
  ChevronRight, 
  Sliders, 
  BatteryCharging, 
  Activity, 
  MapPin 
} from 'lucide-react';

const Home = () => {
  const [battery, setBattery] = useState(65);

  // Dynamic calculations based on battery simulator slider
  const rangeEst = Math.round(battery * 4.65);
  const healthEst = 98;
  const ecoScore = Math.round(battery * 0.95 + 5);
  const chargeSpeed = 150;
  
  // Calculate simulated route status
  const getStatusText = () => {
    if (battery < 20) return 'BATTERY_CRITICAL_RESCUE_REQUIRED';
    if (battery < 50) return 'WARN_RANGE_ANXIETY_DETECTED';
    return 'SYSTEM_STATUS_OPTIMAL';
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-cyber-bg transition-colors duration-300">
      
      {/* ── HIGH-TECH INTERACTIVE MESH BACKGROUND ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-green/5 via-transparent to-transparent opacity-75 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,245,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,245,212,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Glow blobs */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-cyber-green/5 dark:bg-cyber-green/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 left-[-10%] w-[400px] h-[400px] bg-cyber-accent/10 dark:bg-cyber-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── MAIN HERO HEADER CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full flex-grow flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left Hand Column: Premium Typography Copy */}
        <div className="flex-1 flex flex-col text-left max-w-2xl">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-cyber-green/10 dark:bg-cyber-green/10 border border-cyber-green/20 dark:border-cyber-green/30 text-cyber-accent dark:text-cyber-green text-xs font-semibold tracking-widest uppercase mb-6 w-fit animate-fade-in shadow-[0_0_15px_rgba(0,245,212,0.05)]">
            <Zap className="w-3.5 h-3.5 fill-cyber-green text-cyber-green animate-pulse" />
            <span className="font-mono">Range Anxiety Eliminated</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            Powering Every <br />
            Journey. <span className="bg-gradient-to-r from-cyber-accent via-[#00D2B4] to-cyber-green bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,245,212,0.15)] font-black">Sustainably.</span>
          </h1>

          <p className="mt-6 text-slate-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">
            Plan your long-distance EV trips intelligently, predict battery telemetry metrics dynamically, 
            and connect instantly with on-site portable charging networks when battery drops critically low. 
            All in one high-performance dashboard.
          </p>

          {/* Core Action CTA Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/planner" className="btn-cyber-primary text-sm flex items-center space-x-2.5 group py-3.5 px-6 rounded-xl shadow-lg hover:shadow-cyber-green/20 transition-all duration-300">
              <Navigation2 className="w-4 h-4 text-black rotate-90" />
              <span>Plan Your Trip</span>
              <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/stations" className="btn-cyber-secondary text-sm flex items-center space-x-2.5 py-3.5 px-6 rounded-xl border border-slate-200 dark:border-cyber-gray-800 bg-white/5 hover:bg-slate-100 dark:hover:bg-cyber-gray-900/30 transition-all duration-300">
              <Compass className="w-4 h-4 text-slate-600 dark:text-cyber-green" />
              <span className="text-slate-700 dark:text-gray-300 font-semibold">Find Charging Stations</span>
            </Link>
          </div>
        </div>

        {/* Right Hand Column: Premium Interactive Battery Telemetry HUD Widget */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center relative">
          
          <div className="relative w-full max-w-[480px] bg-white/80 dark:bg-cyber-card/90 border border-slate-200 dark:border-cyber-gray-800 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-md hover:border-cyber-accent/30 dark:hover:border-cyber-green/30 transition-all duration-500 group">
            
            {/* Holographic scanning effect line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyber-accent dark:via-cyber-green to-transparent animate-pulse pointer-events-none" />

            {/* Title HUD Status Bar */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-cyber-muted border-b border-slate-100 dark:border-cyber-gray-800/80 pb-3.5 font-mono">
              <span className="tracking-wider flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-cyber-accent dark:bg-cyber-green rounded-full animate-ping" />
                SYS_VEHICLE_SCAN: ONLINE
              </span>
              <span className={`font-bold ${battery < 20 ? 'text-red-500 animate-pulse' : 'text-cyber-accent dark:text-cyber-green'}`}>
                {getStatusText()}
              </span>
            </div>

            {/* EV Vector & Active Telemetry Radar */}
            <div className="flex-grow flex flex-col items-center justify-center relative my-6">
              
              {/* Telemetry Background Rings */}
              <div className="absolute w-40 h-40 border border-slate-200/50 dark:border-cyber-green/5 rounded-full animate-ping" />
              <div className="absolute w-28 h-28 border border-cyber-accent/10 dark:border-cyber-accent/10 rounded-full animate-pulse" />
              
              {/* Dynamic Battery Telemetry Circle */}
              <div className="relative w-44 h-44 flex items-center justify-center rounded-full border-2 border-slate-100 dark:border-cyber-gray-900 bg-slate-50/50 dark:bg-[#001c1c]/25 backdrop-blur-sm p-4 mb-4">
                <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
                  {/* Gauge Track */}
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-slate-100 dark:stroke-cyber-gray-950" strokeWidth="6" />
                  {/* Progress Glow */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    fill="none" 
                    className="stroke-cyber-accent dark:stroke-cyber-green transition-all duration-300" 
                    strokeWidth="6" 
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - battery / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="flex flex-col items-center z-10">
                  <BatteryCharging className={`w-8 h-8 ${battery < 20 ? 'text-red-500 animate-bounce' : 'text-cyber-accent dark:text-cyber-green'}`} />
                  <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-mono tracking-tighter">
                    {battery}%
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 dark:text-gray-500 uppercase">
                    CAPACITY
                  </span>
                </div>
              </div>

              {/* Dynamic Interactive Slider Controller */}
              <div className="w-full px-4 flex flex-col space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-gray-400 font-bold">
                  <span className="flex items-center gap-1"><Sliders className="w-3 h-3" /> DRAG TO SIMULATE DRIVING</span>
                  <span>{battery}% SOC</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={battery} 
                  onChange={(e) => setBattery(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-200 dark:bg-cyber-gray-900 rounded-lg appearance-none cursor-pointer accent-cyber-accent dark:accent-cyber-green transition-all duration-200 outline-none" 
                />
              </div>
            </div>

            {/* EV Stats Overlay Panel */}
            <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 dark:border-cyber-gray-800/80 pt-4.5 font-mono">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 dark:text-cyber-muted uppercase tracking-wider font-bold">Est. Range</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white font-cyber mt-0.5">{rangeEst} km</span>
              </div>
              <div className="flex flex-col border-x border-slate-100 dark:border-cyber-gray-800/80">
                <span className="text-[9px] text-slate-400 dark:text-cyber-muted uppercase tracking-wider font-bold">Health</span>
                <span className="text-sm font-extrabold text-cyber-accent dark:text-cyber-green font-cyber mt-0.5">{healthEst}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 dark:text-cyber-muted uppercase tracking-wider font-bold">Eco Score</span>
                <span className={`text-sm font-extrabold font-cyber mt-0.5 ${ecoScore > 60 ? 'text-cyber-accent dark:text-cyber-green' : 'text-yellow-500'}`}>
                  {ecoScore}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── UNDERSTAND ONWHEEL EV SECTION (Simple English explanation) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative z-10 border-t border-slate-200/50 dark:border-cyber-gray-900/40">
        <div className="bg-white/60 dark:bg-cyber-card/65 border border-slate-200 dark:border-cyber-gray-800/85 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl backdrop-blur-sm">
          {/* Glowing element inside card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyber-green/5 dark:bg-cyber-green/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-3xl text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-accent/10 dark:bg-cyber-accent/15 border border-cyber-accent/20 text-cyber-accent text-[10px] font-bold font-mono tracking-widest uppercase mb-4">
              <Activity className="w-3.5 h-3.5" />
              <span>THE SYSTEM AT A GLANCE</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              What is <span className="text-cyber-accent dark:text-cyber-green">OnWheel EV</span>?
            </h2>
            <p className="mt-4 text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              Think of OnWheel EV as your <strong>smart co-pilot</strong> for electric vehicle (EV) trips. 
              Driving an electric car is clean and fun, but many drivers worry about running out of battery before reaching their destination (we call this <em>"Range Anxiety"</em>). 
              We solve this problem so you can travel peacefully.
            </p>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50/50 dark:bg-[#121212]/30 p-5 rounded-2xl border border-slate-100 dark:border-cyber-gray-950 hover:border-cyber-accent/20 dark:hover:border-cyber-green/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-cyber-accent dark:text-cyber-green font-mono text-[10px] uppercase tracking-wider mb-2.5 font-extrabold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Step 1
                </div>
                <h4 className="text-slate-800 dark:text-white font-bold text-base mb-2">Smart Map Route</h4>
                <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                  Enter your destination. We estimate exactly how much battery your car will have left and show you the best, fastest places to stop and charge.
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-[#121212]/30 p-5 rounded-2xl border border-slate-100 dark:border-cyber-gray-950 hover:border-cyber-accent/20 dark:hover:border-cyber-green/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-cyber-accent dark:text-cyber-green font-mono text-[10px] uppercase tracking-wider mb-2.5 font-extrabold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Step 2
                </div>
                <h4 className="text-slate-800 dark:text-white font-bold text-base mb-2">Emergency Rescue</h4>
                <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                  Stranded with a dead battery? Don't panic. Press a button, and our mobile rescue vans will drive right to your GPS coordinates with a portable charger.
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-[#121212]/30 p-5 rounded-2xl border border-slate-100 dark:border-cyber-gray-950 hover:border-cyber-accent/20 dark:hover:border-cyber-green/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-cyber-accent dark:text-cyber-green font-mono text-[10px] uppercase tracking-wider mb-2.5 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Step 3
                </div>
                <h4 className="text-slate-800 dark:text-white font-bold text-base mb-2">Track & Protect</h4>
                <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                  Keep tabs on your battery's health, review your charging bills, and see how much carbon dioxide emissions you saved by driving clean!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID OF CORE FEATURE CARDS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 border-t border-slate-200/50 dark:border-cyber-gray-900/40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white/40 dark:bg-cyber-card/40 border border-slate-200 dark:border-cyber-gray-800 rounded-2xl p-6 hover:border-cyber-accent/20 dark:hover:border-cyber-green/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex flex-col text-left group">
            <div className="p-3 rounded-xl bg-cyber-accent/10 text-cyber-accent dark:bg-cyber-green/10 dark:text-cyber-green w-fit mb-4 group-hover:scale-110 transition-all duration-300">
              <Navigation2 className="w-5 h-5 rotate-90" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Smart Trip Planner</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
              AI-driven highway routing calculates charging stops, battery status, and travel time efficiently.
            </p>
          </div>

          <div className="bg-white/40 dark:bg-cyber-card/40 border border-slate-200 dark:border-cyber-gray-800 rounded-2xl p-6 hover:border-cyber-accent/20 dark:hover:border-cyber-green/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex flex-col text-left group">
            <div className="p-3 rounded-xl bg-cyber-accent/10 text-cyber-accent dark:bg-cyber-green/10 dark:text-cyber-green w-fit mb-4 group-hover:scale-110 transition-all duration-300">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Charging Stations</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
              Discover real-time fast and slow chargers near your current coordinates and highways.
            </p>
          </div>

          <div className="bg-white/40 dark:bg-cyber-card/40 border border-slate-200 dark:border-cyber-gray-800 rounded-2xl p-6 hover:border-cyber-accent/20 dark:hover:border-cyber-green/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex flex-col text-left group">
            <div className="p-3 rounded-xl bg-cyber-accent/10 text-cyber-accent dark:bg-cyber-green/10 dark:text-cyber-green w-fit mb-4 group-hover:scale-110 transition-all duration-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Emergency Assistance</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
              Call portable charging rescues directly to your GPS coordinates if your battery drains out.
            </p>
          </div>

          <div className="bg-white/40 dark:bg-cyber-card/40 border border-slate-200 dark:border-cyber-gray-800 rounded-2xl p-6 hover:border-cyber-accent/20 dark:hover:border-cyber-green/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex flex-col text-left group">
            <div className="p-3 rounded-xl bg-cyber-accent/10 text-cyber-accent dark:bg-cyber-green/10 dark:text-cyber-green w-fit mb-4 group-hover:scale-110 transition-all duration-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Dashboard Analytics</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
              Store your past trips, vehicle models, payments history, and monitor carbon offsets.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;
