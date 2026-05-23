import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Zap, Phone, ShieldCheck, MapPin, Truck, HelpCircle } from 'lucide-react';
import axios from 'axios';
import API from '../config';

const ProviderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [requesting, setRequesting] = useState(false);

  // Read routed provider data, fallback to PlugNGo if none provided
  const provider = location.state?.provider || {
    id: 'ep-1',
    providerName: 'PlugNGo Mobile Charging',
    contactNumber: '+91 98765 43210',
    serviceType: 'Mobile Charging',
    vehicleInfo: 'EV Rescue Van 12 (Tata Ace EV)',
    pricing: '₹25/kWh (Min ₹200)',
    rating: 4.7,
    distance: '4.2 km',
    eta: '15 mins',
    availability: 'Available'
  };

  const handleRequestService = async () => {
    setRequesting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/api/providers/${provider.id}/request`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (response.data.success) {
        navigate('/live-tracking', { 
          state: { 
            dispatch: response.data.dispatch,
            provider: provider
          } 
        });
      }
    } catch (err) {
      console.warn('Backend server offline, simulating dispatch workflow locally...');
      setTimeout(() => {
        // High fidelity simulated dispatch metadata
        const mockDispatch = {
          trackingId: 'TRK-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          etaMinutes: 15,
          distanceKm: 4.2,
          status: 'En Route'
        };
        navigate('/live-tracking', { 
          state: { 
            dispatch: mockDispatch,
            provider: provider
          } 
        });
      }, 1000);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left bg-cyber-bg">
      <button
        onClick={() => navigate('/emergency')}
        className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-cyber-green uppercase tracking-wider mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Providers List</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Stats & details info */}
        <div className="md:col-span-7 bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 space-y-6 shadow-xl text-left relative overflow-hidden">
          
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                <span>Verified Rescue Partner</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">{provider.providerName}</h2>
              <p className="text-xs text-gray-400 mt-1">{provider.vehicleInfo}</p>
            </div>
            
            <div className="flex items-center text-cyber-green font-bold bg-[#0b0c10] border border-cyber-gray-800 px-3 py-1 rounded-lg text-sm">
              <Star className="w-4 h-4 fill-cyber-green mr-1" />
              <span>{provider.rating}</span>
            </div>
          </div>

          {/* Details Specifications Grid */}
          <div className="grid grid-cols-2 gap-4 border-y border-cyber-gray-800 py-5 text-xs text-gray-400">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Distance</span>
              <span className="text-sm font-extrabold text-white mt-1">{provider.distance || '4.2 km'}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">ETA to GPS</span>
              <span className="text-sm font-extrabold text-cyber-green mt-1">{provider.eta || '15 mins'}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Service Type</span>
              <span className="text-sm font-extrabold text-white mt-1">{provider.serviceType}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Availability Status</span>
              <span className="text-sm font-extrabold text-cyber-green mt-1">24/7 Operations</span>
            </div>

            <div className="col-span-2 flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Pricing Rates</span>
              <span className="text-sm font-extrabold text-cyber-accent mt-1">{provider.pricing}</span>
            </div>
          </div>

          {/* Contact Details info */}
          <div className="flex items-center justify-between bg-[#0b0c10] border border-cyber-gray-800 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-cyber-green/10 text-cyber-green">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Direct Mobile line</span>
                <span className="text-sm font-bold text-white mt-0.5">{provider.contactNumber}</span>
              </div>
            </div>
            
            <a 
              href={`tel:${provider.contactNumber}`} 
              className="px-3.5 py-1.5 bg-cyber-gray-800 text-xs font-semibold rounded-lg hover:text-cyber-green hover:bg-cyber-hover transition"
            >
              Call Unit
            </a>
          </div>

          {/* Action trigger button */}
          <button
            onClick={handleRequestService}
            disabled={requesting}
            className="w-full bg-cyber-green hover:bg-cyber-green-dark text-black font-extrabold py-3.5 rounded-xl transition text-sm flex items-center justify-center space-x-2 shadow-cyber-glow"
          >
            {requesting ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin border-2 border-black border-t-transparent w-4 h-4 rounded-full" />
                <span>Interfacing Dispatch Channels...</span>
              </span>
            ) : (
              <>
                <Truck className="w-4 h-4 text-black fill-black" />
                <span>Request Rescue Service</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Dynamic Vector Illustration of Charging Van rescue */}
        <div className="md:col-span-5 bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 flex flex-col justify-between h-[360px] md:h-[480px] shadow-xl text-center relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-3 bg-cyber-green/5 text-cyber-green font-mono text-[9px] uppercase border-b border-l border-cyber-gray-800 rounded-bl-lg">
            HOLO_FEED: LIVE
          </div>

          <div className="text-left mb-4">
            <h3 className="font-bold text-white text-base">Roadside Charging Van</h3>
            <p className="text-xs text-gray-500 mt-0.5">Equipped with 30 kWh DC Fast charger</p>
          </div>

          {/* SVG Vehicle connected to a glowing charging port illustration */}
          <div className="flex-grow flex items-center justify-center my-4 relative">
            <div className="absolute w-40 h-40 border border-cyber-green/5 rounded-full animate-pulse" />
            
            <svg className="w-64 h-44 text-cyber-green drop-shadow-[0_0_15px_rgba(0,229,118,0.2)]" viewBox="0 0 160 100" fill="none">
              {/* Ground road */}
              <line x1="10" y1="80" x2="150" y2="80" stroke="#2D3748" strokeWidth="2" />
              {/* Van vector body */}
              <path d="M20 70 H30 C30 65, 38 65, 38 70 H72 L78 50 H90 V70 H102 C102 65, 110 65, 110 70 H120 V80 H20 Z" fill="#121212" stroke="#00E576" strokeWidth="1.5" />
              {/* Windows */}
              <path d="M78 52 H88 V60 H76 Z" fill="none" stroke="#00E576" strokeWidth="1" />
              {/* Wheels */}
              <circle cx="34" cy="78" r="8" fill="#0B0C10" stroke="#00E576" strokeWidth="1.5" />
              <circle cx="106" cy="78" r="8" fill="#0B0C10" stroke="#00E576" strokeWidth="1.5" />
              <circle cx="34" cy="78" r="3" fill="#00E576" />
              <circle cx="106" cy="78" r="3" fill="#00E576" />
              {/* "PLUG N GO" HUD sign */}
              <rect x="26" y="52" width="44" height="12" fill="#0B0C10" rx="2" stroke="#00E576" strokeWidth="0.75" />
              <text x="48" y="60" textAnchor="middle" fill="#00E576" fontSize="5" fontFamily="monospace" fontWeight="bold">PLUG N GO</text>
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-500 border-t border-cyber-gray-800 pt-4">
            <div className="flex flex-col">
              <span className="font-bold text-white">Portable</span>
              <span>Charger</span>
            </div>
            <div className="flex flex-col border-l border-cyber-gray-800">
              <span className="font-bold text-white">On-Site</span>
              <span>Service</span>
            </div>
            <div className="flex flex-col border-l border-cyber-gray-800">
              <span className="font-bold text-white">All EVs</span>
              <span>Supported</span>
            </div>
            <div className="flex flex-col border-l border-cyber-gray-800">
              <span className="font-bold text-white">24/7</span>
              <span>Assistance</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProviderDetails;
