import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Navigation,
  Compass,
  AlertTriangle,
  Zap,
  Truck,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import API from "../config";

// Polyline decoding utility for Ola Maps Routing API
const decodePolyline = (encoded) => {
  if (!encoded) return [];
  let poly = [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
};

const InteractiveMap = ({
  mode = "browse", // 'browse', 'route', 'emergency', 'tracking'
  routeData = null,
  onSelectStation = null,
  activeProvider = null,
  stations = [],
  selectedStation = null,
  onTrackingComplete = null,
  onTrackingProgress = null,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Layer and reference tracking
  const routeLineRef = useRef(null);
  const carMarkerRef = useRef(null);
  const stationMarkersGroupRef = useRef(null);
  const strandedMarkerRef = useRef(null);
  const rescuerMarkerRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const routePointsRef = useRef([]);

  const [navPlaying, setNavPlaying] = useState(false);
  const [carProgress, setCarProgress] = useState(0); // 0 to 100
  const [rescueProgress, setRescueProgress] = useState(0);
  const [selectedPin, setSelectedPin] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [radarScanning, setRadarScanning] = useState(false);

  // Center coordinate - Madhapur, Hyderabad
  const defaultCenter = [17.4483, 78.3904];

  // Initialize leaf map
  useEffect(() => {
    if (!mapInstanceRef.current && window.L && mapContainerRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(defaultCenter, 13);

      mapInstanceRef.current = map;

      // Render Light map layers
      window.L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | Powered by Ola Maps Routing & Places APIs',
          maxZoom: 20,
        }
      ).addTo(map);

      window.L.control.zoom({ position: "topright" }).addTo(map);

      stationMarkersGroupRef.current = window.L.layerGroup().addTo(map);

      // Listen for pan to reload markers procedurally or from DB!
      map.on("moveend", () => {
        const center = map.getCenter();
        loadChargingStations(center.lat, center.lng);
      });
      // Do NOT load stations immediately on mount to keep the initial state completely empty!
      // loadChargingStations(defaultCenter[0], defaultCenter[1]);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // DivIcons creator
  const createNeonIcon = (color = "#00E576", glyph = "⚡") => {
    return window.L.divIcon({
      html: `<div class="neon-marker" style="border-color: ${color}; box-shadow: 0 0 10px ${color}; background-color: #ffffff; color: ${color}; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 50%; font-size: 12px;">${glyph}</div>`,
      className: "custom-div-icon",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Populate stations near coordinates
  const loadChargingStations = async (lat, lng) => {
    if (!stationMarkersGroupRef.current || !window.L) return;
    stationMarkersGroupRef.current.clearLayers();

    try {
      const res = await axios.get(`${API}/api/stations?lat=${lat}&lng=${lng}`);
      if (res.data.success && res.data.stations.length > 0) {
        plotStations(res.data.stations);
        return;
      }
    } catch (e) {
      console.warn(
        "API Locator offline. Drawing procedural stations nearby...",
      );
    }

    // High fidelity procedurally generated station pins (around panned coordinates) so the map is NEVER empty
    const localGenerated = [
      {
        id: "st-local-1",
        name: "ChargeZone DC Grid",
        lat: lat + 0.004,
        lng: lng - 0.003,
        power: 120,
        status: "Available",
        type: "CCS Type 2",
      },
      {
        id: "st-local-2",
        name: "Tata Power EZ Charger",
        lat: lat - 0.007,
        lng: lng + 0.005,
        power: 60,
        status: "Available",
        type: "DC Fast Port",
      },
      {
        id: "st-local-3",
        name: "Statiq Charging Station",
        lat: lat + 0.008,
        lng: lng + 0.004,
        power: 150,
        status: "Busy",
        type: "CCS2 Fast Charging",
      },
      {
        id: "st-local-4",
        name: "Ather Fast Grid",
        lat: lat - 0.002,
        lng: lng - 0.008,
        power: 60,
        status: "Available",
        type: "AC Type 2",
      },
    ];
    plotStations(localGenerated);
  };

  const plotStations = (stations) => {
    if (!stationMarkersGroupRef.current || !window.L) return;

    stations.forEach((st) => {
      const isBusy = st.status === "Busy";
      const color = isBusy ? "#E53E3E" : "#00E576";
      const icon = createNeonIcon(color, "⚡");

      const marker = window.L.marker([st.lat, st.lng], { icon });
      marker.on("click", () => {
        setSelectedPin({
          name: st.name,
          type: st.type || "High-Voltage Charging Port",
          power: st.outputPower || st.power || 60,
          status: st.status || "Available",
          rating: 4.8,
        });
        if (onSelectStation) {
          onSelectStation(st);
        }
      });
      stationMarkersGroupRef.current.addLayer(marker);
    });
  };

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedStation && mode === "browse") {
      // Timeout ensures flyTo overrides the default fitBounds that runs when stations array updates
      setTimeout(() => {
        map.flyTo([selectedStation.lat, selectedStation.lng], 18, { animate: true, duration: 1.5 });
        setSelectedPin({
          name: selectedStation.name,
          type: selectedStation.type || selectedStation.chargerType || "High-Voltage Charging Port",
          power: selectedStation.outputPower || selectedStation.power || 60,
          status: selectedStation.status || "Available",
          rating: selectedStation.rating || 4.8,
        });
      }, 50);
    }
  }, [selectedStation, mode]);

  // Setup mode adjustments
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    setCarProgress(0);
    setRescueProgress(0);
    setNavPlaying(false);
    setSelectedPin(null);
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    if (carMarkerRef.current) {
      map.removeLayer(carMarkerRef.current);
      carMarkerRef.current = null;
    }
    if (strandedMarkerRef.current) {
      map.removeLayer(strandedMarkerRef.current);
      strandedMarkerRef.current = null;
    }
    if (rescuerMarkerRef.current) {
      map.removeLayer(rescuerMarkerRef.current);
      rescuerMarkerRef.current = null;
    }
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    if (mode === "browse") {
      if (stations && stations.length > 0) {
        // Clear old ones
        if (stationMarkersGroupRef.current) stationMarkersGroupRef.current.clearLayers();
        plotStations(stations);
        
        // Pan map to encompass all provided stations
        const lats = stations.map(s => s.lat).filter(Boolean);
        const lngs = stations.map(s => s.lng).filter(Boolean);
        if (lats.length > 0) {
          const bounds = [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)]
          ];
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
      } else {
        // Do not auto-fetch stations on browse if stations array is empty to honor the initial empty state!
        // map.setView(defaultCenter, 13);
        if (stationMarkersGroupRef.current) stationMarkersGroupRef.current.clearLayers();
      }
    } else if (mode === "route") {
      decodeAndDrawOSRMRoute();
    } else if (mode === "emergency") {
      setRadarScanning(true);
      const emergencyCenter = [17.4432, 78.3815];
      map.setView(emergencyCenter, 14);

      const userIcon = createNeonIcon("#FF3B30", "⚠️");
      strandedMarkerRef.current = window.L.marker(emergencyCenter, {
        icon: userIcon,
      })
        .addTo(map)
        .bindPopup(
          '<b class="text-red-400">Emergency Alert</b><br/><span class="text-xs">Stranded with 15% charge. Radar scanning rescue vans...</span>',
        )
        .openPopup();

      const localProviders = [
        {
          id: "ep-1",
          name: "PlugNGo Mobile Assist",
          lat: 17.452,
          lng: 78.399,
          power: 50,
          type: "Rescue Charger",
          status: "Available",
        },
        {
          id: "ep-2",
          name: "ChargeMate On-site Grid",
          lat: 17.431,
          lng: 78.365,
          power: 60,
          type: "Rescue Tow Van",
          status: "Available",
        },
      ];

      localProviders.forEach((p) => {
        const provIcon = createNeonIcon("#1DE9B6", "🚚");
        const marker = window.L.marker([p.lat, p.lng], { icon: provIcon })
          .addTo(map)
          .on("click", () => {
            setSelectedPin({
              providerName: p.name,
              type: p.type,
              power: p.power,
              status: p.status,
              rating: 4.9,
            });
            if (onSelectStation)
              onSelectStation({
                id: p.id,
                providerName: p.name,
                rating: 4.9,
                pricing: "₹25/kWh",
                type: p.type,
              });
          });
        stationMarkersGroupRef.current.addLayer(marker);
      });

      setTimeout(() => {
        setRadarScanning(false);
      }, 3000);
    } else if (mode === "tracking" && activeProvider) {
      handleRescueVanTracking();
    }
  }, [mode, activeProvider, routeData, stations]);

  // Decode OSRM Highway routing
  const decodeAndDrawOSRMRoute = async () => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    setLoadingRoute(true);

    // Initial default: Hyderabad -> Bengaluru
    let startCoords = [78.4867, 17.385];
    let endCoords = [77.5946, 12.9716];

    // If dynamic coordinates are decoded
    if (routeData && routeData.sourceCoords && routeData.destCoords) {
      startCoords = [routeData.sourceCoords.lng, routeData.sourceCoords.lat];
      endCoords = [routeData.destCoords.lng, routeData.destCoords.lat];
    }

    try {
      const OLA_MAPS_API_KEY =
        import.meta.env.VITE_OLA_MAPS_API_KEY ||
        "n7Ye8EtykeXTqU2wH2WBf7mq3SzwqK9ZProAtSD0";
      const routeUrl = `https://api.olamaps.io/routing/v1/directions?origin=${startCoords[1]},${startCoords[0]}&destination=${endCoords[1]},${endCoords[0]}&api_key=${OLA_MAPS_API_KEY}`;

      // Try POST first for Ola Maps Routing API
      let res;
      try {
        res = await axios.post(
          routeUrl,
          null, // empty body
          {
            headers: {
              "X-Request-Id": `req-${Date.now()}`,
            },
          }
        );
      } catch (postErr) {
        // Fallback to GET if POST fails
        res = await axios.get(routeUrl, {
          headers: {
            "X-Request-Id": `req-${Date.now()}`,
          },
        });
      }

      if (res.data && res.data.routes && res.data.routes.length > 0) {
        // Ola Maps might return overview_polyline or geometry array.
        let coordinates = [];
        if (typeof res.data.routes[0].overview_polyline === "string") {
          coordinates = decodePolyline(res.data.routes[0].overview_polyline);
        } else if (
          res.data.routes[0].geometry &&
          res.data.routes[0].geometry.coordinates
        ) {
          // If it behaves like OSRM GeoJSON somehow
          coordinates = res.data.routes[0].geometry.coordinates.map((c) => [
            c[1],
            c[0],
          ]);
        } else {
          throw new Error("Unknown route format");
        }

        routePointsRef.current = coordinates;

        routeLineRef.current = window.L.polyline(coordinates, {
          color: "#00E576",
          weight: 4,
          opacity: 0.9,
          className: "leaflet-cyber-polyline",
        }).addTo(map);

        map.fitBounds(routeLineRef.current.getBounds(), { padding: [30, 30] });

        const startIcon = createNeonIcon("#00E576", "S");
        const endIcon = createNeonIcon("#1DE9B6", "E");
        window.L.marker(coordinates[0], { icon: startIcon }).addTo(map);
        window.L.marker(coordinates[coordinates.length - 1], {
          icon: endIcon,
        }).addTo(map);

        const carIcon = createNeonIcon("#00E576", "🚗");
        carMarkerRef.current = window.L.marker(coordinates[0], {
          icon: carIcon,
        }).addTo(map);

        // Plot charging stops dynamically along coordinates
        if (routeData && routeData.suggestedStops) {
          routeData.suggestedStops.forEach((stop) => {
            const stopCoords =
              stop.lat && stop.lng
                ? [stop.lat, stop.lng]
                : coordinates[Math.floor(coordinates.length * 0.4)];
            const stopIcon = createNeonIcon("#00E576", "⚡");
            window.L.marker(stopCoords, { icon: stopIcon })
              .addTo(map)
              .bindPopup(
                `<b>${stop.name}</b><br/><span class="text-xs">${stop.chargerType || "Fast Charger"}</span>`,
              );
          });
        }
      }
    } catch (e) {
      console.warn(
        "OSRM routing network timeout, drawing fallback polyline...",
      );
      const fallbackPoints = [
        [17.385, 78.4867], // Hyderabad
        [15.8281, 78.0373], // Kurnool
        [14.6819, 77.6006], // Anantapur
        [12.9716, 77.5946], // Bengaluru
      ];
      routePointsRef.current = fallbackPoints;

      routeLineRef.current = window.L.polyline(fallbackPoints, {
        color: "#00E576",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      map.fitBounds(routeLineRef.current.getBounds());

      const startIcon = createNeonIcon("#00E576", "S");
      const endIcon = createNeonIcon("#1DE9B6", "E");
      window.L.marker(fallbackPoints[0], { icon: startIcon }).addTo(map);
      window.L.marker(fallbackPoints[3], { icon: endIcon }).addTo(map);

      const carIcon = createNeonIcon("#00E576", "🚗");
      carMarkerRef.current = window.L.marker(fallbackPoints[0], {
        icon: carIcon,
      }).addTo(map);

      // Even in fallback, we must plot the suggested charging stops so they are visible!
      if (routeData && routeData.suggestedStops) {
        routeData.suggestedStops.forEach((stop) => {
          const stopCoords =
            stop.lat && stop.lng
              ? [stop.lat, stop.lng]
              : fallbackPoints[1];
          const stopIcon = createNeonIcon("#00E576", "⚡");
          window.L.marker(stopCoords, { icon: stopIcon })
            .addTo(map)
            .bindPopup(
              `<b>${stop.name}</b><br/><span class="text-xs">${stop.chargerType || "Fast Charger"}</span>`,
            );
        });
      }
    } finally {
      setLoadingRoute(false);
    }
  };

  // Simulation play loop
  useEffect(() => {
    let interval = null;
    if (
      navPlaying &&
      mode === "route" &&
      routePointsRef.current.length > 0 &&
      carMarkerRef.current
    ) {
      interval = setInterval(() => {
        setCarProgress((prev) => {
          const next = prev + 0.5;
          if (next >= 100) {
            setNavPlaying(false);
            if (onTrackingComplete) onTrackingComplete();
            return 100;
          }

          const index = Math.min(
            Math.floor((next / 100) * (routePointsRef.current.length - 1)),
            routePointsRef.current.length - 1,
          );
          const currentPoint = routePointsRef.current[index];
          if (currentPoint) {
            carMarkerRef.current.setLatLng(currentPoint);
            mapInstanceRef.current.panTo(currentPoint, { animate: true });
          }

          if (onTrackingProgress) {
            onTrackingProgress(next);
          }

          return next;
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [navPlaying, mode]);

  // Tracking van path updates
  const handleRescueVanTracking = async () => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    const userCenter = [17.4432, 78.3815];
    const vanStart = [17.456, 78.405];

    map.setView(userCenter, 14);

    const userIcon = createNeonIcon("#FF3B30", "⚠️");
    strandedMarkerRef.current = window.L.marker(userCenter, {
      icon: userIcon,
    }).addTo(map);

    const vanIcon = createNeonIcon("#00E576", "🚚");
    rescuerMarkerRef.current = window.L.marker(vanStart, {
      icon: vanIcon,
    }).addTo(map);

    try {
      const OLA_MAPS_API_KEY =
        import.meta.env.VITE_OLA_MAPS_API_KEY ||
        "n7Ye8EtykeXTqU2wH2WBf7mq3SzwqK9ZProAtSD0";
      const routeUrl = `https://api.olamaps.io/routing/v1/directions?origin=${vanStart[0]},${vanStart[1]}&destination=${userCenter[0]},${userCenter[1]}&api_key=${OLA_MAPS_API_KEY}`;

      let res;
      try {
        res = await axios.post(routeUrl);
      } catch (postErr) {
        res = await axios.get(routeUrl);
      }

      if (res.data && res.data.routes && res.data.routes.length > 0) {
        let coordinates = [];
        if (typeof res.data.routes[0].overview_polyline === "string") {
          coordinates = decodePolyline(res.data.routes[0].overview_polyline);
        } else if (
          res.data.routes[0].geometry &&
          res.data.routes[0].geometry.coordinates
        ) {
          coordinates = res.data.routes[0].geometry.coordinates.map((c) => [
            c[1],
            c[0],
          ]);
        } else {
          throw new Error("Unknown route format");
        }

        routeLineRef.current = window.L.polyline(coordinates, {
          color: "#1DE9B6",
          weight: 4.5,
          opacity: 0.85,
          dashArray: "5, 8",
        }).addTo(map);

        let progress = 0;
        trackingIntervalRef.current = setInterval(() => {
          progress += 2;
          setRescueProgress(progress);

          if (progress >= 100) {
            clearInterval(trackingIntervalRef.current);
            if (onTrackingComplete) onTrackingComplete();
            if (onTrackingProgress) onTrackingProgress(100);
            rescuerMarkerRef.current.setLatLng(userCenter);
            rescuerMarkerRef.current
              .bindPopup("<b>Assistance Arrived!</b>")
              .openPopup();
            return;
          }

          if (onTrackingProgress) onTrackingProgress(progress);

          const index = Math.min(
            Math.floor((progress / 100) * (coordinates.length - 1)),
            coordinates.length - 1,
          );
          const currentPoint = coordinates[index];
          if (currentPoint) {
            rescuerMarkerRef.current.setLatLng(currentPoint);
            map.panTo(currentPoint, { animate: true });
          }
        }, 200);
      }
    } catch (e) {
      const fallbackPoints = [vanStart, userCenter];
      let progress = 0;
      trackingIntervalRef.current = setInterval(() => {
        progress += 4;
        setRescueProgress(progress);
        if (progress >= 100) {
          clearInterval(trackingIntervalRef.current);
          if (onTrackingComplete) onTrackingComplete();
          if (onTrackingProgress) onTrackingProgress(100);
          rescuerMarkerRef.current.setLatLng(userCenter);
          return;
        }
        if (onTrackingProgress) onTrackingProgress(progress);
        const nextLat =
          vanStart[0] + (userCenter[0] - vanStart[0]) * (progress / 100);
        const nextLng =
          vanStart[1] + (userCenter[1] - vanStart[1]) * (progress / 100);
        rescuerMarkerRef.current.setLatLng([nextLat, nextLng]);
      }, 200);
    }
  };

  return (
    <div className="relative w-full h-[480px] bg-[#f8f9fa] rounded-xl overflow-hidden border border-gray-300 shadow-xl">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .leaflet-container {
          background-color: #f8f9fa !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background-color: #ffffff !important;
          color: #1a202c !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          font-size: 11px !important;
          padding: 3px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        .leaflet-popup-tip {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-cyber-polyline {
          filter: drop-shadow(0 0 4px #00E576);
        }
        .radar-scanner {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(0,229,118,0.05) 0%, rgba(248,249,250,0.7) 70%);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .radar-beam {
          width: 250px;
          height: 250px;
          border: 2px solid #00E576;
          border-radius: 50%;
          opacity: 0.5;
          animation: radar-ping 2s infinite linear;
          box-shadow: 0 0 15px #00E576;
        }
        @keyframes radar-ping {
          0% { transform: scale(0.3); opacity: 0.9; }
          100% { transform: scale(2); opacity: 0; }
        }
      `,
        }}
      />

      <div ref={mapContainerRef} className="w-full h-full" />

      {radarScanning && (
        <div className="radar-scanner">
          <div className="radar-beam" />
          <div className="absolute font-mono text-[10px] text-cyber-green font-bold uppercase tracking-widest mt-16 bg-white/90 px-2 py-1 border border-cyber-green/30 rounded shadow-md">
            Scanning emergency dispatches...
          </div>
        </div>
      )}
      {loadingRoute && (
        <div className="absolute inset-0 bg-white/80 z-[1000] flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin border-4 border-cyber-green border-t-transparent w-10 h-10 rounded-full" />
          <p className="text-xs text-cyber-green font-mono uppercase tracking-widest animate-pulse">
            Decoding real Ola Maps road coordinates...
          </p>
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-white/90 border border-gray-200 p-2 rounded-lg text-xs text-gray-600 flex items-center space-x-2 backdrop-blur-md z-[1000] shadow-sm">
        <Compass
          className="w-4 h-4 text-cyber-green animate-spin"
          style={{ animationDuration: "10s" }}
        />
        <span className="font-mono tracking-widest text-[9px] uppercase">
          POWERED BY OLA MAPS
        </span>
      </div>

      {mode === "route" &&
        !loadingRoute &&
        routePointsRef.current.length > 0 && (
          <div className="absolute top-4 left-4 bg-white/95 border border-gray-200 p-3.5 rounded-lg flex items-center space-x-3.5 backdrop-blur-md shadow-lg z-[1000]">
            <button
              type="button"
              onClick={() => setNavPlaying(!navPlaying)}
              className="p-2 rounded-full bg-cyber-green text-black hover:bg-cyber-green/80 transition"
            >
              {navPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black" />
              )}
            </button>

            <div className="flex flex-col text-xs pr-2">
              <span className="font-bold text-gray-800 uppercase tracking-wider flex items-center">
                <Navigation className="w-3.5 h-3.5 text-cyber-green mr-1.5 animate-pulse" />
                {navPlaying
                  ? "Simulating Drive..."
                  : carProgress >= 100
                    ? "Trip Completed"
                    : "Navigation Paused"}
              </span>
              <div className="w-36 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-cyber-green transition-all"
                  style={{ width: `${carProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

      {selectedPin && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 border border-cyber-green/40 p-4 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in z-[1000]">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900 text-sm">
              {selectedPin.name || selectedPin.providerName}
            </h4>
            <button
              type="button"
              onClick={() => setSelectedPin(null)}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          <div className="text-xs space-y-2 text-gray-600">
            <p className="flex items-center">
              <Zap className="w-3.5 h-3.5 text-cyber-green mr-1.5" />
              <span>
                {selectedPin.type || "Charging Port"} •{" "}
                {selectedPin.power || 60} kW
              </span>
            </p>
            <p className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${selectedPin.status === "Busy" ? "bg-red-500" : "bg-cyber-green"}`}
              />
              <span className="capitalize">
                {selectedPin.status || "Active Operations"}
              </span>
            </p>
            {selectedPin.rating && (
              <p className="text-cyber-green font-semibold">
                ★ {selectedPin.rating} (Highly Rated)
              </p>
            )}
          </div>
        </div>
      )}

      {mode === "tracking" && activeProvider && (
        <div className="absolute top-4 left-4 bg-white/95 border border-cyber-green p-4 rounded-xl backdrop-blur-md shadow-2xl flex items-center space-x-4 max-w-sm z-[1000]">
          {rescueProgress < 100 ? (
            <>
              <div className="p-3 bg-cyber-green/10 rounded-full animate-pulse border border-cyber-green/20">
                <Truck className="w-6 h-6 text-cyber-green" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-gray-900 text-sm">
                  Rescuer is En Route
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Assisting Unit: {activeProvider.providerName}
                </p>
                <div className="flex space-x-3 text-xs text-cyber-green font-semibold mt-2">
                  <span>
                    ETA:{" "}
                    {Math.max(1, Math.round(15 - (15 * rescueProgress) / 100))}{" "}
                    mins
                  </span>
                  <span>
                    Dist: {(4.2 - (4.2 * rescueProgress) / 100).toFixed(1)} km
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-cyber-green/20 rounded-full border border-cyber-green">
                <CheckCircle2 className="w-6 h-6 text-cyber-green animate-bounce" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-cyber-green text-sm">
                  Rescue Unit Arrived!
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Mobile charging van has reached your location. Starting
                  emergency charge.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
