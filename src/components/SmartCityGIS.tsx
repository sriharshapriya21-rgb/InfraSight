/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Map, Layers, Target, Compass, Sliders, Shield, AlertTriangle, CheckCircle2, Activity, Zap, Layers3 } from "lucide-react";
import { RoadSegment, Damage, DroneFlight } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SmartCityGISProps {
  segments: RoadSegment[];
  damages: Damage[];
  flights: DroneFlight[];
  selectedCity: string;
  onSelectSegment: (segment: RoadSegment) => void;
}

export default function SmartCityGIS({
  segments,
  damages,
  flights,
  selectedCity,
  onSelectSegment,
}: SmartCityGISProps) {
  const [filterMode, setFilterMode] = useState<"standard" | "heatmap" | "risk" | "drone">("standard");
  const [selectedDamage, setSelectedDamage] = useState<Damage | null>(null);
  const [uavRadarPulse, setUavRadarPulse] = useState(true);
  const [dronePos, setDronePos] = useState({ x: 250, y: 180 });
  const [mapType, setMapType] = useState<"leaflet" | "vector">("leaflet");
  const [searchTerm, setSearchTerm] = useState("");
  const [showWaterMains, setShowWaterMains] = useState(false);
  const [showFiberOptics, setShowFiberOptics] = useState(false);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  // Filter segments/damages based on selected city, search, and health boundaries
  const citySegments = segments.filter(s => {
    if (s.city !== selectedCity) return false;
    if (showCriticalOnly && s.healthScore >= 50) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !s.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  const segmentIds = citySegments.map(s => s.id);
  const cityDamages = damages.filter(d => segmentIds.includes(d.segmentId));

  // Animate mock drone location for vector map mode
  useEffect(() => {
    const interval = setInterval(() => {
      setDronePos(prev => {
        const time = Date.now() * 0.001;
        const radiusX = 60;
        const radiusY = 40;
        const centerX = 320;
        const centerY = 200;
        return {
          x: Math.round(centerX + Math.cos(time * 0.8) * radiusX),
          y: Math.round(centerY + Math.sin(time * 1.2) * radiusY)
        };
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Map coordinate conversion helper (fits custom 600x400 map viewport)
  const getMapCoordinates = (lat: number, lng: number): { x: number; y: number } => {
    let minLat = 40.68, maxLat = 40.75, minLng = -74.05, maxLng = -73.95;
    if (selectedCity.includes("Oakridge")) {
      minLat = 40.83; maxLat = 40.96; minLng = -74.17; maxLng = -74.06;
    } else if (selectedCity.includes("Southshore")) {
      minLat = 33.98; maxLat = 34.04; minLng = -118.53; maxLng = -118.45;
    }

    const rangeLat = maxLat - minLat;
    const rangeLng = maxLng - minLng;

    const normX = (lng - minLng) / rangeLng;
    const normY = (lat - minLat) / rangeLat;

    const x = Math.max(40, Math.min(560, 50 + normX * 500));
    const y = Math.max(40, Math.min(360, 350 - normY * 300));

    return { x: Math.round(x), y: Math.round(y) };
  };

  // Setup Leaflet maps
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current || mapType !== "leaflet") {
      return;
    }

    // Determine Map center coordinates based on district selected
    let center: [number, number] = [40.7128, -74.0060]; // default NYC
    let zoom = 13;
    if (selectedCity.includes("Oakridge")) {
      center = [40.8950, -74.1150];
      zoom = 12;
    } else if (selectedCity.includes("Southshore")) {
      center = [34.0120, -118.4900];
      zoom = 13;
    }

    // Clean up previous map container
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        attributionControl: false
      });

      // CartoDB Dark Matter tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      leafletMapRef.current = map;

      // Draw sub-surface utility grid overlays
      if (showWaterMains) {
        let offset = selectedCity.includes("Southshore") ? -118.4900 : -74.0060;
        let baseLat = selectedCity.includes("Southshore") ? 34.0120 : 40.7128;
        L.polyline([[baseLat - 0.005, offset - 0.005], [baseLat + 0.005, offset + 0.005]], {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.7,
          dashArray: "3,3"
        }).addTo(map).bindTooltip("Municipal Water Main Grid Segment (Subsurface)", { sticky: true });
      }

      if (showFiberOptics) {
        let offset = selectedCity.includes("Southshore") ? -118.4900 : -74.0060;
        let baseLat = selectedCity.includes("Southshore") ? 34.0120 : 40.7128;
        L.polyline([[baseLat + 0.004, offset - 0.006], [baseLat - 0.004, offset + 0.007]], {
          color: "#a855f7",
          weight: 3,
          opacity: 0.7,
          dashArray: "5,5"
        }).addTo(map).bindTooltip("Telecommunications Dark Fiber backbone", { sticky: true });
      }

      // Draw predictive risk zone polygons
      if (filterMode === "risk") {
        let offset = selectedCity.includes("Southshore") ? -118.4900 : -74.0060;
        let baseLat = selectedCity.includes("Southshore") ? 34.0120 : 40.7128;
        L.polygon([[baseLat - 0.002, offset - 0.002], [baseLat + 0.005, offset - 0.001], [baseLat + 0.002, offset + 0.003]], {
          color: "#f97316",
          fillColor: "#f97316",
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: "6,6"
        }).addTo(map).bindTooltip("Critical Road Risk Sector Map Overlay", { sticky: true });
      }

      // Draw segments
      citySegments.forEach((seg) => {
        if (!seg.coords || seg.coords.length < 2) return;

        // Custom road styling according to overall metrics (health and risk overrides)
        let color = "#10b981"; // Healthy (Green)
        if (seg.healthScore < 40) color = "#ef4444"; // Critical (Red)
        else if (seg.healthScore < 60) color = "#f97316"; // Severe (Orange)
        else if (seg.healthScore < 80) color = "#eab308"; // Moderate (Yellow)

        // Overlay specific settings
        if (filterMode === "risk") {
          if (seg.riskCategory === "Critical") color = "#ef4444";
          else if (seg.riskCategory === "High") color = "#f97316";
          else if (seg.riskCategory === "Moderate") color = "#eab308";
          else color = "#10b981";
        }

        const polyline = L.polyline(seg.coords, {
          color: color,
          weight: filterMode === "risk" ? 7 : 4,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(map);

        polyline.on("click", () => {
          onSelectSegment(seg);
          setSelectedDamage(null);
        });

        polyline.bindTooltip(`
          <div style="font-family: monospace; font-size: 11px; background-color: #0c0d10; border: 1px solid #27272a; color: #f4f4f5; padding: 4px; border-radius: 4px;">
            <strong style="color: #38bdf8;">${seg.name}</strong><br/>
            Health Level: <span style="font-weight: bold; color: ${color};">${seg.healthScore}/100</span><br/>
            SLA Priority: <strong>${seg.riskCategory}</strong>
          </div>
        `, { sticky: true, opacity: 0.9 });
      });

      // Draw anomaly markers
      if (filterMode !== "drone") {
        cityDamages.forEach((dmg) => {
          let markerColor = "#eab308"; // Yellow (Moderate)
          if (dmg.severity === "Critical" || dmg.severity === "Severe") {
            markerColor = "#ef4444"; // Red
          } else if (dmg.status === "Repaired") {
            markerColor = "#10b981"; // Green
          }

          const radius = selectedDamage?.id === dmg.id ? 9 : 6;
          const marker = L.circleMarker([dmg.latitude, dmg.longitude], {
            radius: radius,
            fillColor: markerColor,
            color: "#ffffff",
            weight: selectedDamage?.id === dmg.id ? 2 : 1,
            opacity: 1,
            fillOpacity: 0.90
          }).addTo(map);

          marker.on("click", () => {
            setSelectedDamage(dmg);
          });

          marker.bindTooltip(`
            <div style="font-family: monospace; font-size: 10px; color: #fff; padding: 2px;">
              <strong>${dmg.type}</strong> (${dmg.severity})
            </div>
          `);
        });
      }

      // Draw heatmaps
      if (filterMode === "heatmap") {
        cityDamages.forEach((dmg) => {
          const intensityRadius = dmg.severity === "Critical" ? 140 : dmg.severity === "Severe" ? 90 : 50;
          L.circle([dmg.latitude, dmg.longitude], {
            radius: intensityRadius,
            fillColor: "#ef4444",
            fillOpacity: 0.16,
            stroke: false
          }).addTo(map);
        });
      }

      // Live UAV position
      if (filterMode === "drone" && flights.length > 0) {
        const scannerDrone = flights.find(f => f.status === "Scanning") || flights[0];
        const baseCoords = citySegments[0]?.coords[0] || [40.7128, -74.0060];
        
        // Drone indicator
        const droneIconMarker = L.circleMarker([baseCoords[0] + 0.003, baseCoords[1] + 0.005], {
          radius: 8,
          fillColor: "#10b981",
          color: "#fff",
          weight: 2,
          fillOpacity: 1
        }).addTo(map);

        droneIconMarker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; background-color: #0c0d10; border: 1px solid #27272a; color: #f4f4f5; padding: 4px; border-radius: 4px;">
            <strong style="color: #10b981;">${scannerDrone.droneName}</strong><br/>
            Battery: ${scannerDrone.battery}%<br/>
            Current Alt: ${scannerDrone.altitudeM}m<br/>
            Status: ${scannerDrone.status}
          </div>
        `).openPopup();
      }

    } catch (err) {
      console.error("Leaflet logic crashed, falling back to SVG vector:", err);
      setMapType("vector");
    }

  }, [selectedCity, filterMode, citySegments, cityDamages, flights, mapType, selectedDamage, showWaterMains, showFiberOptics, showCriticalOnly]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" id="smart-city-gis-root">
      
      {/* GIS Sidebar Filter Controls */}
      <div className="lg:col-span-1 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between" id="gis-sidebar">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 px-1.5 bg-zinc-900 border border-zinc-805 text-sky-450 rounded font-mono text-[9px] font-bold">
              <Layers size={13} className="text-sky-400" />
            </span>
            <h3 className="font-semibold text-zinc-150 text-xs tracking-wider uppercase font-mono">Spatial Layers</h3>
          </div>

          {/* Quick search input */}
          <div className="mb-3 space-y-1">
            <label className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">Search District Roads</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Broadway, Avenue-C..."
              className="w-full bg-zinc-950 border border-zinc-800 text-[10.5px] p-1.5 text-zinc-200 rounded focus:outline-none focus:border-zinc-705"
            />
          </div>

          <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">
            Toggle thematic telemetry layers to map drone pathways, defect matrices, or segment risks.
          </p>

          <div className="space-y-2">
            <button
              id="set-filter-standard"
              onClick={() => { setFilterMode("standard"); setSelectedDamage(null); }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                filterMode === "standard"
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-305 font-semibold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Compass size={14} className={filterMode === "standard" ? "text-sky-400" : "text-zinc-500"} />
                <span className="text-xs">Road Network Layer</span>
              </div>
              <span className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1 rounded font-mono font-bold">
                Active
              </span>
            </button>

            <button
              id="set-filter-heatmap"
              onClick={() => { setFilterMode("heatmap"); setSelectedDamage(null); }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                filterMode === "heatmap"
                  ? "bg-red-500/10 border-red-500/30 text-red-400 font-semibold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Target size={14} className={filterMode === "heatmap" ? "text-red-400" : "text-zinc-500"} />
                <span className="text-xs">Damage Intensity Pulse</span>
              </div>
              <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 px-1 rounded font-mono font-bold animate-pulse">
                Heatmaps
              </span>
            </button>

            <button
              id="set-filter-risk"
              onClick={() => { setFilterMode("risk"); setSelectedDamage(null); }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                filterMode === "risk"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={14} className={filterMode === "risk" ? "text-amber-400" : "text-zinc-500"} />
                <span className="text-xs">Predictive Risk Index</span>
              </div>
              <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1 rounded font-mono font-bold">
                ML Model
              </span>
            </button>

            <button
              id="set-filter-drone"
              onClick={() => { setFilterMode("drone"); setSelectedDamage(null); }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                filterMode === "drone"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap size={14} className={filterMode === "drone" ? "text-emerald-400" : "text-zinc-500"} />
                <span className="text-xs">UAV Flight Corridors</span>
              </div>
              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-405 px-1 rounded font-mono font-bold animate-pulse">
                UAV Live
              </span>
            </button>
          </div>
        </div>

        {/* Legend & Infrastructure Controls */}
        <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2.5">
          <div className="space-y-1.5 font-sans">
            <h4 className="text-[8px] font-mono tracking-wider text-zinc-550 uppercase font-bold">Infrastructure Overlays</h4>
            
            <label className="flex items-center gap-2 text-[10.5px] text-zinc-350 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={showCriticalOnly}
                onChange={(e) => setShowCriticalOnly(e.target.checked)}
                className="rounded bg-zinc-950 border-zinc-805 accent-[#ef4444]"
              />
              <span>Critical Defect Areas Only</span>
            </label>

            <label className="flex items-center gap-2 text-[10.5px] text-zinc-350 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={showWaterMains}
                onChange={(e) => setShowWaterMains(e.target.checked)}
                className="rounded bg-zinc-950 border-zinc-805 accent-[#3b82f6]"
              />
              <span>Water Mains Grid Layer (Mock)</span>
            </label>

            <label className="flex items-center gap-2 text-[10.5px] text-zinc-350 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={showFiberOptics}
                onChange={(e) => setShowFiberOptics(e.target.checked)}
                className="rounded bg-zinc-950 border-zinc-805 accent-[#a855f7]"
              />
              <span>Fiber Network Backbones (Mock)</span>
            </label>
          </div>

          <div className="space-y-1.5 border-t border-zinc-900 pt-2">
            <h4 className="text-[8px] font-mono tracking-wider text-zinc-550 uppercase font-bold">Interactive Layers Key</h4>
            <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span>Critical Distress Pin (Red)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Moderate Severity Site (Yellow)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Repaired Infrastructure (Green)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map View Container */}
      <div className="lg:col-span-3 bg-[#111216] border border-zinc-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between shadow-lg h-[460px]" id="vector-map-view">
        {/* Header telemetry and toggle */}
        <div className="flex items-center justify-between z-10 mb-2">
          <div className="bg-zinc-900 border border-zinc-c80 px-3 py-1.5 rounded-lg flex items-center gap-2.5 shadow-sm">
            <Activity className="text-emerald-400 animate-pulse" size={13} />
            <span className="text-zinc-350 text-[10.5px] font-mono">
              GPS Lock: <span className="text-zinc-200 font-semibold">{citySegments[0]?.coords[0] ? `${citySegments[0].coords[0][0].toFixed(4)}, ${citySegments[0].coords[0][1].toFixed(4)}` : "Locating"}</span>
            </span>
          </div>

          {/* Interactive display mode toggle switcher card */}
          <div className="bg-zinc-950 p-1 rounded-lg border border-zinc-800 flex items-center gap-1 font-mono text-[9px] font-bold text-zinc-400">
            <button
              id="toggle-map-leaflet"
              onClick={() => setMapType("leaflet")}
              className={`p-1 px-2.5 rounded-md cursor-pointer transition-all ${mapType === "leaflet" ? "bg-zinc-800 text-white font-bold" : "hover:text-zinc-200"}`}
            >
              Interactive GIS Map
            </button>
            <button
              id="toggle-map-vector"
              onClick={() => setMapType("vector")}
              className={`p-1 px-2.5 rounded-md cursor-pointer transition-all ${mapType === "vector" ? "bg-zinc-800 text-white font-bold" : "hover:text-zinc-200"}`}
            >
              Radar Vector Map
            </button>
          </div>
        </div>

        {/* Map Stage Block */}
        <div className="w-full flex-1 relative flex items-center justify-center my-1 select-none" id="map-stage">
          {mapType === "leaflet" ? (
            <div ref={mapContainerRef} className="w-full h-full min-h-[310px] rounded-lg bg-zinc-950 overflow-hidden border border-zinc-850" id="leaflet-map-element" />
          ) : (
            <svg
              viewBox="0 0 600 400"
              className="w-full h-full max-h-[310px]"
              style={{ filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.4))" }}
            >
              {/* Draw The Road Networks */}
              {citySegments.map((seg) => {
                const mappedPoints = seg.coords.map(co => getMapCoordinates(co[0], co[1]));
                if (mappedPoints.length < 2) return null;

                let d = `M ${mappedPoints[0].x} ${mappedPoints[0].y}`;
                for (let i = 1; i < mappedPoints.length; i++) {
                  d += ` L ${mappedPoints[i].x} ${mappedPoints[i].y}`;
                }

                let strokeColor = "rgba(100, 116, 139, 0.4)";
                let strokeWidth = "5";

                if (filterMode === "risk") {
                  if (seg.riskCategory === "Critical") strokeColor = "rgba(239, 68, 68, 0.85)";
                  else if (seg.riskCategory === "High") strokeColor = "rgba(245, 158, 11, 0.85)";
                  else if (seg.riskCategory === "Moderate") strokeColor = "rgba(234, 179, 8, 0.75)";
                  else strokeColor = "rgba(16, 185, 129, 0.75)";
                  strokeWidth = "8";
                } else if (filterMode === "heatmap") {
                  strokeColor = seg.healthScore < 60 ? "rgba(239, 68, 68, 0.2)" : "rgba(71, 85, 105, 0.2)";
                  strokeWidth = "12";
                } else if (filterMode === "drone") {
                  strokeColor = "rgba(16, 185, 129, 0.15)";
                  strokeWidth = "6";
                }

                return (
                  <g key={seg.id} className="cursor-pointer group">
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="20"
                      onClick={() => { onSelectSegment(seg); setSelectedDamage(null); }}
                    />
                    <path
                      id={`svg-road-${seg.id}`}
                      d={d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                      onClick={() => { onSelectSegment(seg); setSelectedDamage(null); }}
                    />
                    {filterMode === "risk" && (
                      <path
                        d={d}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeDasharray="4,6"
                        className="opacity-50 pointer-events-none"
                      />
                    )}
                    {filterMode === "standard" && (
                      <path
                        d={d}
                        fill="none"
                        stroke={seg.healthScore < 50 ? "#ef4444" : seg.healthScore < 75 ? "#f59e0b" : "#3b82f6"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="group-hover:stroke-white transition-colors duration-200"
                        onClick={() => { onSelectSegment(seg); setSelectedDamage(null); }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Heatmap Overlay Areas */}
              {filterMode === "heatmap" && cityDamages.map((dmg, idx) => {
                const pos = getMapCoordinates(dmg.latitude, dmg.longitude);
                const radius = dmg.severity === "Critical" ? 38 : dmg.severity === "Severe" ? 28 : 18;
                const color = dmg.severity === "Critical" || dmg.severity === "Severe" ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.25)";

                return (
                  <g key={`heat-${dmg.id}-${idx}`}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={color}
                      className="animate-pulse"
                      style={{ filter: "blur(4px)" }}
                    />
                  </g>
                );
              })}

              {/* Drone path */}
              {filterMode === "drone" && flights.filter(f => f.status === "Scanning").map((flg) => {
                const startCoords = citySegments[0]?.coords[0] || [40.71, -74.00];
                const mapCoordsStart = getMapCoordinates(startCoords[0], startCoords[1]);
                return (
                  <g key={`flightpath-${flg.id}`}>
                    <line
                      x1={mapCoordsStart.x}
                      y1={mapCoordsStart.y}
                      x2={dronePos.x}
                      y2={dronePos.y}
                      stroke="rgba(16, 185, 129, 0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                    />
                    <circle
                      cx={dronePos.x}
                      cy={dronePos.y}
                      r="40"
                      fill="none"
                      stroke="rgba(16, 185, 129, 0.3)"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                    <circle
                      cx={dronePos.x}
                      cy={dronePos.y}
                      r="5"
                      fill="#10b981"
                    />
                  </g>
                );
              })}

              {/* Damage Locations pins */}
              {filterMode !== "drone" && cityDamages.map((dmg) => {
                const pos = getMapCoordinates(dmg.latitude, dmg.longitude);
                const isSelected = selectedDamage?.id === dmg.id;

                let pinBg = "fill-amber-500 stroke-amber-100";
                if (dmg.severity === "Critical" || dmg.severity === "Severe") {
                  pinBg = "fill-red-500 stroke-red-200";
                } else if (dmg.status === "Repaired") {
                  pinBg = "fill-emerald-500 stroke-emerald-200";
                }

                return (
                  <g
                    key={dmg.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedDamage(dmg)}
                  >
                    {(dmg.severity === "Critical" || isSelected) && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? "14" : "10"}
                        fill="none"
                        stroke={dmg.severity === "Critical" ? "#ef4444" : "#f59e0b"}
                        strokeWidth="2"
                        className="animate-ping"
                        style={{ transformOrigin: `${pos.x}px ${pos.y}px`, animationDuration: "1.8s" }}
                      />
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? "7" : "5.5"}
                      className={`${pinBg} stroke-[2] shadow-md hover:scale-125 transition-all`}
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Interactive popover pop-up cards */}
          <AnimatePresence>
            {selectedDamage && (
              <motion.div
                id="damage-coordinate-popup"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-4 left-4 right-4 bg-zinc-950/95 backdrop-blur-md border border-zinc-805 p-3 rounded-lg shadow-xl flex gap-3 items-center z-20"
              >
                {selectedDamage.imageUrl ? (
                  <img
                    src={selectedDamage.imageUrl}
                    referrerPolicy="no-referrer"
                    alt="Defect"
                    className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-zinc-900 flex flex-col items-center justify-center border border-zinc-800 text-zinc-550 shrink-0">
                    <AlertTriangle size={18} />
                    <span className="text-[7px] font-mono mt-0.5">YOLOv8</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wide bg-red-500/10 text-red-400 border border-red-500/20`}>
                      {selectedDamage.severity}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      CONFIDENCE: <span className="text-zinc-200 font-bold">{selectedDamage.severityScore}%</span>
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-100 text-xs mt-1 truncate">
                    {selectedDamage.type} - {selectedDamage.roadName}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 text-[10px] text-zinc-400 mt-0.5">
                    <div className="font-mono">GPS: {selectedDamage.latitude.toFixed(5)}, {selectedDamage.longitude.toFixed(5)}</div>
                    <div className="text-right">Projected CapEx: <span className="text-emerald-400 font-mono font-bold">${selectedDamage.repairCost.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <div className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-center uppercase tracking-wide bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {selectedDamage.status}
                  </div>
                  <button
                    id="close-damage-popup"
                    onClick={() => setSelectedDamage(null)}
                    className="text-zinc-400 hover:text-white px-2 py-1 bg-zinc-900 hover:bg-zinc-855 rounded border border-zinc-800 text-[9px] font-semibold cursor-pointer"
                  >
                    Hide Overlay
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info lock with coordinates description */}
        <div className="border-t border-zinc-800 pt-2 flex items-center justify-between text-[9px] text-zinc-500 z-10 font-mono" id="gis-footer">
          <div className="flex items-center gap-1">
            <Compass size={11} className="text-zinc-500 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Map coordinates status: EPSG 3857 (WGS 84 / Web Mercator)</span>
          </div>
          <div>
            <span>Raster caching layer: </span>
            <span className="text-zinc-300">CartoDB Dark Tile layers active</span>
          </div>
        </div>

      </div>

    </div>
  );
}
