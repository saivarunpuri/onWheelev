import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Compass, ChevronRight, Zap, History, Calendar, Trash2 } from 'lucide-react';
import axios from 'axios';
import API from '../config';
import toast from 'react-hot-toast';

const SavedTrips = ({ setLastPlannerOutput }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/trips/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setTrips(response.data.trips);
      }
    } catch (err) {
      console.warn('Backend server offline, seeding cache history list...');
      const saved = JSON.parse(localStorage.getItem('saved_trips') || '[]');
      setTrips(saved);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleReviewPlan = (trip) => {
    setLastPlannerOutput({
      source: trip.sourceName,
      destination: trip.destName,
      summary: {
        totalDistance: trip.totalDistance,
        duration: trip.duration,
        vehicleModel: 'Tata Nexon EV Max',
        startBattery: trip.startBattery,
        arrivalBattery: trip.endBattery,
        stopsCount: trip.suggestedStops ? trip.suggestedStops.length : 1,
        carbonSavedKg: (trip.totalDistance * 0.12).toFixed(1)
      },
      suggestedStops: trip.suggestedStops || []
    });
    navigate('/trip-result');
  };

  const handleDeleteTrip = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip history record?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API}/api/trips/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success('Trip history record removed successfully!');
        fetchTrips();
      }
    } catch (err) {
      console.warn('Backend server offline, removing locally...');
      const updated = trips.filter(t => t._id !== id && t.id !== id);
      setTrips(updated);
      const saved = JSON.parse(localStorage.getItem('saved_trips') || '[]');
      const filtered = saved.filter(t => t.id !== id && t._id !== id);
      localStorage.setItem('saved_trips', JSON.stringify(filtered));
      toast.success('Trip removed successfully (Simulated Local Mode).');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left bg-cyber-bg">
      <Link
        to="/dashboard"
        className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-cyber-green uppercase tracking-wider mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Saved Trips</h1>
          <p className="text-gray-400 text-sm mt-0.5">Explore your historical charging calculations and routes.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin border-2 border-cyber-green border-t-transparent w-8 h-8 rounded-full mx-auto" />
          <p className="text-xs text-gray-500 mt-4">Retrieving history logs...</p>
        </div>
      ) : trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => {
            const tripId = trip._id || trip.id;
            return (
              <div
                key={tripId}
                onClick={() => handleReviewPlan(trip)}
                className="bg-cyber-card border border-cyber-gray-800 hover:border-cyber-green/30 p-5 rounded-2xl cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 shadow-md"
              >
                <div className="text-left space-y-2 flex-grow">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <p className="text-base font-extrabold text-white flex items-center">
                      {trip.sourceName.split(',')[0]}
                      <ChevronRight className="w-4 h-4 mx-2 text-cyber-green" />
                      {trip.destName.split(',')[0]}
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1 items-center">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 text-gray-600 mr-1.5" />
                      {new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>Distance: <b className="text-white font-semibold">{trip.totalDistance} km</b></span>
                    <span>Drive Time: <b className="text-white font-semibold">{trip.duration}</b></span>
                    <span>Stops: <b className="text-cyber-green font-semibold">{trip.suggestedStops ? trip.suggestedStops.length : 1} Stops</b></span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end border-t border-cyber-gray-900 pt-3 md:pt-0 md:border-t-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">Battery Est</span>
                    <span className="text-xs font-bold text-cyber-green">
                      {trip.startBattery}% → {trip.endBattery}%
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteTrip(tripId, e)}
                    className="p-2.5 rounded-lg bg-cyber-hover hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-cyber-gray-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-cyber-card border border-cyber-gray-800 rounded-2xl shadow-xl">
          <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h4 className="font-extrabold text-white text-base">No Saved Trips Yet</h4>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
            You haven't saved any planned trips yet. Create your first smart plan and secure it into history!
          </p>
          <Link to="/planner" className="btn-cyber-primary text-xs font-bold py-2.5 px-6 mt-6 inline-block">
            Start Planning Route
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedTrips;
