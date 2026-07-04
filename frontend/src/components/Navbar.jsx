import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Zap, 
  ShieldAlert, 
  Info, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Shield, 
  Sun, 
  Moon 
} from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  const navigate = useNavigate();
  const location = useLocation();

  /* Apply theme class on mount + whenever it changes */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleLogoutClick = () => {
    onLogout();
    setShowDropdown(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Trip Planner', path: '/planner', icon: Map },
    { name: 'Charging Stations', path: '/stations', icon: Zap },
    { name: 'Emergency Help', path: '/emergency', icon: ShieldAlert },
    { name: 'About Us', path: '/about', icon: Info }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getActivePageName = () => {
    const activeLink = navLinks.find(link => isActive(link.path));
    return activeLink ? activeLink.name : 'Dashboard';
  };

  const ChargingStationLogo = ({ sizeClass = "w-6 h-6", pulse = false }) => (
    <Zap 
      className={`${sizeClass} text-[#F59E0B] filter drop-shadow-[0_0_8px_rgba(245,158,11,0.45)] ${pulse ? 'animate-pulse' : ''} transition-transform duration-500 fill-[#F59E0B]`} 
    />
  );

  return (
    <>
      {/* ── CENTRALIZED DYNAMIC ISLAND CAPSULE NAVIGATION ── */}
      <nav
        onMouseEnter={() => {
          if (window.innerWidth >= 768) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowDropdown(false);
        }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[5000] bg-slate-50/95 dark:bg-[#001616]/95 border border-slate-200/80 dark:border-cyber-gray-800/80 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out
          ${isMobileOpen 
            ? 'flex flex-col justify-start w-[90%] max-w-[340px] h-[390px] rounded-3xl p-5 overflow-hidden' 
            : 'flex flex-row items-center justify-between h-14 rounded-full px-5 w-[290px] md:w-64'
          }
          ${isHovered && !isMobileOpen
            ? 'md:w-[960px] md:px-5' 
            : ''
          }
        `}
      >
        {/* COLLAPSED STATE (Desktop & Mobile) */}
        {!isMobileOpen && !isHovered && (
          <div className="w-full flex items-center justify-between h-full relative">
            {/* New EV Charging Station Logo - Left */}
            <Link to="/" className="flex items-center flex-shrink-0 pointer-events-auto z-10">
              <div className="p-1 bg-cyber-accent/10 dark:bg-cyber-green/10 rounded-xl hover:bg-cyber-accent/20 dark:hover:bg-cyber-green/20 transition-all duration-300 flex items-center justify-center">
                <ChargingStationLogo pulse={true} sizeClass="w-6.5 h-6.5" />
              </div>
            </Link>

            {/* Active Page Name (Mathematically Centered Absolutely in the exact center of the nav) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-xs md:text-[13px] font-black tracking-[0.25em] uppercase text-cyber-accent dark:text-cyber-green font-cyber truncate max-w-[140px]">
                {getActivePageName()}
              </span>
            </div>

            {/* Expand Menu Trigger (Mobile) or Profile (Desktop) - Right */}
            <div className="flex items-center space-x-1 pointer-events-auto z-10">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-cyber-gray-900/30 text-slate-500 dark:text-gray-400"
              >
                <div className="flex flex-col space-y-1.5 w-4 items-end">
                  <span className="w-4 h-0.5 bg-slate-800 dark:bg-white rounded" />
                  <span className="w-2.5 h-0.5 bg-slate-800 dark:bg-white rounded" />
                </div>
              </button>
              
              {/* Desktop profile hint */}
              <div className="hidden md:flex p-1.5 rounded-xl text-cyber-accent dark:text-cyber-green hover:bg-slate-200/50 dark:hover:bg-cyber-gray-900/30 transition-all duration-300 flex items-center justify-center">
                <UserIcon className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>
        )}

        {/* EXPANDED DESKTOP STATE */}
        {isHovered && !isMobileOpen && (
          <div className="hidden md:flex w-full items-center justify-between h-full">
            {/* Logo brand */}
            <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
              <div className="p-1.5 bg-cyber-accent/10 dark:bg-cyber-green/10 rounded-xl group-hover:bg-cyber-green/20 transition-all duration-300">
                <ChargingStationLogo sizeClass="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xs tracking-widest font-display text-slate-800 dark:text-white uppercase">
                OnWheel<span className="text-cyber-accent dark:text-cyber-green">EV</span>
              </span>
            </Link>

            {/* Links Center */}
            <div className="flex items-center space-x-1.5">
              {navLinks.map((link) => {
                const LinkIcon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center h-9 px-3.5 rounded-full transition-all duration-300 relative text-xs font-semibold ${
                      active
                        ? 'bg-cyber-accent/10 dark:bg-cyber-green/10 text-cyber-accent dark:text-cyber-green shadow-[0_0_10px_rgba(0,245,212,0.1)] border border-cyber-accent/20 dark:border-cyber-green/20'
                        : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-cyber-gray-900/30'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0 relative">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className={`p-1.5 rounded-full border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-[#1E1E1E]/50 text-yellow-400 border-cyber-gray-800 hover:bg-yellow-400/10'
                    : 'bg-slate-200 text-blue-600 border-slate-300 hover:bg-slate-300/50'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* User Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(!showDropdown);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-cyber-card border border-slate-300 dark:border-cyber-gray-800 hover:border-cyber-accent dark:hover:border-cyber-green text-slate-800 dark:text-white text-xs font-bold transition-all"
                  >
                    <UserIcon className="w-3 h-3 text-cyber-accent dark:text-cyber-green" />
                    <span className="max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-cyber-gray-800 rounded-2xl shadow-2xl py-2.5 z-50 animate-fade-in pointer-events-auto">
                      <div className="px-4 py-1.5 border-b border-slate-100 dark:border-cyber-gray-800 text-[10px] text-slate-500 dark:text-gray-400">
                        Signed in as <span className="font-bold text-slate-800 dark:text-white truncate block mt-0.5">{user.email}</span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => { setShowDropdown(false); setIsHovered(false); }}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 dark:text-gray-300 hover:bg-cyber-accent/10 hover:text-cyber-accent dark:hover:bg-cyber-green/10 dark:hover:text-cyber-green transition-all"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>User Dashboard</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => { setShowDropdown(false); setIsHovered(false); }}
                          className="flex items-center space-x-2 px-4 py-2 text-xs text-cyber-accent hover:bg-cyber-accent/10 transition-all font-semibold"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-all border-t border-slate-100 dark:border-cyber-gray-800 mt-1 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center h-8 px-4 rounded-full bg-cyber-accent dark:bg-cyber-green text-[#ffffff] dark:text-black font-bold text-xs shadow-md dark:shadow-[0_0_10px_rgba(0,245,212,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}

        {/* EXPANDED MOBILE STATE */}
        {isMobileOpen && (
          <div className="md:hidden flex flex-col justify-between w-full h-full transition-all duration-300">
            {/* Top Row: Logo + Close */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-cyber-gray-800/60 pb-2 w-full">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileOpen(false)}>
                <div className="p-1 bg-cyber-accent/10 dark:bg-cyber-green/10 rounded-lg">
                  <ChargingStationLogo sizeClass="w-5.5 h-5.5" />
                </div>
                <span className="font-extrabold text-xs tracking-widest text-slate-800 dark:text-white uppercase font-display">
                  OnWheel<span className="text-cyber-accent dark:text-cyber-green">EV</span>
                </span>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-cyber-gray-900/30 text-slate-500 dark:text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links Stack */}
            <div className="flex flex-col space-y-1.5 py-3 w-full">
              {navLinks.map((link) => {
                const LinkIcon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center h-10 px-3.5 rounded-xl transition-all duration-200 text-xs font-semibold w-full ${
                      active
                        ? 'bg-cyber-accent/10 dark:bg-cyber-green/10 text-cyber-accent dark:text-cyber-green border border-cyber-accent/20 dark:border-cyber-green/20'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-cyber-gray-900/20'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 mr-2.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-cyber-gray-800/60 pt-2.5 mt-auto w-full">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                  theme === 'dark'
                    ? 'bg-[#1E1E1E] text-yellow-400 border-cyber-gray-800'
                    : 'bg-slate-100 text-blue-600 border-slate-200'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Profile Action */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-cyber-card border border-slate-200 dark:border-cyber-gray-800 text-xs text-slate-800 dark:text-white font-bold"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyber-accent dark:text-cyber-green" />
                    <span className="max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={() => { handleLogoutClick(); setIsMobileOpen(false); }}
                    className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center h-9 px-5 rounded-xl bg-cyber-accent dark:bg-cyber-green text-[#ffffff] dark:text-black font-bold text-xs"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}

      </nav>
    </>
  );
};

export default Navbar;
