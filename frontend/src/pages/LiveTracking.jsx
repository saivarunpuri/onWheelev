import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Phone, MessageSquare, ArrowLeft, RefreshCw, Compass } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';

const LiveTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [eta, setEta] = useState(15);
  const [distance, setDistance] = useState(4.2);
  const [isArrived, setIsArrived] = useState(false);

  const dispatch = location.state?.dispatch || {
    trackingId: 'TRK-ABC123XYZ',
    etaMinutes: 15,
    distanceKm: 4.2,
    status: 'En Route'
  };

  const provider = location.state?.provider || {
    providerName: 'PlugNGo Mobile Charging',
    contactNumber: '+91 98765 43210',
    vehicleInfo: 'EV Rescue Van 12 (Tata Ace EV)',
    serviceType: 'Mobile Charging'
  };

  const handleTrackingProgress = (progress) => {
    const remainingEta = Math.max(0, Math.round(15 - (15 * progress) / 100));
    const remainingDistance = Math.max(0, 4.2 - (4.2 * progress) / 100);
    setEta(remainingEta);
    setDistance(remainingDistance);
    if (progress >= 100) {
      setIsArrived(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left bg-cyber-bg">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Track Your Provider</h1>
          <p className="text-gray-400 text-sm mt-0.5">Your emergency charging partner is on the way.</p>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500 bg-cyber-card border border-cyber-gray-800 px-3.5 py-2 rounded-xl font-mono">
          <span>TRACKING_ID:</span>
          <span className="text-cyber-green font-bold">{dispatch.trackingId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Status & details */}
        <div className="lg:col-span-5 bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden text-left">
          
          <div className="absolute top-0 right-0 p-3 bg-cyber-green/5 text-cyber-green font-mono text-[9px] uppercase border-b border-l border-cyber-gray-800 rounded-bl-lg">
            GPS: ACTIVE
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-cyber-green/10 rounded-xl border border-cyber-green/20">
              <Truck className="w-6 h-6 text-cyber-green" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base">{provider.providerName}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{provider.vehicleInfo}</p>
            </div>
          </div>

          {/* Provider Driver details */}
          <div className="border-y border-cyber-gray-800 py-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Assigned Driver</span>
                <span className="text-sm font-bold text-white mt-1">Ramesh Kumar</span>
              </div>
              
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Dispatch status</span>
                <span className={`text-sm font-extrabold mt-1 ${isArrived ? 'text-cyber-green' : 'text-cyber-accent animate-pulse'}`}>
                  {isArrived ? 'Arrived' : 'On the Way'}
                </span>
              </div>
            </div>

            {/* Simulated HUD Live updates for Distance and ETA */}
            <div className="grid grid-cols-2 gap-4 bg-[#0b0c10] border border-cyber-gray-800 p-4 rounded-xl">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Estimated Arrival</span>
                <span className="text-lg font-extrabold text-cyber-green mt-1">
                  {isArrived ? '0 mins' : `${eta} mins`}
                </span>
              </div>

              <div className="flex flex-col border-l border-cyber-gray-900 pl-4 text-left">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Distance to GPS</span>
                <span className="text-lg font-extrabold text-white mt-1">
                  {isArrived ? '0.0 km' : `${distance.toFixed(1)} km`}
                </span>
              </div>
            </div>
          </div>

          {/* Call & Contact Actions */}
          <div className="flex gap-3">
            <a
              href={`tel:${provider.contactNumber}`}
              className="flex-1 px-4 py-3 bg-cyber-hover hover:bg-cyber-green hover:text-black border border-cyber-gray-800 hover:border-cyber-green text-xs font-extrabold rounded-xl transition text-center flex items-center justify-center space-x-2 text-white"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Partner</span>
            </a>
            
            <button
              onClick={() => alert('Opening Secure Chat Intercom with Ramesh...')}
              className="px-4 py-3 bg-cyber-hover hover:bg-cyber-accent hover:text-black border border-cyber-gray-800 hover:border-cyber-accent text-xs font-extrabold rounded-xl transition text-center flex items-center justify-center text-white"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          {isArrived && (
            <div className="pt-4 border-t border-cyber-gray-800 animate-fade-in">
              <Link
                to="/dashboard"
                className="w-full btn-cyber-primary text-sm font-extrabold flex items-center justify-center space-x-1.5 py-3"
              >
                <span>Return to Dashboard</span>
              </Link>
            </div>
          )}

        </div>

        {/* Right Column: Interactive Map running tracking vector animation */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Dispatch Telemetry</span>
            <span className="inline-flex items-center text-xs text-cyber-green font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green mr-1.5 animate-ping" />
              Live GIS Radar Feed
            </span>
          </div>

          <InteractiveMap 
            mode="tracking" 
            activeProvider={provider}
            onTrackingProgress={handleTrackingProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
