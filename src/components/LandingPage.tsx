/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Compass, Brain, Database, ShieldCheck, Cpu, Sparkles, Server, Code, LineChart, TrendingUp, Users, ArrowRight, Check, Star, Mail, Map, Smartphone, ShieldAlert, Zap, Globe } from "lucide-react";

interface LandingPageProps {
  onEnterPlatform: () => void;
}

export default function LandingPage({ onEnterPlatform }: LandingPageProps) {
  const [emailInput, setEmailInput] = useState("");
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const testimonials = [
    {
      quote: "InfraSight has transformed how our county dispatches repair crews. We've observed a 34% drop in active pothole durations and saved $1.2M in annual contractor labor.",
      author: "Hon. Sarah Jenkins",
      role: "Director of Public Transit, Central District Authority",
      city: "Oakridge Council"
    },
    {
      quote: "The autonomous UAV YOLOv8 scans locate structural micro-cracks before they turn into base-pavement failures. The predictive CapEx algorithms are stunningly accurate.",
      author: "Dr. Aris Thorne",
      role: "Lead CivEng & Smart City Smart-Grid Architect",
      city: "Metropolis Lab"
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans" id="saas-landing-root">
      {/* SaaS Navigation bar */}
      <header className="sticky top-0 z-50 bg-[#07080a]/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between" id="landing-header">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-zinc-900 border border-zinc-800 text-sky-400 rounded-xl shadow-inner flex items-center justify-center">
            <Compass size={18} className="text-sky-400 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-sans tracking-tight text-white uppercase">InfraSight</span>
              <span className="bg-sky-504/10 border border-sky-500/20 text-[#38bdf8] text-[8px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded font-bold">
                ENTERPRISE SaaS
              </span>
            </div>
            <span className="text-[7.5px] text-zinc-500 font-mono tracking-wider block">Infrastructure Intelligence Node</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium" id="landing-menu">
          <a href="#features" className="hover:text-white transition-colors">Core Engine</a>
          <a href="#impact" className="hover:text-white transition-colors">Business Value</a>
          <a href="#architecture" className="hover:text-white transition-colors">System Topology</a>
          <a href="#contact" className="hover:text-white transition-colors">Enterprise Trial</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            id="landing-cta-top"
            onClick={onEnterPlatform}
            className="bg-sky-500 hover:bg-sky-600 text-zinc-950 font-bold text-xs p-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-sky-500/10"
          >
            <span>Launch Console</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto overflow-hidden text-center sm:text-left" id="saas-hero">
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/25 p-1 px-3 rounded-full text-sky-400 text-[10px] font-mono tracking-wider font-bold">
              <Sparkles size={11} fill="currentColor" />
              <span>YOLOv8 & GEMINI-POWERED CIVIL INFRARED SCANNING</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] font-sans">
              Monitor. Predict.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-sky-400 to-emerald-400">
                Prioritize. Optimize.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              Enterprise-grade infrastructure intelligence platform for municipalities, smart cities, and highway authorities. Automatically analyze pavement decay with deep computer vision telemetry, predict lifespan degradation, and build generative SDE advisory audits.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <button
                id="hero-primary-cta"
                onClick={onEnterPlatform}
                className="w-full sm:w-auto bg-gradient-to-r from-[#38bdf8] to-sky-500 hover:opacity-90 text-zinc-950 font-bold text-xs p-3.5 px-7 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/15"
              >
                <span>ENTER INTERACTIVE CONSOLE</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>
              <a
                href="#architecture"
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs p-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all font-mono"
              >
                <Code size={14} />
                <span>INSPECT API TOPOLOGY</span>
              </a>
            </div>

            {/* Strategic Endorsements */}
            <div className="pt-6 border-t border-zinc-900 grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-zinc-200 font-mono">92.4%</div>
                <div className="text-[9.5px] text-zinc-500 uppercase tracking-wider font-mono mt-0.5">YOLOv8 Object IoU</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-emerald-400 font-mono">-35%</div>
                <div className="text-[9.5px] text-zinc-500 uppercase tracking-wider font-mono mt-0.5">CapEx Materials Cost</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-sky-400 font-mono">1.2s</div>
                <div className="text-[9.5px] text-zinc-500 uppercase tracking-wider font-mono mt-0.5">Real-time GPS Sync</div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Visual Frame */}
          <div className="lg:col-span-5 bg-zinc-950 border border-zinc-850 p-4 rounded-2xl shadow-2xl relative group overflow-hidden" id="saas-mockup-frame">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl" />
            
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-widest">Active UAV Feed Simulator</span>
            </div>

            {/* Visual simulated monitor */}
            <div className="aspect-video bg-zinc-900 rounded-lg relative overflow-hidden border border-zinc-850 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80"
                referrerPolicy="no-referrer"
                placeholder="Platform map preview"
                className="w-full h-full object-cover opacity-80"
                alt="Infrastructure survey visualizer"
              />
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />
              
              {/* Overlay simulation target tags */}
              <div className="absolute top-[35%] left-[25%] border-2 border-red-500 bg-red-950/45 p-1 rounded font-mono text-[8px] text-white select-none">
                <div className="font-bold uppercase tracking-wider">Pothole Severe</div>
                <div>Confidence: 96.2%</div>
              </div>

              <div className="absolute bottom-[20%] right-[30%] border-2 border-amber-500 bg-amber-950/45 p-1 rounded font-mono text-[8px] text-white select-none">
                <div className="font-bold uppercase tracking-wider">Alligator Fissure</div>
                <div>Confidence: 89.4%</div>
              </div>

              {/* Scanning neon line */}
              <div className="absolute inset-x-0 h-0.5 bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] top-1/2 animate-bounce" />
            </div>

            {/* System logs ticker underneath */}
            <div className="mt-4 bg-zinc-950 p-2.5 rounded border border-zinc-900 space-y-1 text-[9.5px] font-mono text-zinc-450 leading-relaxed">
              <div className="flex items-center justify-between text-[#38bdf8]">
                <span>Telemetry: ACTIVE_LOG_LISTENER</span>
                <span className="text-emerald-400">● LIVE RUNTIME</span>
              </div>
              <p className="text-zinc-500">
                [SYSTEM] Connected to YOLO v8 weights. Listening on port 3000. Running edge server processing 4K/60fps UAV raster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="bg-[#0b0c0f] border-y border-zinc-900 py-16 px-6" id="features">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#38bdf8] font-bold">Comprehensive Capabilities Suite</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Built for Next-Gen Smart Cities & SDE Auditors</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Transform road maintenance workflows from manual reactive reporting to pro-active predictive computer vision telemetry and automatic generative dispatches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* GIS Digital Twin */}
            <div className="bg-[#111216] border border-zinc-800 p-5 rounded-xl space-y-4 hover:border-zinc-700 transition-all">
              <div className="p-2 bg-sky-505/10 border border-sky-500/25 text-[#38bdf8] rounded-lg w-fit">
                <Globe size={18} />
              </div>
              <h3 className="font-bold text-zinc-100 text-sm font-mono uppercase tracking-wide">Leaflet GIS Digital Twin</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Real-time interactive geographical map built on CartoDB Dark matter maps. Visualizes road system segments, overlays hazard intensity heatmaps, and tracks specific anomalies with coordinate pins.
              </p>
              <ul className="text-[11px] text-zinc-500 space-y-1.5 font-mono">
                <li className="flex items-center gap-1.5"><Check size={11} className="text-sky-400" /> Standard road status segment overlays</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-sky-400" /> Real severity layers indexing</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-sky-400" /> Interactive popover metadata specs</li>
              </ul>
            </div>

            {/* Drone CV UAV Center */}
            <div className="bg-[#111216] border border-zinc-800 p-5 rounded-xl space-y-4 hover:border-zinc-700 transition-all">
              <div className="p-2 bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg w-fit">
                <Cpu size={18} />
              </div>
              <h3 className="font-bold text-zinc-100 text-sm font-mono uppercase tracking-wide">UAV YOLOv8 AI Scanner</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Simulate interactive YOLOv8 imagery inference. Drag and drop high-resolution pavement orthomosaics to run object detection networks. Identifies potholes, crack segments and ruts.
              </p>
              <ul className="text-[11px] text-zinc-500 space-y-1.5 font-mono">
                <li className="flex items-center gap-1.5"><Check size={11} className="text-red-400" /> Intelligent bounding-boxes labeling</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-red-400" /> Interactive commit to log register</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-red-400" /> Real-time battery & flight corridor specs</li>
              </ul>
            </div>

            {/* Predictive CapEx Engine */}
            <div className="bg-[#111216] border border-zinc-800 p-5 rounded-xl space-y-4 hover:border-zinc-700 transition-all">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg w-fit">
                <TrendingUp size={18} />
              </div>
              <h3 className="font-bold text-zinc-100 text-sm font-mono uppercase tracking-wide">Predictive Cost Planner</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Interact with granular slider controls mapping labor rates and pavement material mixtures. Projects exact budgetary expenditure requirements, environmental emissions and degradation timelines.
              </p>
              <ul className="text-[11px] text-zinc-500 space-y-1.5 font-mono">
                <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> Cost & Materials slider simulator</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> Carbon offsets savings tracking</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> 7d, 30d, 90d distress degradation slopes</li>
              </ul>
            </div>

            {/* GenAI Executive Report */}
            <div className="bg-[#111216] border border-zinc-800 p-5 rounded-xl space-y-4 hover:border-zinc-700 transition-all">
              <div className="p-2 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-lg w-fit">
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-zinc-100 text-sm font-mono uppercase tracking-wide">GenAI Report Auditor</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Leverages advanced `gemini-3.5-flash` model templates. Evaluate aggregate regional budgets, distress classifications and public traffic logs to formulate SDE-grade advisory briefings in real-time.
              </p>
              <ul className="text-[11px] text-zinc-500 space-y-1.5 font-mono">
                <li className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> Structured executive summaries</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> High-impact budget parameters</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> Direct printable official format</li>
              </ul>
            </div>

            {/* Citizen Transparency Portal */}
            <div className="bg-[#111216] border border-zinc-800 p-5 rounded-xl space-y-4 hover:border-zinc-700 transition-all">
              <div className="p-2 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded-lg w-fit">
                <Smartphone size={18} />
              </div>
              <h3 className="font-bold text-zinc-100 text-sm font-mono uppercase tracking-wide">Citizen Verification Portal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Citizen incident lodging hub. Empowers community members to coordinate with municipalities. Supports image loading, geolocation telemetry and tracks ticket dispatches from open to close.
              </p>
              <ul className="text-[11px] text-zinc-500 space-y-1.5 font-mono">
                <li className="flex items-center gap-1.5"><Check size={11} className="text-purple-400" /> AI-powered complaint verification</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-purple-400" /> Dynamic team dispatch generation</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-purple-400" /> Live public status tracing dashboard</li>
              </ul>
            </div>

            {/* Developer Hub SDE Board */}
            <div className="bg-[#111216] border border-zinc-800 p-5 rounded-xl space-y-4 hover:border-zinc-700 transition-all">
              <div className="p-2 bg-zinc-700/10 border border-zinc-705 text-zinc-300 rounded-lg w-fit">
                <Code size={18} />
              </div>
              <h3 className="font-bold text-zinc-100 text-sm font-mono uppercase tracking-wide">Developer DDL & Rest Console</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                SDE board showcasing database tables DDL SQL structures (PostgreSQL schemas), Docker configurations, and dry-run query client panels that trigger mock backend API endpoints.
              </p>
              <ul className="text-[11px] text-zinc-500 space-y-1.5 font-mono">
                <li className="flex items-center gap-1.5"><Check size={11} className="text-zinc-300" /> Relational schema models copyable</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-zinc-300" /> Python FastAPI inference code templates</li>
                <li className="flex items-center gap-1.5"><Check size={11} className="text-zinc-300" /> Real interactive HTTP request launcher</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Architecture & System Topology Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-12" id="saas-architecture-panel">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-4 space-y-5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#38bdf8] font-bold">Rigid SDE Compliance</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Secure System Topology & Architecture
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Our microservice pipeline guarantees millisecond telemetry mapping and strict separation of concerns from field UAV acquisition to downstream ML predictions.
            </p>
            
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 px-1.5 bg-zinc-900 border border-zinc-800 text-[#38bdf8] text-[9.5px] font-mono rounded font-bold">API</div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Express / FastAPI Proxy Gateway</h4>
                  <p className="text-[11px] text-zinc-550">Secured with cookie authorization session gates and high performance rate limit rules.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1 px-1.5 bg-zinc-900 border border-zinc-800 text-[#38bdf8] text-[9.5px] font-mono rounded font-bold">SQL</div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">PostgreSQL Relational DB Schema</h4>
                  <p className="text-[11px] text-zinc-550">Granular cascade indexing across tables mapping GIS segment networks and logged anomalies.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-zinc-950 border border-zinc-850 p-6 rounded-2xl relative overflow-hidden" id="architecture">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 font-mono">
              <span className="text-[9px] text-[#38bdf8] font-bold">MICROSERVICE DATAFLOW PIPELINE</span>
              <span className="text-[8px] text-zinc-500 uppercase">UML System Topology</span>
            </div>

            {/* ASCII flow block */}
            <div className="overflow-x-auto">
              <pre className="text-[10px] text-zinc-400 font-mono leading-relaxed select-all whitespace-pre block bg-zinc-900/60 p-4 rounded-xl border border-zinc-900">
{`   [Drone Fleet UAV] ──────> [Image Acquisition] ──────> [YOLOv8 Edge ML inference]
                                                                │
                                                                ▼
   [Express Node Gateway] <─── [FastAPI REST Proxy] <───── [Damage Classification]
            │
            ├───────────────> [PostgreSQL Relational DB] (Cascade Indexes)
            │
            ├───────────────> [Leaflet GIS Digital Twin] (CartoDB Night Theme)
            ▼
   [Google Gemini 3.5 AI] ──> [Executive Advisory Briefing Markdown Output PDF]`}
              </pre>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-zinc-900 text-center">
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-850">
                <span className="block text-[8px] text-zinc-500 font-mono uppercase font-bold">UAV TELEMETRY</span>
                <span className="text-xs font-bold text-zinc-200 font-mono">Real-time / GPS</span>
              </div>
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-850">
                <span className="block text-[8px] text-zinc-500 font-mono uppercase font-bold">ML INFERENCE</span>
                <span className="text-xs font-bold text-zinc-200 font-mono">YOLOv8 / 92% IoU</span>
              </div>
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-850">
                <span className="block text-[8px] text-zinc-500 font-mono uppercase font-bold">PERSISTENCE</span>
                <span className="text-xs font-bold text-zinc-200 font-mono">Postgre / SQL</span>
              </div>
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-850">
                <span className="block text-[8px] text-zinc-500 font-mono uppercase font-bold">GENERATIVE REPORT</span>
                <span className="text-xs font-bold text-zinc-200 font-mono">Gemini-3.5 API</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Business Value & Social Proof testimonials */}
      <section className="bg-[#0b0c0f] border-t border-zinc-900 py-16 px-6" id="impact">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">Smart City Impact Analysis</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Enterprise Return on Investment (ROI)</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Integrating automated drone scanning and predictive maintenance directly drives municipal budget optimization and protects smart cities from legal liability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl relative flex flex-col justify-between" id={`testimonial-${idx}`}>
                <div className="absolute top-4 right-4 text-sky-505/20 font-serif text-5xl">"</div>
                <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed relative z-10">
                  {test.quote}
                </p>
                <div className="mt-5 pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{test.author}</h4>
                    <p className="text-[10px] text-zinc-550 mt-0.5">{test.role}</p>
                  </div>
                  <span className="text-[9px] font-mono text-[#38bdf8] font-bold uppercase tracking-wider">{test.city}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Value metrics cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-center">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Estimated Air Quality Index</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-405 font-mono mt-1">-14% CO₂</div>
              <p className="text-[9px] text-zinc-500 mt-1 leading-snug">Due to recycled cold asphalt recycling material mix optimization.</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Labor Dispatches Efficiency</span>
              <div className="text-xl sm:text-2xl font-bold text-sky-400 font-mono mt-1">+48% SPEED</div>
              <p className="text-[9px] text-zinc-500 mt-1 leading-snug">Auto-verified tickets routing directly to appropriate asphalt crews.</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Roadways Accident Rate</span>
              <div className="text-xl sm:text-2xl font-bold text-red-400 font-mono mt-1">-32% RISK</div>
              <p className="text-[9px] text-zinc-500 mt-1 leading-snug">Sealing critical distress points within the mandated SLA windows.</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Yearly Tax Savings</span>
              <div className="text-xl sm:text-2xl font-bold text-zinc-150 font-mono mt-1">$4.2 MILLION</div>
              <p className="text-[9px] text-zinc-500 mt-1 leading-snug">Averages saved across standard municipal operations directories.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial Form / Demo request */}
      <section className="py-16 px-6 max-w-lg mx-auto text-center space-y-6" id="contact">
        <span className="p-2 bg-zinc-900 border border-zinc-805 text-sky-405 rounded-xl w-fit mx-auto flex items-center justify-center">
          <Mail size={18} />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">Request Enterprise Demo Account</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Interested in connecting real YOLOv8 cameras, IoT sensors, or multi-district Spanner databases? Submit your professional municipality email below.
          </p>
        </div>

        {demoSubmitted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl space-y-1">
            <h4 className="text-xs font-bold font-mono">DEMO REQUEST RECORDED SECURELY</h4>
            <p className="text-[10px] text-zinc-400">Our smart-city SDE representative will dispatch trial sandbox parameters shortly.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (emailInput.trim()) setDemoSubmitted(true); }}
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <input
              type="email"
              required
              placeholder="e.g. j.doe@council.oakridge.gov"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 p-2.5 text-xs rounded-xl text-zinc-300 focus:outline-none focus:border-sky-505 font-mono"
            />
            <button
              id="submit-demo-form"
              type="submit"
              className="w-full sm:w-auto bg-[#1b43bc] hover:bg-blue-700 text-white font-bold text-xs p-2.5 px-6 rounded-xl shrink-0 cursor-pointer text-center"
            >
              Request Access
            </button>
          </form>
        )}
      </section>

      {/* Big Action Footer banner */}
      <section className="bg-radial-gradient from-sky-500/10 to-transparent py-12 px-6 border-t border-zinc-900 text-center space-y-4">
        <h3 className="text-lg font-bold text-zinc-100 font-sans tracking-wide">READY TO EXPERIENCE INFRASIGHT ANALYTICS?</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Explore complete maps layout, uav simulation weight calculations, predictive ledger costs, and FastAPI terminal queries.
        </p>
        <button
          id="giant-bottom-enter-cta"
          onClick={onEnterPlatform}
          className="bg-sky-500 hover:bg-sky-600 text-zinc-950 font-bold text-xs p-3 px-8 rounded-xl cursor-pointer shadow-lg shadow-sky-500/20 inline-flex items-center gap-2 uppercase tracking-wide font-sans animate-pulse"
        >
          <span>PROCEED TO CONSOLE DASHBOARD</span>
          <ArrowRight size={13} strokeWidth={2.5} />
        </button>
      </section>

      {/* SDE Footer */}
      <footer className="bg-zinc-950/40 p-4 border-t border-zinc-900 text-zinc-650 text-[9px] font-mono text-center">
        InfraSight Operations Co. 2026. Built in standard Express Node.js, React SPA, and Leaflet Maps integrations. Authorized access directory active.
      </footer>
    </div>
  );
}
