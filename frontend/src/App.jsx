import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import Layout Component
import Navbar from './components/Navbar';

// Import Pages
import Home from './pages/Home';
import TripPlanner from './pages/TripPlanner';
import TripResult from './pages/TripResult';
import StationsNearby from './pages/StationsNearby';
import EmergencyProviders from './pages/EmergencyProviders';
import ProviderDetails from './pages/ProviderDetails';
import LiveTracking from './pages/LiveTracking';
import Dashboard from './pages/Dashboard';
import SavedTrips from './pages/SavedTrips';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';

function App() {
  const [user, setUser] = useState(null);
  const [lastPlannerOutput, setLastPlannerOutput] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();

  // On mount check if token exists and fetch profile
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Backend server offline during startup check. Loading simulated user credentials if token exists...');
          if (token === 'simulated_jwt_token_key') {
            setUser({
              _id: 'user-id-987',
              name: 'Arjun EV Driver',
              email: 'driver@onwheel.ev',
              vehicleModel: 'Tata Nexon EV Max',
              batteryCapacity: 40.5,
              role: 'user'
            });
          }
        }
      }
      setCheckingAuth(false);
    };
    checkToken();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <div className="animate-spin border-4 border-cyber-green border-t-transparent w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col justify-between">
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<TripPlanner setLastPlannerOutput={setLastPlannerOutput} user={user} onProfileUpdate={handleLoginSuccess} />} />
          <Route path="/trip-result" element={<TripResult tripOutput={lastPlannerOutput} user={user} />} />
          <Route path="/stations" element={<StationsNearby />} />
          <Route path="/emergency" element={<EmergencyProviders />} />
          <Route path="/provider-details" element={<ProviderDetails />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/about" element={<About />} />
          
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register onRegisterSuccess={handleLoginSuccess} />} 
          />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} onProfileUpdate={handleLoginSuccess} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/saved-trips" 
            element={user ? <SavedTrips setLastPlannerOutput={setLastPlannerOutput} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Futuristic sleek dark footer */}
      <footer className="bg-[#08090C] border-t border-cyber-gray-950 py-6 text-center text-xs text-gray-500 font-mono tracking-widest mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>ONWHEEL EV PLATFORM V1.0.0</span>
          <span>© {new Date().getFullYear()} CORE DRIVING SECURITY SYSTEMS INC</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
