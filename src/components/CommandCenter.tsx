/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { RoadSegment, Damage, MaintenanceTicket, BudgetSnapshot, AuditLog } from "../types";
import { TrendingUp, AlertOctagon, CheckCircle2, ShieldAlert, DollarSign, Activity, Trash2, ArrowUpRight, Award, Compass } from "lucide-react";
import { motion } from "motion/react";

interface CommandCenterProps {
  segments: RoadSegment[];
  damages: Damage[];
  tickets: MaintenanceTicket[];
  budgets: BudgetSnapshot[];
  logs: AuditLog[];
  selectedCity: string;
}

export default function CommandCenter({
  segments,
  damages,
  tickets,
  budgets,
  logs,
  selectedCity,
}: CommandCenterProps) {
  // Filter datasets
  const citySegments = segments.filter((s) => s.city === selectedCity);
  const segmentIds = citySegments.map((s) => s.id);
  const cityDamages = damages.filter((d) => segmentIds.includes(d.segmentId));
  const cityBudget = budgets.find((b) => b.city === selectedCity) || budgets[0];

  // Calculations
  const totalKm = citySegments.reduce((acc, curr) => acc + curr.lengthKm, 0);
  const avgHealth = Math.round(
    citySegments.reduce((acc, curr) => acc + curr.healthScore, 0) / (citySegments.length || 1)
  );

  const criticalSegments = citySegments.filter((s) => s.healthScore < 60);
  const openTicketsCount = tickets.filter(
    (t) => t.status === "Open" && citySegments.some((s) => t.roadName.includes(s.name))
  ).length;

  const totalCostEstimate = cityDamages
    .filter((d) => d.status !== "Repaired")
    .reduce((acc, curr) => acc + curr.repairCost, 0);

  // Carbon Savings Calculation (Feature 27: Carbon savings based on cold recycling)
  const asphaltRecycledTons = Math.round(cityDamages.filter((d) => d.status === "Repaired").length * 8.4);
  const carbonSavingsTons = (asphaltRecycledTons * 0.45).toFixed(1);

  // Severity count
  const severityCount = { Critical: 0, Severe: 0, Moderate: 0, Minor: 0 };
  cityDamages.forEach((d) => {
    if (d.status !== "Repaired") {
      severityCount[d.severity] = (severityCount[d.severity] || 0) + 1;
    }
  });

  return (
    <div className="space-y-4" id="command-center-root">
      
      {/* City Overview Hero Strip */}
      <div className="bg-[#111216] border border-zinc-800 rounded-xl p-4 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md" id="city-overview-hero">
        <div className="absolute top-0 right-0 w-60 h-60 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-0.5 z-10">
          <span className="text-[9px] uppercase tracking-wider text-[#38bdf8] font-mono flex items-center gap-1.5 font-bold">
            <Compass size={11} className="animate-spin text-sky-400" style={{ animationDuration: "12s" }} /> Smart Infrastructure Hub
          </span>
          <h2 className="text-lg font-bold font-sans text-white tracking-tight">{selectedCity}</h2>
          <p className="text-[10.5px] text-zinc-400">
            Automated Drone Surveillance, YOLOv8 Defect Audits, & Predictive Maintenance Prioritization
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg flex items-center gap-2.5 min-w-[130px]">
            <div className="p-1.5 bg-blue-500/10 text-[#38bdf8] rounded-md border border-blue-500/20">
              <Award size={16} />
            </div>
            <div>
              <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">Health Index</div>
              <div className="text-sm font-bold text-zinc-100 font-mono">{avgHealth}/100</div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg flex items-center gap-2.5 min-w-[130px]">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">Monitored Roads</div>
              <div className="text-sm font-bold text-zinc-100 font-mono">{totalKm.toFixed(1)} km</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern High-Impact Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="bento-kpi-grid">
        {/* KPI 1 */}
        <div className="bg-[#111216] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 hover:bg-[#14151b] transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">Defect Registry</span>
            <span className="p-1 px-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded font-mono text-[9px] font-bold">
              +{cityDamages.filter(d => d.status === "Detected").length} New
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-white tracking-tight font-mono">{cityDamages.filter(d => d.status !== "Repaired").length}</div>
            <div className="text-[11px] font-semibold text-zinc-300 mt-0.5">Active Road Anomalies</div>
          </div>
          <div className="flex items-center gap-2 text-[9.5px] text-zinc-500 border-t border-zinc-900 pt-2 mt-1">
            <AlertOctagon size={11} className="text-red-400 shrink-0" />
            <span className="truncate">{severityCount.Critical} Critical | {severityCount.Severe} Severe sites</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#111216] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 hover:bg-[#14151b] transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">Fiscal Overview</span>
            <span className="p-1 px-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-mono text-[9px] font-bold">
              Forecast Ready
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-white tracking-tight font-mono">
              ${totalCostEstimate.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-zinc-300 mt-0.5">Projected Repair Expense</div>
          </div>
          <div className="flex items-center gap-1.5 text-[9.5px] text-zinc-500 border-t border-zinc-900 pt-2 mt-1">
            <DollarSign size={11} className="text-emerald-400 shrink-0" />
            <span className="truncate">CapEx: <span className="text-zinc-300 font-semibold">${(cityBudget.totalAllocated - cityBudget.spent).toLocaleString()} left</span></span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#111216] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 hover:bg-[#14151b] transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">Dispatch Queue</span>
            <span className="p-1 px-1.5 bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] rounded font-mono text-[8px] font-bold">
              {tickets.filter(t => t.status === "In Progress").length} Dispatched
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-white tracking-tight font-mono">{openTicketsCount}</div>
            <div className="text-[11px] font-semibold text-zinc-300 mt-0.5">Open Maintenance Tickets</div>
          </div>
          <div className="flex items-center gap-1.5 text-[9.5px] text-zinc-500 border-t border-zinc-900 pt-2 mt-1">
            <CheckCircle2 size={11} className="text-sky-400 shrink-0" />
            <span className="truncate">{tickets.filter(t => t.status === "Completed").length} defects sealed last 30d</span>
          </div>
        </div>

        {/* KPI 4 - Sustainability Metrics */}
        <div className="bg-[#111216] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 hover:bg-[#14151b] transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">Sustainability Net</span>
            <span className="p-1 px-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded font-mono text-[8px] font-bold">
              Eco Savings
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-white tracking-tight font-mono">{carbonSavingsTons} MT</div>
            <div className="text-[11px] font-semibold text-zinc-300 mt-0.5">Carbon Emissions Avoided</div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 border-t border-zinc-900 pt-1.5 mt-1 bg-emerald-500/5 p-1 rounded border border-emerald-500/10">
            <Activity size={11} className="text-emerald-400 shrink-0" />
            <span className="truncate">Cold-in-Place Recycling Standard</span>
          </div>
        </div>
      </div>

      {/* Main Charts: Anomaly Distribution & Historical Forecasting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="dashboard-charts-row">
        
        {/* Left Column: Anomaly Categories & Critical Sectors */}
        <div className="lg:col-span-1 bg-[#111216] border border-zinc-800/90 p-4 rounded-xl space-y-4 shadow-sm" id="critical-sectors-container">
          <div>
            <h3 className="font-semibold text-zinc-200 text-xs tracking-wider uppercase font-mono">Critical Sector Log</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">High-priority road segments under critical alert</p>
          </div>

          <div className="space-y-2" id="critical-roads-checklist">
            {criticalSegments.length === 0 ? (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-center text-center">
                <div className="py-1">
                  <CheckCircle2 className="text-emerald-400 mx-auto mb-1" size={18} />
                  <p className="text-xs font-semibold text-emerald-400">All Corridors Safe</p>
                  <p className="text-[9px] text-emerald-500/70 mt-0.5 font-mono">Road health indices are all &gt; 60.</p>
                </div>
              </div>
            ) : (
              criticalSegments.map((seg) => (
                <div
                  key={seg.id}
                  className="p-2.5 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 truncate min-w-0">
                    <h5 className="text-xs font-semibold text-zinc-200 truncate">{seg.name}</h5>
                    <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-mono">
                      <span>Daily: {seg.trafficVolumeDaily.toLocaleString()} vehicles</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10.5px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                      Index: {seg.healthScore}
                    </div>
                    <span className="text-[8px] text-red-400/80 font-bold block mt-0.5 uppercase tracking-wider font-mono">
                      Urgent Patrol
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-zinc-800/80 pt-3">
            <h4 className="font-mono text-[9px] uppercase text-zinc-400 tracking-wider mb-2 font-bold">Defect Allocation</h4>
            <div className="space-y-2">
              {[
                { name: "Potholes", value: cityDamages.filter(d => d.type === "Pothole").length, color: "bg-red-400" },
                { name: "Alligator Cracks", value: cityDamages.filter(d => d.type === "Alligator Crack").length, color: "bg-amber-400" },
                { name: "Cracking (L & T)", value: cityDamages.filter(d => d.type === "Longitudinal Crack" || d.type === "Transverse Crack").length, color: "bg-sky-400" },
                { name: "Wear & Rutting", value: cityDamages.filter(d => d.type === "Surface Wear" || d.type === "Rutting").length, color: "bg-zinc-400" },
              ].map((cat, idx) => {
                const total = cityDamages.length || 1;
                const pct = Math.round((cat.value / total) * 100);
                return (
                  <div key={idx} className="space-y-0.5" id={`defect-allocation-${idx}`}>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                        {cat.name}
                      </span>
                      <span className="font-mono text-zinc-300 font-semibold">{cat.value} <span className="text-zinc-500 text-[10px]">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div className={`${cat.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Columns: SVG Curved Trend Vector & System Analytics Logs */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Historical Degradation Curves SVG chart */}
          <div className="bg-[#111216] border border-zinc-800/90 p-4 rounded-xl shadow-xs" id="historical-degradation-chart">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-zinc-250 text-xs tracking-wider uppercase font-mono">Predictive Failure Curves</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Modeling 90-day degradation forecast comparing tactical repair offsets</p>
              </div>
              <div className="flex items-center gap-2.5 text-[8.5px] font-mono shrink-0">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-450 animate-pulse" /> UNTREATED DECAY
                </span>
                <span className="flex items-center gap-1 text-emerald-450 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450" /> MITIGATION
                </span>
              </div>
            </div>

            {/* Custom SVG Curvilinear Area Plot */}
            <div className="h-44 w-full mt-1.5 relative" id="predictions-svg-plot-container">
              <svg viewBox="0 0 500 200" className="w-full h-full">
                {/* Horizontal Guideline Grids */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#1c1d24" strokeWidth="1" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#1c1d24" strokeWidth="1" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#1c1d24" strokeWidth="1" />
                <line x1="40" y1="180" x2="480" y2="180" stroke="#1c1d24" strokeWidth="1.5" />

                {/* Y-Axis Labels */}
                <text x="15" y="34" className="text-[8px] font-mono font-semibold fill-zinc-500">100%</text>
                <text x="15" y="84" className="text-[8px] font-mono font-semibold fill-zinc-500">60%</text>
                <text x="15" y="134" className="text-[8px] font-mono font-semibold fill-zinc-500">30%</text>
                <text x="20" y="184" className="text-[8px] font-mono font-semibold fill-zinc-500">0%</text>

                {/* Plot 1 Point Area: Untreated Decay Curve (Slopes down steeply) */}
                <path
                  d={`M 40 ${160 - avgHealth} Q 150 110, 280 150 T 480 190`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4,2"
                  className="opacity-75"
                />
                
                {/* Plot 2 Area: Planned Mitigation Curve (Stays high, recovers) */}
                <path
                  d={`M 40 ${160 - avgHealth} L 120 ${155 - avgHealth} Q 220 50, 340 ${175 - avgHealth} T 480 32`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />

                {/* Shading fillers */}
                <path
                  d={`M 40 ${160 - avgHealth} L 120 ${155 - avgHealth} Q 220 50, 340 ${175 - avgHealth} T 480 32 L 480 180 L 40 180 Z`}
                  fill="rgba(16, 185, 129, 0.03)"
                  className="pointer-events-none"
                />

                {/* Vertical marker lines */}
                <line x1="150" y1="30" x2="150" y2="180" stroke="#1c1d24" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="300" y1="30" x2="300" y2="180" stroke="#1c1d24" strokeWidth="1" strokeDasharray="3,3" />

                {/* X-Axis labels */}
                <text x="35" y="194" className="text-[8px] font-mono fill-zinc-500">Day 0 (Current)</text>
                <text x="140" y="194" className="text-[8px] font-mono fill-zinc-500">Day 7</text>
                <text x="285" y="194" className="text-[8px] font-mono fill-zinc-500">Day 30</text>
                <text x="430" y="194" className="text-[8px] font-mono fill-zinc-500">Day 90 (Forecast)</text>
              </svg>
            </div>
            
            <div className="bg-zinc-950/80 border border-zinc-900 p-2.5 rounded-lg flex items-center justify-between mt-2.5 text-[10.5px] text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                <span className="p-0.5 px-1 bg-sky-505/10 border border-sky-500/20 text-[#38bdf8] rounded font-mono text-[8px] tracking-wider uppercase">SVM PREDICT</span>
              </span>
              <span>
                Critical Failure Risk minimized by <span className="text-emerald-400 font-bold">78.5%</span> through dynamic prioritized sealing.
              </span>
            </div>
          </div>

          {/* SDE Audit Logger Dashboard list */}
          <div className="bg-[#111216] border border-zinc-800/90 p-4 rounded-xl shadow-xs" id="audit-logs-pinnacle">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-semibold text-zinc-200 text-xs tracking-wider uppercase font-mono block">Platform Audit Logs</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">Live tracking of automated UAV telemetry & ticket dispatch states</span>
              </div>
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded text-[8px] font-mono tracking-wider font-semibold uppercase">
                ACTIVE AUDIT STACK
              </span>
            </div>

            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1" id="audit-logs-scroller">
              {logs.slice(0, 3).map((log, idx) => (
                <div key={log.id || idx} className="p-2 bg-zinc-900/40 hover:bg-zinc-900/70 rounded-lg border border-zinc-800/75 flex items-start justify-between gap-3 transition-all" id={`audit-log-row-${idx}`}>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-300 text-xs truncate max-w-[100px]">{log.user}</span>
                      <span className="text-[7.5px] font-semibold bg-[#224dc4]/10 border border-[#224dc4]/35 text-sky-300 px-1 py-0.5 rounded font-mono">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-450 leading-relaxed truncate">{log.details}</p>
                    <div className="text-[8px] font-mono text-zinc-500">
                      Timestamp: {new Date(log.timestamp).toLocaleTimeString()} | Operator IP: {log.ip}
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-500 font-bold shrink-0">{log.id}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
