import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Users, Zap, Truck, LayoutDashboard, BarChart3, 
  PlusCircle, Trash2, CheckCircle2, AlertOctagon, RefreshCw, Star,
  CreditCard, Eye
} from 'lucide-react';
import axios from 'axios';
import API from '../config';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Analytics State
  const [stats, setStats] = useState({
    totalTrips: 24,
    distanceCovered: 5420,
    carbonSaved: 532,
    totalSpent: 8420
  });

  // Providers list
  const [providers, setProviders] = useState([
    { _id: 'ep-1', providerName: 'PlugNGo Mobile Charging', serviceType: 'Mobile Charging', contactNumber: '+91 98765 43210', pricing: '₹25/kWh', rating: 4.7, availability: 'Available' },
    { _id: 'ep-2', providerName: 'ChargeMate On-Call', serviceType: 'On-site Service', contactNumber: '+91 98888 77777', pricing: '₹30/kWh', rating: 4.8, availability: 'Available' }
  ]);

  // Stations list
  const [stations, setStations] = useState([
    { _id: 'st-1', name: 'Tata Power EZ Charge', address: 'Madhapur Metro Station', chargerType: 'DC Fast Charger', outputPower: 60, status: 'Available' },
    { _id: 'st-2', name: 'Statiq Fast Charging', address: 'Inorbit Mall Parking', chargerType: 'CCS2 Fast Charger', outputPower: 120, status: 'Available' }
  ]);

  // User management list
  const [users, setUsers] = useState([
    { _id: 'u-1', name: 'Arjun EV driver', email: 'driver@onwheel.ev', vehicleModel: 'Tata Nexon EV Max', role: 'user' },
    { _id: 'u-2', name: 'Ramesh Kumar', email: 'ramesh@onwheel.ev', vehicleModel: 'MG ZS EV', role: 'user' }
  ]);

  // Form states for creating new stations/providers
  const [newStation, setNewStation] = useState({ name: '', address: '', chargerType: 'DC Fast Charger', outputPower: 60, lat: 17.4, lng: 78.4, totalPorts: 4, pricing: 15 });
  const [newProvider, setNewProvider] = useState({ providerName: '', contactNumber: '', serviceType: 'Mobile Charging', pricing: '₹25/kWh', lat: 17.41, lng: 78.39 });

  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [adminNotesText, setAdminNotesText] = useState({});

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Analytics
      const analyticsRes = await axios.get(`${API}/api/trips/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.metrics);
      }

      // Providers
      const providersRes = await axios.get(`${API}/api/providers`);
      if (providersRes.data.success) {
        setProviders(providersRes.data.providers);
      }

      // Stations
      const stationsRes = await axios.get(`${API}/api/stations`);
      if (stationsRes.data.success) {
        setStations(stationsRes.data.stations);
      }

      // Users
      const usersRes = await axios.get(`${API}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }

      // Pending Manual Payments [NEW]
      const paymentsRes = await axios.get(`${API}/api/payments/admin/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (paymentsRes.data.success) {
        setPendingPayments(paymentsRes.data.verifications);
      }
    } catch (err) {
      console.warn('Backend server offline, loading local administrator sandbox simulations...');
      // Simulated Payment Verifications Load
      const cached = JSON.parse(localStorage.getItem('my_payment_verifications') || '[]')
        .filter(p => p.status === 'pending');
      setPendingPayments(cached);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/api/stations`, newStation, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStations([...stations, response.data.station]);
        setMessage('Charging station added successfully!');
      }
    } catch (err) {
      // simulated save
      const mockStation = {
        _id: 'st-' + Math.random().toString(36).substring(2, 7),
        ...newStation,
        status: 'Available'
      };
      setStations([...stations, mockStation]);
      setMessage('Charging station added (Simulated Local Mode)!');
    }
    setNewStation({ name: '', address: '', chargerType: 'DC Fast Charger', outputPower: 60, lat: 17.4, lng: 78.4, totalPorts: 4, pricing: 15 });
  };

  const handleAddProvider = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/api/providers`, newProvider, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProviders([...providers, response.data.provider]);
        setMessage('Emergency provider added successfully!');
      }
    } catch (err) {
      // simulated save
      const mockProvider = {
        _id: 'ep-' + Math.random().toString(36).substring(2, 7),
        ...newProvider,
        rating: 4.5,
        availability: 'Available'
      };
      setProviders([...providers, mockProvider]);
      setMessage('Emergency provider added (Simulated Local Mode)!');
    }
    setNewProvider({ providerName: '', contactNumber: '', serviceType: 'Mobile Charging', pricing: '₹25/kWh', lat: 17.41, lng: 78.39 });
  };

  const handleDeleteItem = async (type, id) => {
    try {
      const token = localStorage.getItem('token');
      if (type === 'station') {
        await axios.delete(`${API}/api/stations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStations(stations.filter(s => s._id !== id));
      } else if (type === 'provider') {
        await axios.delete(`${API}/api/providers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProviders(providers.filter(p => p._id !== id));
      } else if (type === 'user') {
        await axios.delete(`${API}/api/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(u => u._id !== id));
      }
      setMessage(`Item removed successfully.`);
    } catch (err) {
      if (type === 'station') setStations(stations.filter(s => s._id !== id));
      if (type === 'provider') setProviders(providers.filter(p => p._id !== id));
      if (type === 'user') setUsers(users.filter(u => u._id !== id));
      setMessage('Item removed (Simulated Local Mode).');
    }
  };

  const handleResolvePayment = async (payId, status, notes) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/api/payments/admin/resolve/${payId}`, {
        status,
        adminNotes: notes || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPendingPayments(pendingPayments.filter(p => p._id !== payId));
        setMessage(`Payment transaction has been resolved as ${status} successfully!`);
      }
    } catch (err) {
      console.warn('Database offline, resolving payment locally...');
      // Fallback simulated resolution
      const allReqs = JSON.parse(localStorage.getItem('my_payment_verifications') || '[]');
      const updatedReqs = allReqs.map(r => {
        if (r._id === payId) {
          return { ...r, status, adminNotes: notes || '' };
        }
        return r;
      });
      localStorage.setItem('my_payment_verifications', JSON.stringify(updatedReqs));
      setPendingPayments(pendingPayments.filter(p => p._id !== payId));
      
      setMessage(`Payment has been resolved as ${status} (Local Simulation Mode)!`);
    }
  };

  const submenus = [
    { id: 'analytics', name: 'Platform Analytics', icon: BarChart3 },
    { id: 'payments', name: 'Approve Payments', icon: CreditCard },
    { id: 'stations', name: 'Manage Stations', icon: Zap },
    { id: 'providers', name: 'Manage Providers', icon: Truck },
    { id: 'users', name: 'Manage Users', icon: Users }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left bg-cyber-bg">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center">
          <ShieldAlert className="w-8 h-8 text-cyber-accent mr-2.5" />
          Admin Dashboard Panel
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Comprehensive operations controls for the OnWheel EV ecosystem.</p>
      </div>

      {message && (
        <div className="p-3.5 bg-cyber-green/10 border border-cyber-green/20 rounded-xl flex items-center space-x-2 text-cyber-green text-xs font-bold mb-6">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar Submenu */}
        <div className="lg:col-span-3 bg-cyber-card border border-cyber-gray-800 rounded-2xl p-4 space-y-2 shadow-lg">
          {submenus.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMessage(''); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-cyber-accent/10 text-cyber-accent border-l-2 border-cyber-accent' 
                    : 'text-gray-300 hover:bg-cyber-hover hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: ANALYTICS DIAGNOSTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-white text-lg">System-wide Telemetry Metrics</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 shadow-md">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Trips Calculated</span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block">{stats.totalTrips} Trips</span>
                </div>
                <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 shadow-md">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Platform Distance Log</span>
                  <span className="text-2xl font-extrabold text-cyber-green mt-1.5 block">{stats.distanceCovered.toLocaleString()} km</span>
                </div>
                <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 shadow-md">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Carbon Footprint Saved</span>
                  <span className="text-2xl font-extrabold text-cyber-accent mt-1.5 block">{stats.carbonSaved} kg CO₂</span>
                </div>
                <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 shadow-md">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Admin Health</span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block text-cyber-green">100% Core</span>
                </div>
              </div>

              {/* Status details logger */}
              <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 shadow-md text-xs space-y-4">
                <h4 className="font-bold text-white uppercase tracking-wider">Active Platform Servers Diagnostic</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div className="p-3 bg-[#0b0c10] border border-cyber-gray-900 rounded-lg">
                    <span className="text-gray-500 block">Express API Server</span>
                    <span className="text-cyber-green font-bold mt-1 block">● ONLINE / STABLE</span>
                  </div>
                  <div className="p-3 bg-[#0b0c10] border border-cyber-gray-900 rounded-lg">
                    <span className="text-gray-500 block">Mongoose Cluster</span>
                    <span className="text-cyber-accent font-bold mt-1 block">● MOCKED_SANDBOX</span>
                  </div>
                  <div className="p-3 bg-[#0b0c10] border border-cyber-gray-900 rounded-lg">
                    <span className="text-gray-500 block">GIS Routing Core</span>
                    <span className="text-cyber-green font-bold mt-1 block">● ACTIVE_GRID</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APPROVE PAYMENTS [NEW] */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in text-left">
              <h3 className="font-bold text-white text-lg">Pending CyberPass Refill Approvals</h3>
              
              <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl overflow-hidden shadow-lg">
                {pendingPayments.length > 0 ? (
                  <div className="divide-y divide-cyber-gray-950">
                    {pendingPayments.map((pay) => (
                      <div key={pay._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#121212] transition duration-300">
                        
                        {/* Driver details and transaction metadata */}
                        <div className="space-y-2.5 max-w-md">
                          <div className="flex items-center space-x-2.5">
                            <span className="px-2 py-0.5 bg-cyber-accent/15 text-cyber-accent text-[9px] font-mono font-bold uppercase rounded border border-cyber-accent/30">
                              {pay.paymentMethod.toUpperCase()} Refill
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              UTR: <b className="text-white tracking-widest">{pay.utr}</b>
                            </span>
                          </div>
                          
                          <div className="text-sm">
                            <p className="font-extrabold text-white">{pay.userName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{pay.userEmail}</p>
                          </div>
                          
                          <div className="flex space-x-4 text-xs font-semibold text-gray-400">
                            <p>Amount: <b className="text-cyber-green text-sm">₹{pay.amount.toLocaleString()}</b></p>
                            {pay.upiIdUsed && <p>Sender UPI: <b className="text-gray-300">{pay.upiIdUsed}</b></p>}
                          </div>
                          
                          {/* Textarea for approval notes */}
                          <div className="flex flex-col space-y-1 mt-3">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Resolution Notes (Optional)</label>
                            <textarea
                              placeholder="e.g. UTR verified. Approved."
                              value={adminNotesText[pay._id] || ''}
                              onChange={(e) => setAdminNotesText({ ...adminNotesText, [pay._id]: e.target.value })}
                              className="bg-[#0b0c10] border border-cyber-gray-900 rounded-lg p-2 text-white text-xs outline-none focus:border-cyber-accent w-72 h-12 resize-none"
                            />
                          </div>
                        </div>

                        {/* Screenshot image preview card and CTAs */}
                        <div className="flex items-center space-x-5">
                          {/* ImageKit.io Uploaded screenshot display thumbnail */}
                          <div 
                            onClick={() => setSelectedScreenshot(pay.screenshotUrl)}
                            className="w-24 h-24 bg-[#0b0c10] border border-cyber-gray-900 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center relative group shadow-inner"
                            title="Click to view full screenshot receipt"
                          >
                            <img src={pay.screenshotUrl} alt="Receipt Screenshot" className="object-cover w-full h-full opacity-60 group-hover:opacity-90 transition duration-300" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                              <Eye className="w-5 h-5 text-cyber-accent animate-pulse" />
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleResolvePayment(pay._id, 'approved', adminNotesText[pay._id])}
                              className="px-4 py-2 bg-cyber-green text-black text-xs font-bold uppercase rounded-lg hover:bg-cyber-green/80 transition shadow-lg shadow-cyber-green/5 flex items-center justify-center space-x-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                              <span>Approve</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                const notes = adminNotesText[pay._id] || 'Rejected by administrator';
                                handleResolvePayment(pay._id, 'rejected', notes);
                              }}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-xs font-bold uppercase rounded-lg transition"
                            >
                              Reject
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-[#0b0c10]/40 text-xs font-semibold text-gray-500">
                    <p className="text-sm">Zero pending payment approvals in the queue.</p>
                    <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-1">Grid verification systems balanced</p>
                  </div>
                )}
              </div>

              {/* Lightbox Screenshot Overlay Modal */}
              {selectedScreenshot && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                  <div className="relative max-w-3xl max-h-[85vh] bg-[#121212] border border-cyber-accent rounded-2xl overflow-hidden p-2 shadow-2xl flex flex-col items-center">
                    <button 
                      onClick={() => setSelectedScreenshot(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 border border-cyber-accent text-cyber-accent font-bold hover:bg-cyber-accent hover:text-black transition flex items-center justify-center"
                    >
                      ✕
                    </button>
                    <img src={selectedScreenshot} alt="Full Screenshot Receipt" className="object-contain max-h-[75vh] w-auto rounded-xl shadow-lg border border-cyber-gray-950" />
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-3">ImageKit.io Payment Screenshot Verification</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE STATIONS */}
          {activeTab === 'stations' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-white text-lg">Platform Charging Networks</h3>
              
              {/* Form to create new station */}
              <form onSubmit={handleAddStation} className="bg-cyber-card border border-cyber-gray-800 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col space-y-1.5 text-xs text-gray-400">
                  <label className="font-bold uppercase tracking-wider">Station Name</label>
                  <input
                    type="text"
                    required
                    value={newStation.name}
                    onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                    placeholder="e.g. Jio BP Fast Grid"
                    className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="flex flex-col space-y-1.5 text-xs text-gray-400">
                  <label className="font-bold uppercase tracking-wider">Address Location</label>
                  <input
                    type="text"
                    required
                    value={newStation.address}
                    onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
                    placeholder="e.g. Gachibowli, Hyderabad"
                    className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                
                <button type="submit" className="w-full btn-cyber-primary py-2.5 text-xs font-bold flex items-center justify-center space-x-1">
                  <PlusCircle className="w-4 h-4 text-black" />
                  <span>Register Station</span>
                </button>
              </form>

              {/* Station Listing table */}
              <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0b0c10] text-gray-500 font-bold uppercase tracking-wider border-b border-cyber-gray-950">
                      <th className="p-4">Station</th>
                      <th className="p-4">Address</th>
                      <th className="p-4">Charger Type</th>
                      <th className="p-4 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((st) => (
                      <tr key={st._id} className="border-b border-cyber-gray-950 hover:bg-[#121212] transition">
                        <td className="p-4 font-extrabold text-white">{st.name}</td>
                        <td className="p-4 text-gray-400">{st.address}</td>
                        <td className="p-4 text-cyber-green font-semibold">{st.chargerType} • {st.outputPower} kW</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteItem('station', st._id)} className="text-red-400 hover:text-red-500 transition p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-white text-lg">Emergency Charging Rescue Networks</h3>
              
              {/* Form to create new provider */}
              <form onSubmit={handleAddProvider} className="bg-cyber-card border border-cyber-gray-800 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col space-y-1.5 text-xs text-gray-400">
                  <label className="font-bold uppercase tracking-wider">Provider Name</label>
                  <input
                    type="text"
                    required
                    value={newProvider.providerName}
                    onChange={(e) => setNewProvider({ ...newProvider, providerName: e.target.value })}
                    placeholder="e.g. EV Rescue Speed"
                    className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="flex flex-col space-y-1.5 text-xs text-gray-400">
                  <label className="font-bold uppercase tracking-wider">Contact Number</label>
                  <input
                    type="text"
                    required
                    value={newProvider.contactNumber}
                    onChange={(e) => setNewProvider({ ...newProvider, contactNumber: e.target.value })}
                    placeholder="+91 99887 66554"
                    className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                
                <button type="submit" className="w-full btn-cyber-primary py-2.5 text-xs font-bold flex items-center justify-center space-x-1">
                  <PlusCircle className="w-4 h-4 text-black" />
                  <span>Register Service</span>
                </button>
              </form>

              {/* Provider list table */}
              <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0b0c10] text-gray-500 font-bold uppercase tracking-wider border-b border-cyber-gray-950">
                      <th className="p-4">Rescue Agency</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Service</th>
                      <th className="p-4 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p._id} className="border-b border-cyber-gray-950 hover:bg-[#121212] transition">
                        <td className="p-4 font-extrabold text-white">{p.providerName}</td>
                        <td className="p-4 text-gray-400">{p.contactNumber}</td>
                        <td className="p-4 text-cyber-accent font-semibold">{p.serviceType} ({p.pricing})</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteItem('provider', p._id)} className="text-red-400 hover:text-red-500 transition p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-white text-lg">User Administration</h3>
              
              <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl overflow-hidden shadow-lg text-left">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0b0c10] text-gray-500 font-bold uppercase tracking-wider border-b border-cyber-gray-950">
                      <th className="p-4">Driver Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Vehicle Configuration</th>
                      <th className="p-4 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-cyber-gray-950 hover:bg-[#121212] transition">
                        <td className="p-4 font-extrabold text-white flex items-center">
                          {u.name}
                          {u.role === 'admin' && (
                            <span className="px-1.5 py-0.5 rounded bg-cyber-accent/10 text-cyber-accent text-[8px] font-bold uppercase ml-2 border border-cyber-accent/20">
                              System
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-400">{u.email}</td>
                        <td className="p-4 text-cyber-green font-semibold">{u.vehicleModel || 'N/A'}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDeleteItem('user', u._id)} 
                            disabled={u.role === 'admin'}
                            className={`transition p-1 ${u.role === 'admin' ? 'text-gray-700 cursor-not-allowed' : 'text-red-400 hover:text-red-500'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
