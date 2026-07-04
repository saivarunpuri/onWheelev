import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Zap, Clock, Compass, Shield, PlusCircle, Locate } from 'lucide-react';
import axios from 'axios';
import API from '../config';
import InteractiveMap from '../components/InteractiveMap';

const StationsNearby = () => {
  const [allStations, setAllStations] = useState([]);
  const [stations, setStations] = useState([]);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chargerType, setChargerType] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    setUserLocation(null); // Clear geolocation when manual search is typed
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (val.trim().length < 3) {
      setSearchSuggestions([]);
      if (val.trim() === '') setSearchQuery(''); // Clear search query when input is empty
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      try {
        const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || 'n7Ye8EtykeXTqU2wH2WBf7mq3SzwqK9ZProAtSD0';
        const res = await axios.get(`https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(val)}&api_key=${OLA_MAPS_API_KEY}`);
        
        if (res.data && res.data.predictions) {
          const suggestions = res.data.predictions.map(item => ({
            display_name: item.description,
            place_id: item.place_id
          }));
          setSearchSuggestions(suggestions);
        }
      } catch (err) {
        console.warn('Ola Maps autocomplete failed for search.', err);
      }
    }, 400);
  };

  const fetchStations = async () => {
    setLoading(true);
    try {
      const query = [];
      if (searchQuery) query.push(`search=${searchQuery}`);
      if (userLocation) {
        query.push(`lat=${userLocation.lat}`);
        query.push(`lng=${userLocation.lng}`);
      }
      const queryString = query.length > 0 ? `?${query.join('&')}` : '';

      const response = await axios.get(`${API}/api/stations${queryString}`);
      if (response.data.success) {
        const fetched = response.data.stations;
        setAllStations(fetched);
        
        const ports = [...new Set(fetched.map(s => s.chargerType).filter(Boolean))];
        setAvailablePorts(ports);
      }
    } catch (err) {
      console.warn('Backend server offline, seeding high-fidelity mock stations...');
      
      // Fallback local mock stations
      const mockStations = [
        {
          _id: 'st-1',
          name: 'Tata Power EZ Charge',
          address: 'Madhapur Metro Station, Hyderabad',
          lat: 17.4483,
          lng: 78.3904,
          chargerType: 'DC Fast Charger',
          outputPower: 60,
          totalPorts: 4,
          availablePorts: 3,
          pricing: 16,
          operatingHours: '24/7',
          rating: 4.6,
          status: 'Available'
        },
        {
          _id: 'st-2',
          name: 'Statiq Fast Charging Station',
          address: 'Inorbit Mall Parking, Gachibowli, Hyderabad',
          lat: 17.4348,
          lng: 78.3862,
          chargerType: 'CCS2 Fast Charger',
          outputPower: 120,
          totalPorts: 6,
          availablePorts: 2,
          pricing: 18,
          operatingHours: '24/7',
          rating: 4.8,
          status: 'Available'
        },
        {
          _id: 'st-3',
          name: 'Ather Grid',
          address: 'Jubilee Hills Rd 36, Hyderabad',
          lat: 17.4325,
          lng: 78.4069,
          chargerType: 'AC Type 2',
          outputPower: 60,
          totalPorts: 2,
          availablePorts: 2,
          pricing: 12,
          operatingHours: '06:00 - 23:00',
          rating: 4.5,
          status: 'Available'
        },
        {
          _id: 'st-4',
          name: 'ChargeZone',
          address: 'DLF Cyber City, Gachibowli, Hyderabad',
          lat: 17.4442,
          lng: 78.3756,
          chargerType: 'DC Fast Charger',
          outputPower: 120,
          totalPorts: 4,
          availablePorts: 0,
          pricing: 19,
          operatingHours: '24/7',
          rating: 4.3,
          status: 'Busy'
        }
      ];

      // Filtering mocks
      let filtered = mockStations;
      if (searchQuery) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      setAllStations(filtered);
      
      const ports = [...new Set(filtered.map(s => s.chargerType).filter(Boolean))];
      setAvailablePorts(ports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery || userLocation) {
      fetchStations();
    } else {
      setAllStations([]);
      setStations([]);
      setAvailablePorts([]);
      setLoading(false);
    }
  }, [searchQuery, userLocation]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setSearchInput("Current Location");
        setSearchQuery(""); // Clear text search to prefer lat/lng
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsLocating(false);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    let filtered = allStations;
    if (chargerType) {
      filtered = filtered.filter(s => s.chargerType === chargerType);
    }
    setStations(filtered);
    if (filtered.length > 0) {
      setSelectedStation(filtered[0]);
    } else {
      setSelectedStation(null);
    }
  }, [allStations, chargerType]);

  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left bg-cyber-bg">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Find Charging Stations</h1>
        <p className="text-gray-400 text-sm mt-1">Find and filter the best charging companies that provide optimal charging near you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List and Filters */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Search bar & filter selection */}
          <div className="flex space-x-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchInput);
                    setSearchSuggestions([]);
                  }
                }}
                placeholder="Search station location..."
                className="w-full bg-cyber-card border border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none transition"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              
              {searchSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-1 bg-[#121212] border border-cyber-gray-800 rounded-lg shadow-2xl z-[2000] text-xs text-left max-h-48 overflow-y-auto">
                  {searchSuggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSearchInput(item.display_name);
                        setSearchQuery(item.display_name);
                        setSearchSuggestions([]);
                      }}
                      className="px-3 py-2 border-b border-cyber-gray-950 hover:bg-cyber-green/10 hover:text-cyber-green cursor-pointer transition-colors"
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button 
              onClick={handleUseLocation}
              disabled={isLocating}
              className="bg-cyber-card border border-cyber-gray-800 hover:border-cyber-green focus:border-cyber-green text-cyber-green rounded-xl px-3 flex items-center justify-center transition"
              title="Use Current Location"
            >
              <Locate className={`w-4 h-4 ${isLocating ? 'animate-pulse text-white' : ''}`} />
            </button>
            
            <div className="relative">
              <select
                value={chargerType}
                onChange={(e) => setChargerType(e.target.value)}
                className="bg-cyber-card border border-cyber-gray-800 focus:border-cyber-green text-gray-300 rounded-xl py-2.5 pl-3 pr-8 text-xs font-semibold outline-none transition cursor-pointer appearance-none"
              >
                <option value="">All Ports</option>
                {availablePorts.map((port, idx) => (
                  <option key={idx} value={port}>{port}</option>
                ))}
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Result Count Indicator */}
          {!loading && stations.length > 0 && (
            <div className="flex items-center space-x-2 text-xs font-semibold mb-3 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              <span className="text-gray-400">
                Found <span className="text-cyber-green font-bold text-sm">{stations.length}</span> charging {stations.length === 1 ? 'station' : 'stations'}
              </span>
            </div>
          )}

          {/* List items */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin border-2 border-cyber-green border-t-transparent w-8 h-8 rounded-full mx-auto" />
                <p className="text-xs text-gray-500 mt-3">Searching optimal stations...</p>
              </div>
            ) : stations.length > 0 ? (
              stations.map((station) => {
                const isSelected = selectedStation && selectedStation._id === station._id;
                return (
                  <div
                    key={station._id}
                    onClick={() => handleStationSelect(station)}
                    className={`cyber-card-glow text-left p-4 cursor-pointer relative overflow-hidden transition-all duration-300 ${
                      isSelected ? 'border-cyber-green bg-[#121212] shadow-cyber-glow' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-white text-sm sm:text-base">{station.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{station.address}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        station.status === 'Busy' ? 'bg-red-500/10 text-red-400' : 'bg-cyber-green/10 text-cyber-green'
                      }`}>
                        {station.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mt-4 border-t border-cyber-gray-900 pt-3">
                      <span className="flex items-center text-cyber-green">
                        <Zap className="w-3.5 h-3.5 fill-cyber-green mr-1" />
                        {station.chargerType} • {station.outputPower} kW
                      </span>
                      <span>₹{station.pricing}/kWh</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-cyber-card border border-cyber-gray-800 rounded-2xl">
                <Compass className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No charging stations matched your filter</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Interactive Map and Info overlay */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          <InteractiveMap 
            mode="browse" 
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={(pin) => {
              const matched = stations.find(s => s._id === pin.id || s.name === pin.name);
              if (matched) setSelectedStation(matched);
            }} 
          />

          {/* Selected Station Detailed HUD Display */}
          {selectedStation && (
            <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 shadow-xl animate-fade-in text-left">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedStation.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{selectedStation.address}</p>
                </div>
                
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-cyber-green/10 border border-cyber-green/20 rounded-lg text-cyber-green text-xs font-bold">
                  <span>★ {selectedStation.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t border-cyber-gray-800 pt-5 text-xs text-gray-400">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Charger Type</span>
                  <span className="text-sm font-extrabold text-white mt-1">{selectedStation.chargerType}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Output Speed</span>
                  <span className="text-sm font-extrabold text-cyber-green mt-1">{selectedStation.outputPower} kW</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Available Ports</span>
                  <span className="text-sm font-extrabold text-white mt-1">
                    {selectedStation.availablePorts} / {selectedStation.totalPorts || 4} Available
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Cost Estimate</span>
                  <span className="text-sm font-extrabold text-cyber-accent mt-1">₹{selectedStation.pricing} / kWh</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-5 pt-3 border-t border-cyber-gray-900">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>Operating hours: {selectedStation.operatingHours} • High voltage power station network</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationsNearby;
