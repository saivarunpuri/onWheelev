import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Navigation2, Zap, Save, CheckCircle2, AlertTriangle, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import InteractiveMap from '../components/InteractiveMap';

const TripResult = ({ tripOutput, user }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [navStarted, setNavStarted] = useState(false);

  if (!tripOutput) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-cyber-green mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white">No active trip results found</h2>
        <p className="text-gray-400 text-sm mt-2">Please go back to the planner page and customize a new route.</p>
        <Link to="/planner" className="mt-6 inline-block btn-cyber-primary text-sm py-2 px-6">
          Go to Trip Planner
        </Link>
      </div>
    );
  }

  const { source, destination, summary, suggestedStops } = tripOutput;

  const handleSaveTrip = async () => {
    if (!user) {
      navigate('/login?redirect=trip-result');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/trips/save',
        {
          sourceName: source,
          destName: destination,
          startBattery: summary.startBattery,
          endBattery: summary.arrivalBattery,
          totalDistance: summary.totalDistance,
          duration: summary.duration,
          suggestedStops: suggestedStops
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSaveSuccess(true);
      } else {
        setSaveError('Failed to save trip. Please try again.');
      }
    } catch (err) {
      console.warn('Backend server offline, simulating trip save locally...');
      setTimeout(() => {
        // Mock save local storage
        const saved = JSON.parse(localStorage.getItem('saved_trips') || '[]');
        saved.push({
          id: Math.random().toString(36).substring(2, 9),
          sourceName: source,
          destName: destination,
          startBattery: summary.startBattery,
          endBattery: summary.arrivalBattery,
          totalDistance: summary.totalDistance,
          duration: summary.duration,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('saved_trips', JSON.stringify(saved));
        setSaveSuccess(true);
        setSaving(false);
      }, 800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left bg-cyber-bg">
      {/* Header back button */}
      <button 
        onClick={() => navigate('/planner')} 
        className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-cyber-green uppercase tracking-wider mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Modify Search Settings</span>
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Trip Plan</h1>
          <p className="text-gray-400 text-sm mt-0.5">Optimized Route with Charging Stops</p>
        </div>

        {/* Save button state check */}
        {saveSuccess ? (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Trip Saved Successfully!</span>
          </div>
        ) : (
          <button
            onClick={handleSaveTrip}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyber-card border border-cyber-gray-800 hover:border-cyber-green text-sm font-semibold transition"
          >
            <Save className="w-4 h-4 text-cyber-green" />
            <span>{saving ? 'Saving Plan...' : 'Save to History'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Step-by-Step Route nodes */}
        <div className="lg:col-span-5 bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-3 bg-cyber-green/5 text-cyber-green font-mono text-[9px] uppercase border-b border-l border-cyber-gray-800 rounded-bl-lg">
            {summary.vehicleModel}
          </div>

          <div className="relative border-l-2 border-dashed border-cyber-gray-800 pl-6 ml-3.5 space-y-6">
            
            {/* Start Node */}
            <div className="relative">
              <span className="absolute -left-[32px] top-1 w-4 h-4 rounded-full bg-[#0c0d12] border-2 border-cyber-green flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
              </span>
              <div>
                <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Start</h4>
                <p className="text-sm font-extrabold text-white mt-0.5">{source}</p>
                <div className="inline-flex items-center text-xs text-cyber-green mt-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-green mr-1.5" />
                  Starting Battery: {summary.startBattery}%
                </div>
              </div>
            </div>

            {/* Suggested Stops nodes */}
            {suggestedStops.length > 0 ? (
              suggestedStops.map((stop, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-[32px] top-1 w-4 h-4 rounded-full bg-[#0c0d12] border-2 border-cyber-green flex items-center justify-center">
                    <Zap className="w-2.5 h-2.5 text-cyber-green fill-cyber-green" />
                  </span>
                  <div className="bg-[#0b0c10]/60 p-4 border border-cyber-gray-800 rounded-xl hover:border-cyber-green/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs text-cyber-green font-bold uppercase tracking-widest">Stop {index + 1}</h4>
                        <p className="text-sm font-extrabold text-white mt-0.5">{stop.name}</p>
                        {stop.address && (
                          <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed max-w-xs">{stop.address}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyber-green/10 text-cyber-green text-[10px] font-bold self-start">
                        {stop.outputPower} kW DC
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3.5 text-xs border-t border-cyber-gray-900 pt-3 text-gray-400">
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase">Charging Range</span>
                        <span className="font-semibold text-white mt-0.5 block">
                          {stop.startingChargeAtStop}% → {stop.finalChargeAtStop}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase">Time Duration</span>
                        <span className="font-semibold text-cyber-green mt-0.5 block">
                          {stop.chargeDurationMinutes} mins
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-gray-500 block uppercase">Distance Covered</span>
                        <span className="font-semibold text-white mt-0.5 block">
                          {stop.distanceFromStart} km from start
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="relative">
                <span className="absolute -left-[32px] top-1 w-4 h-4 rounded-full bg-[#0c0d12] border-2 border-cyber-green flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-cyber-green" />
                </span>
                <div className="p-3 bg-cyber-green/5 border border-cyber-green/10 rounded-lg text-xs text-cyber-green font-semibold">
                  No charging stops required for this route! Battery range is sufficient.
                </div>
              </div>
            )}

            {/* Destination Node */}
            <div className="relative">
              <span className="absolute -left-[32px] top-1 w-4 h-4 rounded-full bg-[#0c0d12] border-2 border-cyber-accent flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent" />
              </span>
              <div>
                <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Destination</h4>
                <p className="text-sm font-extrabold text-white mt-0.5">{destination}</p>
                <div className="inline-flex items-center text-xs text-cyber-accent mt-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent mr-1.5" />
                  Arrival Battery Est: {summary.arrivalBattery}%
                </div>
              </div>
            </div>

          </div>

          {/* Bottom summaries grid */}
          <div className="grid grid-cols-4 gap-2 text-center border-t border-cyber-gray-800 pt-5 mt-4">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Distance</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{summary.totalDistance} km</span>
            </div>
            <div className="flex flex-col border-l border-cyber-gray-800">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Total Time</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{summary.duration}</span>
            </div>
            <div className="flex flex-col border-l border-cyber-gray-800">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Stops</span>
              <span className="text-sm font-extrabold text-cyber-green mt-0.5">{summary.stopsCount} Stops</span>
            </div>
            <div className="flex flex-col border-l border-cyber-gray-800">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Carbon Saved</span>
              <span className="text-sm font-extrabold text-cyber-accent mt-0.5">{summary.carbonSavedKg} kg</span>
            </div>
          </div>

          {/* Navigation trigger button */}
          <button 
            onClick={() => setNavStarted(true)}
            className="w-full btn-cyber-primary text-sm font-bold flex items-center justify-center space-x-2 py-3 mt-4"
          >
            <Navigation2 className="w-4 h-4 text-black fill-black rotate-90" />
            <span>Start Navigation</span>
          </button>
        </div>

        {/* Map view section */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Navigation View</span>
            <span className="inline-flex items-center text-xs text-cyber-green font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green mr-1.5 animate-pulse" />
              Interactive Route Simulator
            </span>
          </div>

          <InteractiveMap 
            mode={navStarted ? 'route' : 'browse'} 
            routeData={tripOutput} 
          />
        </div>
      </div>
    </div>
  );
};

export default TripResult;
