import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Shield } from 'lucide-react';

/* ── Sun Icon ─────────────────────────────────── */
const SunIcon = () => (
  <svg className="w-4 h-4 theme-icon-enter" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

/* ── Moon Icon ────────────────────────────────── */
const MoonIcon = () => (
  <svg className="w-4 h-4 theme-icon-enter" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
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
    { name: 'Home', path: '/' },
    { name: 'Trip Planner', path: '/planner' },
    { name: 'Charging Stations', path: '/stations' },
    { name: 'Emergency Help', path: '/emergency' },
    { name: 'About Us', path: '/about' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#0B0C10]/95 border-b border-cyber-gray-800 sticky top-0 z-50 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-cyber-green/10 rounded-lg group-hover:bg-cyber-green/20 transition-all duration-300">
              <Zap className="w-5 h-5 text-cyber-green fill-cyber-green group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-extrabold text-xl tracking-wider">
              OnWheel <span className="text-cyber-green">EV</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative py-2 text-sm font-medium tracking-wide transition-all duration-300 hover:text-cyber-green ${
                  isActive(link.path) ? 'text-cyber-green' : 'text-gray-300'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyber-green shadow-cyber-glow" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop: Theme Toggle + Auth */}
          <div className="hidden md:flex items-center space-x-3">

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2 rounded-lg border transition-all duration-300 flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-[#1E1E1E] border-cyber-gray-800 text-yellow-400 hover:border-yellow-400/40 hover:bg-yellow-400/10'
                  : 'bg-white border-blue-200 text-blue-600 hover:border-blue-400/60 hover:bg-blue-50'
              }`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-gray-800 hover:border-cyber-green/45 transition-all text-sm font-semibold"
                >
                  <UserIcon className="w-4 h-4 text-cyber-green" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#121212] border border-cyber-gray-800 rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-cyber-gray-800 text-xs text-gray-400">
                      Signed in as <p className="font-bold text-white truncate mt-0.5">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-sm text-gray-300 hover:bg-cyber-green/10 hover:text-cyber-green transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>User Dashboard</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-gray-300 hover:bg-cyber-accent/10 hover:text-cyber-accent transition-all"
                      >
                        <Shield className="w-4 h-4 text-cyber-accent" />
                        <span className="text-cyber-accent">Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center space-x-2.5 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all border-t border-cyber-gray-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-cyber-primary text-sm py-2 px-4 shadow-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile: Theme toggle + hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-[#1E1E1E] border-cyber-gray-800 text-yellow-400'
                  : 'bg-white border-blue-200 text-blue-600'
              }`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-cyber-card border border-cyber-gray-800 text-gray-400 hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#0c0d12] border-b border-cyber-gray-800 px-4 pt-2 pb-4 space-y-2 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold transition-all ${
                isActive(link.path)
                  ? 'bg-cyber-green/10 text-cyber-green'
                  : 'text-gray-300 hover:bg-cyber-hover'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="border-t border-cyber-gray-800 pt-3 mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 text-xs text-gray-400">
                  Signed in as <span className="font-bold">{user.email}</span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-cyber-green/10 hover:text-cyber-green"
                >
                  User Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-cyber-accent hover:bg-cyber-accent/10"
                  >
                    Admin panel
                  </Link>
                )}
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center btn-cyber-primary py-2 w-full"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
