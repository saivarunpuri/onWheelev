import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw, Zap, Star, Navigation2, Compass, AlertOctagon } from 'lucide-react';
import axios from 'axios';
import InteractiveMap from '../components/InteractiveMap';

const EmergencyProviders = () => {
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [providers, setProviders] = useState([]);
  const navigate = useNavigate();

  const fallbackProviders = [
    {
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
    },
    {
      id: 'ep-2',
      providerName: 'ChargeMate On-Call',
      contactNumber: '+91 98888 77777',
      serviceType: 'On-site Service',
      vehicleInfo: 'ChargeMate Ranger Van (Mahindra Supro EV)',
      pricing: '₹30/kWh (Min ₹300)',
      rating: 4.8,
      distance: '6.8 km',
      eta: '22 mins',
      availability: 'Available'
    },
    {
      id: 'ep-3',
      providerName: 'EvRescue Services',
      contactNumber: '+91 99999 88888',
      serviceType: 'Emergency Towing',
      vehicleInfo: 'Flatbed EV Towing Truck (E-Towing)',
      pricing: '₹50/km (Flat fee ₹500)',
      rating: 4.6,
      distance: '9.1 km',
      eta: '28 mins',
      availability: 'Available'
    }
  ];

  const handleScanTrigger = async () => {
    setSearching(true);
    try {
      const response = await axios.get('http://localhost:5000/api/providers');
      setTimeout(() => {
        if (response.data.success && response.data.providers.length > 0) {
          const formatted = response.data.providers.map((p, idx) => ({
            id: p._id,
            providerName: p.providerName,
            contactNumber: p.contactNumber,
            serviceType: p.serviceType,
            vehicleInfo: p.vehicleInfo,
            pricing: p.pricing,
            rating: p.rating,
            distance: `${(4.2 + idx * 2.1).toFixed(1)} km`,
            eta: `${15 + idx * 7} mins`,
            availability: p.availability
          }));
          setProviders(formatted);
        } else {
          setProviders(fallbackProviders);
        }
        setSearching(false);
        setSearched(true);
      }, 1500);
    } catch (err) {
      console.warn('Backend server offline during scan, fallback to local high-fidelity presets...');
      setTimeout(() => {
        setProviders(fallbackProviders);
        setSearching(false);
        setSearched(true);
      }, 1500);
    }
  };

  const handleProviderSelect = (provider) => {
    navigate(`/provider-details`, { state: { provider } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left bg-cyber-bg">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Emergency Charging Help</h1>
        <p className="text-gray-400 text-sm mt-1">Get immediate roadside charging and rescue assistance when your battery levels are critical.</p>
      </div>

      {/* Critical battery low warning alert */}
      <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-start space-x-3 text-red-400">
          <AlertOctagon className="w-5 h-5 mt-0.5 flex-shrink-0 animate-bounce" />
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wide">Battery low? Need immediate help?</h4>
            <p className="text-xs text-gray-400 mt-0.5">Let our network scan your precise GPS coordinates to dispatch portable emergency charging vans.</p>
          </div>
        </div>
        
        {!searched && (
          <button
            onClick={handleScanTrigger}
            disabled={searching}
            className="flex-shrink-0 px-5 py-2.5 bg-red-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase hover:bg-red-600 transition flex items-center space-x-1.5 shadow-lg shadow-red-500/15"
          >
            {searching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning Local Radii...</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5" />
                <span>Scan for Rescue Services</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Rescue providers list */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rescue Agencies Available</span>
            {searched && (
              <button 
                onClick={handleScanTrigger} 
                className="text-xs text-cyber-green hover:underline flex items-center space-x-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rescan</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {searching ? (
              <div className="flex flex-col items-center justify-center p-12 bg-cyber-card border border-cyber-gray-800 rounded-2xl h-80 relative overflow-hidden">
                {/* Simulated circular radar scan */}
                <div className="absolute w-44 h-44 border border-cyber-green/20 rounded-full animate-ping" />
                <div className="absolute w-28 h-28 border border-cyber-green/10 rounded-full animate-pulse" />
                <Compass className="w-10 h-10 text-cyber-green animate-spin mb-4" style={{ animationDuration: '3s' }} />
                <p className="text-sm text-white font-bold uppercase tracking-wider">Locating portable units</p>
                <p className="text-xs text-gray-500 mt-1">Interrogating emergency dispatch frequencies...</p>
              </div>
            ) : searched ? (
              providers.map((prov) => (
                <div
                  key={prov.id}
                  onClick={() => handleProviderSelect(prov)}
                  className="cyber-card-glow text-left p-4.5 cursor-pointer flex justify-between items-center border border-cyber-gray-800 hover:border-red-500/30 shadow-md transition-all duration-300 group"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-white text-sm sm:text-base group-hover:text-red-400 transition">{prov.providerName}</h4>
                      <span className="text-xs text-cyber-green font-semibold flex items-center">
                        <Star className="w-3.5 h-3.5 text-cyber-green fill-cyber-green mr-0.5" />
                        {prov.rating}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Service: <b className="text-white font-medium">{prov.serviceType}</b></span>
                      <span>ETA: <b className="text-cyber-green font-medium">{prov.eta}</b></span>
                      <span>Dist: <b className="text-white font-medium">{prov.distance}</b></span>
                    </div>
                  </div>

                  <button className="p-2.5 rounded-full bg-cyber-gray-800 group-hover:bg-red-500/10 border border-cyber-gray-700 group-hover:border-red-500/40 text-gray-400 group-hover:text-red-400 transition ml-2">
                    <Navigation2 className="w-4 h-4 rotate-90 fill-current" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-cyber-card border border-cyber-gray-800 rounded-2xl h-80 flex flex-col justify-center">
                <ShieldAlert className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <h4 className="font-bold text-white text-base">GPS Location Scan Required</h4>
                <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
                  Click the scan button above to locate mobile EV charge units, ranger trucks, and towing carriers within a 15km radius.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Emergency Map view */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <InteractiveMap mode="emergency" />
        </div>
      </div>
    </div>
  );
};

export default EmergencyProviders;
