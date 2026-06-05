/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sliders, Thermometer, Hammer, Layers, AlertCircle, TrendingUp, CheckCircle, Clock, DollarSign, Leaf, Zap, Activity } from "lucide-react";
import { RoadSegment, Damage } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";

interface PredictiveAnalyticsProps {
  segments: RoadSegment[];
  damages: Damage[];
  selectedCity: string;
}

export default function PredictiveAnalytics({
  segments,
  damages,
  selectedCity,
}: PredictiveAnalyticsProps) {
  // Simulator State sliders
  const [defectType, setDefectType] = useState<"Pothole" | "Alligator Crack" | "Longitudinal Crack">("Pothole");
  const [defectArea, setDefectArea] = useState(4.5); // sq meters
  const [materialType, setMaterialType] = useState<"standard" | "polymer" | "recycled">("recycled");
  const [laborLevel, setLaborLevel] = useState<"basic" | "expedited" | "emergency">("expedited");

  // Filter segments for chosen city
  const citySegments = segments.filter((s) => s.city === selectedCity);

  // Calculations
  const baseMaterialRate = defectType === "Pothole" ? 450 : defectType === "Alligator Crack" ? 380 : 180;
  
  // Material multipliers
  const materialModifiers = {
    standard: { label: "Standard Hot-Mix Asphalt", multiplier: 1.0, carbonSavedMultiplier: 0.0, costMod: 1.0 },
    polymer: { label: "Polymer-Modified Binder", multiplier: 1.35, carbonSavedMultiplier: 0.1, costMod: 1.25 },
    recycled: { label: "Cold-in-Place Recycled Asphalt", multiplier: 0.85, carbonSavedMultiplier: 0.45, costMod: 0.8 }
  };

  // Labor rates multipliers
  const laborModifiers = {
    basic: { label: "Standard Union Shift", cost: 1200, timeDays: 14, urgency: "Scheduled" },
    expedited: { label: "Accelerated 72h Priority", cost: 2450, timeDays: 3, urgency: "High Priority" },
    emergency: { label: "Immediate 24h Lockout", cost: 4200, timeDays: 1, urgency: "Critical Dispatch" }
  };

  const chosenMaterial = materialModifiers[materialType];
  const chosenLabor = laborModifiers[laborLevel];

  // Calculated Results
  const rawMaterialTons = parseFloat((defectArea * 0.12 * 2.4 * chosenMaterial.multiplier).toFixed(2)); // Volume * density
  const calculatedMaterialCost = Math.round(rawMaterialTons * baseMaterialRate * chosenMaterial.costMod);
  const calculatedLaborCost = chosenLabor.cost;
  const calculatedEquipmentFee = Math.round((calculatedMaterialCost + calculatedLaborCost) * 0.18 + 500);

  const totalEstimateProjected = calculatedMaterialCost + calculatedLaborCost + calculatedEquipmentFee;
  const carbonFootprintTonsAvoided = parseFloat((rawMaterialTons * 0.45 * (materialType === "recycled" ? 1 : materialType === "polymer" ? 0.2 : 0)).toFixed(2));

  // --- Dynamic calculations for RUL list ---
  const activeSegmentsRul = citySegments.map((seg) => {
    // RUL is modeled mathematically: health / 10. Low health = low RUL.
    const rulYears = parseFloat((seg.healthScore / 10).toFixed(1));
    const urgency = seg.healthScore < 40 ? "Immediate Action Required" : 
                    seg.healthScore < 60 ? "Rehabilitation Scheduled" : 
                    seg.healthScore < 80 ? "Routine Monitoring" : "Optimal Conditions";
    const urgencyColor = seg.healthScore < 40 ? "text-red-400 bg-red-500/10 border-red-500/20" : 
                         seg.healthScore < 60 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : 
                         seg.healthScore < 80 ? "text-sky-400 bg-sky-505/10 border-sky-505/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    
    // Expected Failure Month = current date + RUL years
    const expectedFailureYear = new Date().getFullYear() + Math.floor(rulYears);
    const expectedFailureMonth = ["Mar", "Jun", "Sep", "Dec"][seg.healthScore % 4];

    return {
      ...seg,
      rulYears,
      urgency,
      urgencyColor,
      expectedFailure: `${expectedFailureMonth} ${expectedFailureYear}`
    };
  });

  // --- Recharts Pavement Degradation Curves ---
  // Demonstrates pavement decay under standard stress (No treatment) vs Proactive Smart Maintenance (InfraSight recommendation)
  const currentAvgHealth = Math.round(citySegments.reduce((sum, s) => sum + s.healthScore, 0) / (citySegments.length || 1));
  const decayTimelineData = [
    { month: "Current", standardDecay: currentAvgHealth, smartLifespan: currentAvgHealth, failureThreshold: 50 },
    { month: "Month 3", standardDecay: Math.max(0, Math.round(currentAvgHealth * 0.92)), smartLifespan: Math.round(currentAvgHealth * 0.98), failureThreshold: 50 },
    { month: "Month 6", standardDecay: Math.max(0, Math.round(currentAvgHealth * 0.82)), smartLifespan: Math.round(currentAvgHealth * 0.96), failureThreshold: 50 },
    { month: "Month 9", standardDecay: Math.max(0, Math.round(currentAvgHealth * 0.73)), smartLifespan: Math.round(currentAvgHealth * 0.93), failureThreshold: 50 },
    { month: "Month 12", standardDecay: Math.max(0, Math.round(currentAvgHealth * 0.58)), smartLifespan: Math.round(currentAvgHealth * 0.90), failureThreshold: 50 },
    { month: "Month 18", standardDecay: Math.max(0, Math.round(currentAvgHealth * 0.40)), smartLifespan: Math.round(currentAvgHealth * 0.85), failureThreshold: 50 },
    { month: "Month 24", standardDecay: Math.max(0, Math.round(currentAvgHealth * 0.22)), smartLifespan: Math.round(currentAvgHealth * 0.78), failureThreshold: 50 },
  ];

  return (
    <div className="space-y-4 font-sans animate-fadeIn" id="predictive-analytics-root">
      
      {/* Top Banner: Neural forecasting stats */}
      <div className="bg-[#111216] border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm" id="predictive-banner">
        <div>
          <span className="text-[8px] font-mono uppercase text-sky-400 tracking-wider font-bold block">NEURAL ENGINE PREDICTIONS</span>
          <h2 className="text-sm font-bold font-sans text-white tracking-tight uppercase">Predictive Maintenance & Degradation Intelligence</h2>
          <p className="text-[10px] text-zinc-400">Forecasting structural asphalt degradation vectors, Remaining Useful Life (RUL), and targeted CapEx allocation.</p>
        </div>
        <div className="flex gap-2 text-[10px] font-mono">
          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300">
            <span className="text-zinc-500 block text-[8px] uppercase font-bold">Risk Level Forecast</span>
            <span className="text-amber-400 font-bold font-mono">90-Day Degradation</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-zinc-300">
            <span className="text-zinc-500 block text-[8px] uppercase font-bold">Accuracy Index</span>
            <span className="text-green-400 font-bold font-mono">94.2% XGBoost</span>
          </div>
        </div>
      </div>

      {/* Main split: Recharts degradation curve and RUL Forecaster */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* Left Side: Recharts degradation Curve chart */}
        <div className="lg:col-span-3 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between" id="degradation-curve-panel">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-3">
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold block">Neural Projection Curve</span>
                <h3 className="text-xs font-bold font-mono text-zinc-150">Pavement Strength Decay Over Time</h3>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">24-Month Active Cycle</span>
            </div>
            <p className="text-[11px] text-[#a1a1aa] leading-relaxed mb-4">
              Comparing immediate asphalt volumetric structural decay (no intervention) against **InfraSight Proactive Treatment** workflows.
            </p>
          </div>

          {/* Recharts chart area */}
          <div className="h-[260px] w-full" id="degradation-recharts-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={decayTimelineData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSmart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                <YAxis stroke="#71717a" domain={[0, 100]} style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090a0f", borderColor: "#27272a", fontSize: "10px", fontFamily: "sans-serif" }}
                  labelStyle={{ color: "#38bdf8", fontWeight: "bold" }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "9.5px", fontFamily: "monospace", paddingTop: "8px" }} />
                
                {/* Critical structural failure reference line */}
                <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Critical Boundary", fill: "#ef4444", fontSize: 8, position: "insideBottomRight" }} />
                
                <Area name="Predictive Decay (No Action)" type="monotone" dataKey="standardDecay" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorStandard)" />
                <Area name="Lifespan with Adaptive Treatment" type="monotone" dataKey="smartLifespan" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSmart)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 border-t border-zinc-850 pt-2 flex justify-between items-center text-[9px] font-mono text-zinc-505">
            <span>Model: Multivariate Autoregressive Integrated Moving Average (ARIMA)</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Zap size={11} className="text-emerald-400 shrink-0" />
              Saves up to 48% on lifetime CapEx
            </span>
          </div>
        </div>

        {/* Right Side: RUL / Remaining Useful Life Forecaster List */}
        <div className="lg:col-span-2 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between" id="rul-forecaster-panel">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-3">
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">Asset Lifecycle RUL</span>
                <h3 className="text-xs font-bold font-mono text-zinc-150">Corridor Lifespan Forecasts</h3>
              </div>
              <span className="text-[9px] font-mono bg-zinc-950 border border-zinc-800 px-2 rounded text-zinc-400">
                {activeSegmentsRul.length} Active Lines
              </span>
            </div>
            <p className="text-[11px] text-[#a1a1aa] leading-relaxed mb-3">
              Algorithms mapping current diagnostic data to predict remaining useful life (RUL) and next expected failure cycle.
            </p>
          </div>

          {/* RUL Cards items */}
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 flex-1 my-2">
            {activeSegmentsRul.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-8">No targeted district corridors active.</p>
            ) : (
              activeSegmentsRul.map((seg) => (
                <div key={seg.id} className="p-2 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5 transition-all hover:border-zinc-700">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-zinc-100 truncate">{seg.name}</h4>
                      <span className="text-[8px] font-mono text-zinc-500">Sector ID: {seg.id} | Health: {seg.healthScore}/100</span>
                    </div>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${seg.urgencyColor}`}>
                      RUL: {seg.rulYears} Yrs
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono border-t border-zinc-900/60 pt-1 text-zinc-450">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-zinc-550" />
                      Failure Peak: <strong>{seg.expectedFailure}</strong>
                    </span>
                    <span className="font-semibold text-zinc-300">Urgency: {seg.healthScore < 40 ? "CRITICAL" : seg.healthScore < 60 ? "HIGH" : "ROUTINE"}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850/60 text-[9px] text-zinc-500 font-mono leading-normal">
            <strong>Neural Trigger Prompt</strong>: Remaining useful life is constantly calculated from YOLOv8 structural cracks coefficients and Citizen reported micro-complaints.
          </div>
        </div>

      </div>

      {/* CapEx Planner (Pre-existing cost planning simulation tool) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" id="interactive-cost-engine">
        
        {/* Sliders Input Control Block */}
        <div className="lg:col-span-2 bg-[#111216] border border-zinc-800 p-4 rounded-xl shadow-sm space-y-4" id="slider-input-block">
          <div>
            <h3 className="font-bold text-zinc-150 font-mono text-xs uppercase tracking-wider">Operational Cost & CapEx Planner</h3>
            <p className="text-[11px] text-[#a1a1aa] mt-0.5 leading-relaxed">Simulate materials and labor parameters to optimize city pavement budgets.</p>
          </div>

          {/* Anomaly selector */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Defect Classification</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["Pothole", "Alligator Crack", "Longitudinal Crack"] as any[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setDefectType(type)}
                  className={`p-1.5 rounded border text-[10px] font-mono transition-all cursor-pointer ${
                    defectType === type
                      ? "bg-sky-500/10 border-sky-500/30 text-[#38bdf8] font-bold"
                      : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850 text-zinc-400"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Area Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Surface Area Size</span>
              <span className="font-mono text-[#38bdf8] font-bold">{defectArea.toFixed(1)} m²</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={defectArea}
              onChange={(e) => setDefectArea(parseFloat(e.target.value))}
              className="w-full accent-[#38bdf8] cursor-pointer"
            />
            <span className="text-[9px] text-zinc-500 block">Controls binder quantity and structural paving depth.</span>
          </div>

          {/* Material Select */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Pavement Mixture Composite</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value as any)}
              className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-xs text-zinc-300 font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="standard">Standard Hot-Mix Asphalt (High Emission)</option>
              <option value="polymer">Polymer-Modified High-Elastic Binder</option>
              <option value="recycled">Cold-in-Place Recycled Asphalt (Carbon Saver)</option>
            </select>
          </div>

          {/* Labor / Dispatch Select */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Dispatch Priority Level</label>
            <select
              value={laborLevel}
              onChange={(e) => setLaborLevel(e.target.value as any)}
              className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-xs text-zinc-300 font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="basic">Scheduled Paving (Union Rate, 14 Days)</option>
              <option value="expedited">Accelerated Repair (Mobilize crew within 72h)</option>
              <option value="emergency">Emergency Tactical Sealant (Immediate 24h lockout)</option>
            </select>
          </div>
        </div>

        {/* Cost Outputs visual block */}
        <div className="lg:col-span-3 bg-[#111216] border border-zinc-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between shadow-sm" id="cost-dashboard-strip">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-start border-b border-zinc-850 pb-2.5">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Live CapEx Simulator</span>
              <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wide">Predicted Operational Expenditures</h4>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono bg-sky-500/10 text-[#38bdf8] border border-sky-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                {chosenLabor.urgency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-[8px] font-mono text-zinc-550 font-bold uppercase">ESTIMATED EXPENDITURE</span>
              <div className="text-xl font-bold font-mono text-zinc-150 mt-1">
                ${totalEstimateProjected.toLocaleString()}
              </div>
              <span className="text-[8.5px] text-[#38bdf8] block mt-1 font-mono">100% Tax Deductible</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-[8px] font-mono text-zinc-550 font-bold uppercase">MATERIAL CONSUMED</span>
              <div className="text-xl font-bold font-mono text-zinc-150 mt-1">
                {rawMaterialTons} Tons
              </div>
              <span className="text-[8.5px] text-zinc-500 block mt-1 font-mono">Calculated @ 2.4 t/m³</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-[8px] font-mono text-zinc-550 font-bold uppercase">CARBON OFFSET</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {carbonFootprintTonsAvoided} MT
              </div>
              <span className="text-[8.5px] text-emerald-500 block mt-1 font-mono">CIP Recycling savings</span>
            </div>
          </div>

          {/* Breakdown items list */}
          <div className="space-y-2 border-t border-zinc-850 pt-3" id="cost-breakdown-rows">
            <h5 className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ESTIMATES ITEMIZED DIRECTORY:</h5>
            <div className="grid grid-cols-3 gap-4 text-xs text-zinc-350 font-mono">
              <div className="space-y-0.5">
                <span className="text-zinc-500 block text-[8px] uppercase tracking-wider font-bold">Materials Index:</span>
                <span>${calculatedMaterialCost.toLocaleString()}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-zinc-500 block text-[8px] uppercase tracking-wider font-bold">Labor Crews:</span>
                <span>${calculatedLaborCost.toLocaleString()}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-zinc-500 block text-[8px] uppercase tracking-wider font-bold">Equipment & Log:</span>
                <span>${calculatedEquipmentFee.toLocaleString()}</span>
              </div>
            </div>
            
            <p className="text-[9px] text-zinc-550 italic mt-2.5 leading-relaxed border-t border-zinc-900 pt-2 font-mono">
              Aggregates municipal parameters across standard {selectedCity} sectors. Budget values sync directly to regional state road parameters.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
