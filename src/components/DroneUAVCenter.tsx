/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, Camera, Compass, RefreshCw, Cpu, CheckCircle2, ChevronRight, Play, Battery, Radio, AlertTriangle, ShieldAlert, Sparkles, Clock, Coins, FileText, Activity } from "lucide-react";
import { RoadSegment, Damage, DroneFlight } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DroneUAVCenterProps {
  segments: RoadSegment[];
  flights: DroneFlight[];
  selectedCity: string;
  onNewDamageDetected: (dmg: Damage) => void;
  userRole: string;
}

// Preset Drone Inspection Targets for YOLOv8
const PRESET_UAV_ROAD_SAMPLES = [
  {
    id: "sample-1",
    title: "Avenue-C Sector 2 Junction",
    image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
    description: "Low altitude high-res UAV capture showing critical surface stripping and pothole formations.",
    segmentId: "seg-102",
    latitude: 40.733,
    longitude: -73.967,
    expectedAnomalies: [
      { type: "Pothole", severity: "Critical", confidence: 96.2, x: 35, y: 40, w: 22, h: 22, severityScore: 92, repairCost: 4500 },
      { type: "Alligator Crack", severity: "Severe", confidence: 89.4, x: 15, y: 55, w: 30, h: 28, severityScore: 84, repairCost: 15200 }
    ]
  },
  {
    id: "sample-2",
    title: "Broadway Boulevard Lane 3",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    description: "High-angle orthomosaic scan indicating extensive longitudinal joint distress and cracks.",
    segmentId: "seg-101",
    latitude: 40.716,
    longitude: -74.003,
    expectedAnomalies: [
      { type: "Longitudinal Crack", severity: "Moderate", confidence: 94.1, x: 45, y: 20, w: 10, h: 55, severityScore: 58, repairCost: 2100 }
    ]
  },
  {
    id: "sample-3",
    title: "Oakridge Mountain Segment 43",
    image: "https://images.unsplash.com/photo-1621460248083-bf019864fe06?auto=format&fit=crop&w=800&q=80",
    description: "Autonomous drone telemetry survey of heavy truck corridor, pointing out premature alligator cracking.",
    segmentId: "seg-202",
    latitude: 40.934,
    longitude: -74.075,
    expectedAnomalies: [
      { type: "Alligator Crack", severity: "Critical", confidence: 97.4, x: 25, y: 35, w: 45, h: 30, severityScore: 94, repairCost: 22000 },
      { type: "Rutting", severity: "Severe", confidence: 91.2, x: 10, y: 70, w: 75, h: 15, severityScore: 88, repairCost: 18500 }
    ]
  }
];

// Presets for Gemini Multimodal Vision AI
const PRESET_GEMINI_SAMPLES = [
  {
    id: "gemini-road-1",
    title: "Highway Surface Deep Fault",
    image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
    category: "Pavement",
    description: "Severe urban asphalt damage featuring composite subgrade fatigue and gravel pitting."
  },
  {
    id: "gemini-bridge-2",
    title: "Structural Span Support Abutment",
    image: "https://images.unsplash.com/photo-1545459720-aac273a27791?auto=format&fit=crop&w=800&q=80",
    category: "Bridge",
    description: "Substructural concrete joint showing potential load shear deformation and weather cracks."
  },
  {
    id: "gemini-drainage-3",
    title: "Inlet Storm Water Catch Basin",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    category: "Drainage",
    description: "Aqueous surface interface suffering from severe environmental debris clogging."
  }
];

export default function DroneUAVCenter({
  segments,
  flights,
  selectedCity,
  onNewDamageDetected,
  userRole
}: DroneUAVCenterProps) {
  // Navigation between scanning models
  const [activeSubTab, setActiveSubTab] = useState<"yolo" | "gemini">("yolo");

  // === YOLOv8 States ===
  const [selectedSample, setSelectedSample] = useState(PRESET_UAV_ROAD_SAMPLES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // === Gemini Vision AI States ===
  const [geminiCategory, setGeminiCategory] = useState<"Pavement" | "Bridge" | "Drainage">("Pavement");
  const [selectedGeminiSample, setSelectedGeminiSample] = useState(PRESET_GEMINI_SAMPLES[0]);
  const [uploadedGeminiImage, setUploadedGeminiImage] = useState<string | null>(null);
  const [geminiScanning, setGeminiScanning] = useState(false);
  const [geminiResult, setGeminiResult] = useState<any | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [isCommitted, setIsCommitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const geminiFileInputRef = useRef<HTMLInputElement>(null);

  // Filter segments for chosen city
  const citySegments = segments.filter(s => s.city === selectedCity);

  // Handle preset sample selection for YOLO
  const handleSelectSample = (sample: typeof PRESET_UAV_ROAD_SAMPLES[0]) => {
    setSelectedSample(sample);
    setUploadedImage(null);
    setScanCompleted(false);
    setScanProgress(0);
    setDetections([]);
  };

  // Run the YOLOv8 AI inference simulator
  const handleTriggerInference = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanCompleted(false);
    setScanProgress(0);
    setDetections([]);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanCompleted(true);
          
          if (uploadedImage) {
            setDetections([
              {
                type: "Pothole",
                severity: "Critical",
                confidence: 94.6,
                x: 30,
                y: 35,
                w: 25,
                h: 22,
                severityScore: 89,
                repairCost: 3800,
                segmentId: citySegments[0]?.id || "seg-102"
              }
            ]);
          } else {
            setDetections(selectedSample.expectedAnomalies);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Commit dynamic AI detection to persistent backend
  const handleCommitDetection = (det: any) => {
    const activeSegId = uploadedImage ? (citySegments[0]?.id || "seg-102") : selectedSample.segmentId;
    const targetSegment = segments.find(s => s.id === activeSegId);

    const dmgData: Damage = {
      id: `dmg-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      segmentId: activeSegId,
      roadName: targetSegment?.name || "Broadway Boulevard Corridor",
      type: det.type,
      severity: det.severity,
      confidence: det.confidence,
      latitude: uploadedImage ? 40.718 : selectedSample.latitude + (Math.random() * 0.002 - 0.001),
      longitude: uploadedImage ? -74.001 : selectedSample.longitude + (Math.random() * 0.002 - 0.001),
      areaSqM: parseFloat((Math.random() * 14 + 1.5).toFixed(1)),
      severityScore: det.severityScore || Math.floor(Math.random() * 30 + 65),
      repairCost: det.repairCost || Math.floor(Math.random() * 15000 + 1500),
      laborCost: Math.floor((det.repairCost || 4000) * 0.45),
      materialCost: Math.floor((det.repairCost || 4000) * 0.40),
      detectedAt: new Date().toISOString(),
      status: "Detected",
      imageUrl: uploadedImage || selectedSample.image
    };

    onNewDamageDetected(dmgData);
    setDetections(prev => prev.filter(d => d.type !== det.type));
  };

  // Convert files to base64 helper
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Run Advanced Gemini Vision AI Multimodal Scan
  const handleTriggerGeminiVision = async () => {
    setGeminiScanning(true);
    setGeminiResult(null);
    setGeminiError(null);
    setIsCommitted(false);

    try {
      let imageBase64 = "";
      const currentImage = uploadedGeminiImage || selectedGeminiSample.image;

      if (uploadedGeminiImage) {
        imageBase64 = uploadedGeminiImage;
      } else {
        // Fetch static placeholder / preset and make base64
        const response = await fetch(currentImage);
        const blob = await response.blob();
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch("/api/gemini/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64,
          imageName: selectedGeminiSample.title,
          category: geminiCategory
        })
      });

      if (!res.ok) {
        throw new Error("HTTP connection failure against Gemini AI server wrapper.");
      }

      const json = await res.json();
      if (json.success && json.data) {
        setGeminiResult(json.data);
      } else {
        throw new Error(json.error || "Unexpected response structure from Gemini API.");
      }
    } catch (err: any) {
      console.error(err);
      setGeminiError(err.message || "Unknown error parsing vision arrays.");
    } finally {
      setGeminiScanning(false);
    }
  };

  // Save the Gemini recommended results directly to municipal logs
  const handleCommitGeminiToDatabase = () => {
    if (!geminiResult || isCommitted) return;
    
    // Choose a random segment
    const activeSegId = citySegments[0]?.id || "seg-102";
    const targetSegment = segments.find(s => s.id === activeSegId);

    // Commit each returned issue as a Damage model
    geminiResult.issues.forEach((issue: any, index: number) => {
      const repairCostMultiplier = issue.severity === "Critical" ? 18000 : issue.severity === "Severe" ? 8500 : 3500;
      const dmgData: Damage = {
        id: `dmg-gemini-${Date.now()}-${index}`,
        segmentId: activeSegId,
        roadName: targetSegment?.name || "District Core Lane",
        type: issue.type === "Crack" ? "Alligator Crack" : issue.type === "Pothole" ? "Pothole" : "Surface Wear",
        severity: issue.severity,
        confidence: 96.5,
        latitude: targetSegment?.coords?.[0]?.[0] || 40.7128 + (Math.random() * 0.005 - 0.0025),
        longitude: targetSegment?.coords?.[0]?.[1] || -74.0060 + (Math.random() * 0.005 - 0.0025),
        areaSqM: parseFloat((Math.random() * 8 + 2.5).toFixed(1)),
        severityScore: geminiResult.severityScore,
        repairCost: Math.floor(repairCostMultiplier * (0.8 + Math.random() * 0.4)),
        laborCost: Math.floor(repairCostMultiplier * 0.45),
        materialCost: Math.floor(repairCostMultiplier * 0.40),
        detectedAt: new Date().toISOString(),
        status: "Detected",
        imageUrl: uploadedGeminiImage || selectedGeminiSample.image
      };
      onNewDamageDetected(dmgData);
    });

    setIsCommitted(true);
  };

  // Drag handlers for standard YOLO
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setScanCompleted(false);
        setDetections([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setScanCompleted(false);
        setDetections([]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle files for Gemini upload
  const handleGeminiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await getBase64(file);
      setUploadedGeminiImage(base64);
      setGeminiResult(null);
      setGeminiError(null);
    }
  };

  return (
    <div className="space-y-4 font-sans" id="drone-uav-center-root">
      
      {/* Upper Grid: Drone Fleet Overview Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="drone-telemetry-block">
        <div className="lg:col-span-1 bg-[#111216] border border-zinc-800 rounded-xl p-3.5 shadow-sm" id="drone-telemetry-header">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 px-1.5 bg-zinc-900 border border-zinc-805 text-emerald-400 rounded font-mono text-[9px] font-bold">
              <Radio size={13} className="animate-pulse" />
            </span>
            <h3 className="font-semibold text-zinc-150 text-xs uppercase tracking-wider font-mono">UAV Signal Command</h3>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal mb-3">
            Continuous dual-band RF telemetry from autonomous drone reconnaissance squads.
          </p>

          <div className="space-y-2">
            {flights.map((flight) => (
              <div key={flight.id} className="p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 rounded-lg flex items-center justify-between transition-colors">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    {flight.droneName}
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      flight.status === "Scanning" ? "bg-emerald-500 animate-pulse" :
                      flight.status === "Returning" ? "bg-amber-400" : "bg-zinc-600"
                    }`} />
                  </h4>
                  <div className="text-[9px] font-mono text-zinc-500">
                    Route: {flight.flightRouteName || "Standby Line"}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-400 justify-end font-semibold">
                    <Battery size={11} className={flight.battery < 20 ? "text-red-400" : "text-emerald-400"} />
                    <span>{flight.battery}%</span>
                  </div>
                  <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                    flight.status === "Scanning" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    flight.status === "Charging" ? "bg-sky-505/10 text-sky-450 border border-sky-400/20" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {flight.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Feeds */}
        <div className="lg:col-span-2 bg-[#111216] border border-zinc-800 rounded-xl p-3.5 shadow-md grid grid-cols-2 md:grid-cols-4 gap-3.5" id="fleet-diagnostics">
          <div className="bg-zinc-950/40 border border-zinc-850/60 p-3 rounded-lg space-y-1">
            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Fleet Coverage</span>
            <div className="text-base font-bold text-zinc-200 font-mono">184,200 m²</div>
            <p className="text-[8px] text-emerald-400 font-mono font-bold">100% Survey Complete</p>
          </div>
          <div className="bg-zinc-950/40 border border-zinc-850/60 p-3 rounded-lg space-y-1">
            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Camera Resolution</span>
            <div className="text-base font-bold text-zinc-200 font-mono">4K / 60 FPS</div>
            <p className="text-[8px] text-zinc-400 font-mono">Orthomosaic Mapping</p>
          </div>
          <div className="bg-zinc-950/40 border border-zinc-850/60 p-3 rounded-lg space-y-1">
            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Ambient Temp</span>
            <div className="text-base font-bold text-zinc-200 font-mono">32.4°C</div>
            <p className="text-[8px] text-emerald-400 font-mono font-bold">Optimal Cool Rate</p>
          </div>
          <div className="bg-zinc-950/40 border border-zinc-850/60 p-3 rounded-lg space-y-1">
            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Inference Engines</span>
            <div className="text-base font-bold text-[#38bdf8] font-mono">YOLOv8 & Gemini</div>
            <p className="text-[8px] text-[#38bdf8] font-mono font-bold">Sub-grade AI Enabled</p>
          </div>
        </div>
      </div>

      {/* Selector Sub-Tabs for Scanning Methods */}
      <div className="flex border-b border-zinc-800 pb-px gap-2" id="scanning-modes-navigation">
        <button
          onClick={() => setActiveSubTab("yolo")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeSubTab === "yolo" ? "border-red-500 text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-350"
          }`}
        >
          YOLOv8 Edge Scan (Core Computer Vision)
        </button>
        <button
          onClick={() => setActiveSubTab("gemini")}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "gemini" ? "border-[#38bdf8] text-[#38bdf8]" : "border-transparent text-zinc-500 hover:text-zinc-355"
          }`}
        >
          <Sparkles size={12} className="fill-[#38bdf8] shrink-0" />
          Advanced Gemini Vision AI (Multimodal Auditor)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "yolo" ? (
          <motion.div
            key="yolo-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-4"
          >
            {/* YOLOv8 Scanning Stage Left */}
            <div className="xl:col-span-2 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between" id="scan-canvas-container">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold font-sans text-zinc-150 text-xs tracking-wider uppercase font-mono">YOLOv8 Inference Monitor</h3>
                  <p className="text-[10px] text-zinc-500">Local Tensor Processing Unit Edge Model Segmentation</p>
                </div>
                {uploadedImage && (
                  <button
                    onClick={() => { setUploadedImage(null); setScanCompleted(false); setDetections([]); }}
                    className="text-[10px] text-red-400 hover:bg-red-500/10 p-1 px-2.5 border border-red-500/20 rounded cursor-pointer transition-all font-mono"
                  >
                    Clear Upload
                  </button>
                )}
              </div>

              {/* Viewport viewport */}
              <div className="relative aspect-video w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850 flex items-center justify-center">
                {uploadedImage || selectedSample ? (
                  <div className="relative w-full h-full">
                    <img
                      src={uploadedImage || selectedSample.image}
                      referrerPolicy="no-referrer"
                      alt="UAV Scan"
                      className="w-full h-full object-cover select-none"
                    />

                    <div className="absolute inset-0 border border-red-500/10 pointer-events-none grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-white/5" />
                      <div className="border-r border-b border-white/5" />
                      <div className="border-b border-white/5" />
                      <div className="border-r border-b border-white/5" />
                      <div className="border-r border-b border-white/5" />
                      <div className="border-b border-white/5" />
                    </div>

                    {scanCompleted && detections.map((det, idx) => (
                      <motion.div
                        key={`det-${idx}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute border-[2px] rounded select-none"
                        style={{
                          left: `${det.x}%`,
                          top: `${det.y}%`,
                          width: `${det.w}%`,
                          height: `${det.h}%`,
                          borderColor: det.severity === "Critical" ? "#ef4444" : det.severity === "Severe" ? "#f97316" : "#eab308",
                          backgroundColor: det.severity === "Critical" ? "rgba(239, 68, 68, 0.15)" : "rgba(249, 115, 22, 0.12)"
                        }}
                      >
                        <div className="absolute -top-[21px] left-[-2px] bg-zinc-950 border text-[8px] font-mono text-white p-0.5 px-1.5 rounded-t font-bold flex items-center gap-1"
                             style={{
                               borderColor: det.severity === "Critical" ? "#ef4444" : det.severity === "Severe" ? "#f97316" : "#eab308"
                             }}>
                          <span>{det.type}</span>
                          <span>{(det.confidence).toFixed(1)}%</span>
                        </div>
                      </motion.div>
                    ))}

                    {isScanning && (
                      <motion.div
                        initial={{ y: "0%" }}
                        animate={{ y: "100%" }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] pointer-events-none z-10"
                      />
                    )}

                    {isScanning && (
                      <div className="absolute inset-0 bg-zinc-950/65 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                        <Cpu className="text-white animate-spin mb-2" size={24} />
                        <span className="text-[10px] font-mono text-white font-bold tracking-wider">WEIGHT INTELLIGENCE ACTIVATED</span>
                        <span className="text-[9px] font-mono text-zinc-300 mt-0.5">YOLOv8 Edge Inference: {scanProgress}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-center">
                    <Camera size={38} className="mx-auto mb-2 text-zinc-600" />
                    <span className="text-xs">No media loaded</span>
                  </div>
                )}
              </div>

              {/* YOLO GPS block */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80 pt-3">
                <div>
                  <span className="text-[8px] font-mono text-zinc-500 font-bold block uppercase">TARGET DEPLOYMENT FLIGHT GEO</span>
                  {uploadedImage ? (
                    <div className="text-[11px] font-semibold text-zinc-350">
                      User Upload Orthomosaic (Auto-mapped District bounds)
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-zinc-300 flex items-center gap-1 font-mono">
                      <Compass size={12} className="text-emerald-400" />
                      {selectedSample.title} | {selectedSample.latitude.toFixed(4)}, {selectedSample.longitude.toFixed(4)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isScanning}
                    onClick={handleTriggerInference}
                    className="w-full sm:w-auto bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-200 font-bold text-[11px] p-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all font-mono font-bold"
                  >
                    <Cpu size={14} className="text-red-400 shrink-0" />
                    <span>Run YOLOv8 Model Weights</span>
                  </button>
                </div>
              </div>
            </div>

            {/* YOLOv8 Sidebar Controls Right */}
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer p-4 rounded-lg border border-dashed text-center flex flex-col justify-center transition-all ${
                  dragActive ? "border-[#38bdf8] bg-sky-505/10" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="mx-auto text-zinc-500 mb-1.5" size={20} />
                <h4 className="text-[11.5px] font-bold text-zinc-200">Orthomosaic Pavement Drag-and-Drop</h4>
                <p className="text-[9px] text-zinc-500 mt-1 max-w-[200px] mx-auto leading-normal">
                  Loads raw drone sector capture files into the YOLO pipeline.
                </p>
              </div>

              {/* Sample Presets selector */}
              <div className="bg-[#111216] border border-zinc-800 p-3.5 rounded-xl shadow-sm" id="presets-selector">
                <h4 className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 mb-2 font-bold">Telemetry Targets</h4>
                <div className="space-y-1.5">
                  {PRESET_UAV_ROAD_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        selectedSample.id === sample.id && !uploadedImage
                          ? "border-emerald-500/30 bg-emerald-505/10 text-emerald-400"
                          : "border-zinc-850 hover:bg-zinc-900/60 text-zinc-400"
                      }`}
                    >
                      <img src={sample.image} alt={sample.title} className="w-10 h-10 rounded object-cover shrink-0" />
                      <div className="min-w-0 flex-1 font-sans">
                        <h5 className="text-[11px] font-bold truncate leading-snug">{sample.title}</h5>
                        <p className="text-[9px] text-zinc-500 truncate mt-0.5 font-mono">{sample.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* YOLO Commit queue */}
              <div className="bg-[#111216] border border-zinc-800 p-3.5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-semibold text-zinc-200 text-xs tracking-wider uppercase font-mono">YOLOv8 Detection Queue</h3>
                  <span className="text-[8.5px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-450 px-1.5 py-0.5 rounded font-bold uppercase">
                    {detections.length} Issues
                  </span>
                </div>

                <div className="space-y-2.5">
                  {detections.length === 0 ? (
                    <div className="p-4 text-center text-zinc-500 border border-zinc-800/60 rounded-xl bg-zinc-950/20">
                      <CheckCircle2 size={18} className="mx-auto mb-1 text-zinc-600" />
                      <p className="text-[11px] font-bold text-zinc-400">Scan Complete & Synced</p>
                      <p className="text-[9px] text-zinc-600 mt-0.5 font-mono">Telemetry sector matches model predictions.</p>
                    </div>
                  ) : (
                    detections.map((det, index) => (
                      <div key={index} className="p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-850 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              det.severity === "Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              det.severity === "Severe" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-sky-505/10 text-sky-450 border border-sky-500/20"
                            }`}>
                              {det.severity}
                            </span>
                            <h4 className="font-bold text-zinc-100 text-xs mt-1.5">{det.type}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[7.5px] font-mono text-zinc-550 block font-bold">ACCURACY</span>
                            <span className="font-bold font-mono text-xs text-zinc-300">{det.confidence}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-2 text-[9.5px] text-zinc-400">
                          <div>
                            <span className="text-zinc-500 font-semibold font-mono text-[8px] uppercase">Commute Speed:</span>
                            <p className="font-bold text-zinc-300 font-sans mt-0.5">Delay risk (+12m)</p>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-semibold font-mono text-[8px] uppercase">CIP recycling:</span>
                            <p className="font-bold text-emerald-400 font-sans mt-0.5">-3.4 Tons carbon</p>
                          </div>
                        </div>

                        <div className="border-t border-zinc-900 pt-2">
                          {userRole === "Viewer" ? (
                            <p className="text-[9px] text-amber-500 italic font-mono text-center">Viewer lacks write access.</p>
                          ) : (
                            <button
                              onClick={() => handleCommitDetection(det)}
                              className="w-full bg-[#1b43bc] hover:bg-blue-700 text-white font-bold text-[10px] p-1.5 rounded flex items-center justify-center gap-1 cursor-pointer transition-all"
                            >
                              <span>Register defect in system database</span>
                              <ChevronRight size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="gemini-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-4"
          >
            {/* Gemini Vision Large Interactive Screen Left */}
            <div className="xl:col-span-2 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono uppercase bg-sky-505/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2 py-0.5 rounded font-bold">
                    Multi-Modal Audit Engine
                  </span>
                  <h3 className="font-semibold text-zinc-150 text-xs uppercase tracking-wider font-mono">Gemini Vision Diagnostic Hub</h3>
                  <p className="text-[9.5px] text-zinc-500">Autonomous identification and structural recommendations generator using Gemini-3.5 multimodal models.</p>
                </div>
                {uploadedGeminiImage && (
                  <button
                    onClick={() => { setUploadedGeminiImage(null); setGeminiResult(null); setGeminiError(null); }}
                    className="text-[10px] text-red-400 hover:bg-red-500/10 p-1 px-2.5 border border-red-550/20 rounded cursor-pointer transition-all font-mono font-bold"
                  >
                    Clear Media
                  </button>
                )}
              </div>

              {/* Large Image display screen */}
              <div className="relative aspect-video w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850 flex items-center justify-center">
                {uploadedGeminiImage || selectedGeminiSample ? (
                  <div className="relative w-full h-full">
                    <img
                      src={uploadedGeminiImage || selectedGeminiSample.image}
                      referrerPolicy="no-referrer"
                      alt="Gemini Vision Cargo"
                      className="w-full h-full object-cover select-none"
                    />

                    {/* Animated diagnostic scanning radar overlay */}
                    {geminiScanning ? (
                      <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                          className="w-14 h-14 border-4 border-dashed border-t-[#38bdf8] border-r-transparent border-[#38bdf8]/10 rounded-full flex items-center justify-center mb-3"
                        >
                          <Sparkles className="text-[#38bdf8] animate-pulse" size={18} />
                        </motion.div>
                        <span className="text-[11px] font-mono text-zinc-100 font-bold tracking-wider">CONSTRUCTING PROMPT TENSOR BLOCKS</span>
                        <span className="text-[9px] font-mono text-zinc-400 mt-1 max-w-sm text-center leading-normal animate-pulse">
                          Sending image base64 directly to `gemini-3.5-flash` for multi-layered structural anomaly evaluation...
                        </span>
                      </div>
                    ) : geminiResult ? (
                      /* Highlight overlay when scan matches */
                      <div className="absolute inset-0 bg-zinc-950/20 pointer-events-none flex flex-col justify-end p-4">
                        <div className="bg-zinc-950/90 border border-[#38bdf8]/30 p-2.5 rounded-lg max-w-sm backdrop-blur-md text-[10px]">
                          <span className="text-[#38bdf8] font-bold font-mono tracking-widest block uppercase text-[8px] mb-1">
                            📷 Telemetry Visual Confirmed
                          </span>
                          <p className="text-zinc-205 leading-relaxed font-sans">{geminiResult.analysisReport.substring(0, 150)}...</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-center">
                    <Camera size={38} className="mx-auto mb-2 text-zinc-600 animate-pulse" />
                    <span className="text-xs">No media loaded. Select an asset sample below or upload JPEG.</span>
                  </div>
                )}
              </div>

              {/* Launch scan action bar */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80 pt-3">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono text-zinc-500 font-bold block uppercase">Select Structural Context</span>
                  <div className="flex items-center gap-1.5">
                    {(["Pavement", "Bridge", "Drainage"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setGeminiCategory(cat)}
                        className={`px-2.5 py-1 text-[9.5px] font-bold font-mono rounded border transition-colors cursor-pointer ${
                          geminiCategory === cat
                            ? "bg-[#38bdf8]/10 border-[#38bdf8]/40 text-[#38bdf8]"
                            : "bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-400"
                        }`}
                      >
                        {cat} Spec
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={geminiScanning}
                  onClick={handleTriggerGeminiVision}
                  className="w-full sm:w-auto bg-[#1b43bc] hover:bg-blue-700 text-white font-bold text-[11px] p-2 px-5 rounded-lg flex items-center justify-center gap-2 cursor-pointer font-sans shadow transition-all disabled:opacity-50"
                >
                  {geminiScanning ? (
                    <RefreshCw className="animate-spin text-white" size={13} />
                  ) : (
                    <Sparkles size={13} className="text-[#38bdf8] fill-[#38bdf8]" />
                  )}
                  <span>{geminiScanning ? "Gemini analyzing..." : "Launch Gemini Multimodal Analysis"}</span>
                </button>
              </div>
            </div>

            {/* Gemini Vision Right Side: Upload controls or active diagnostic results */}
            <div className="space-y-4" id="gemini-vision-sidebar">
              
              {/* Image Upload Zone */}
              {!geminiResult && (
                <div
                  onClick={() => geminiFileInputRef.current?.click()}
                  className="cursor-pointer p-4 rounded-lg border border-dashed text-center flex flex-col justify-center transition-all bg-zinc-950/20 border-zinc-800 hover:border-zinc-700 h-[105px]"
                >
                  <input
                    type="file"
                    ref={geminiFileInputRef}
                    onChange={handleGeminiFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="mx-auto text-zinc-500 mb-1" size={18} />
                  <h4 className="text-[11px] font-bold text-zinc-200">Custom JPEG/PNG Pavement Upload</h4>
                  <p className="text-[8.5px] text-zinc-500 leading-snug mt-1">
                    Upload live sector photos to execute the Gemini auditor pipeline.
                  </p>
                </div>
              )}

              {/* Preset Sample Selector if no results showing */}
              {!geminiResult && (
                <div className="bg-[#111216] border border-zinc-800 p-3.5 rounded-xl shadow-sm">
                  <h4 className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 mb-2 font-bold-bold">Asset Target Catalog</h4>
                  <div className="space-y-1.5">
                    {PRESET_GEMINI_SAMPLES.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => { setSelectedGeminiSample(sample); setUploadedGeminiImage(null); }}
                        className={`w-full flex items-center gap-2.5 p-1.5 rounded border text-left transition-all cursor-pointer ${
                          selectedGeminiSample.id === sample.id && !uploadedGeminiImage
                            ? "border-[#38bdf8]/40 bg-[#38bdf8]/10 text-[#38bdf8]"
                            : "border-zinc-850 hover:bg-zinc-900/60 text-zinc-400"
                        }`}
                      >
                        <img src={sample.image} alt={sample.title} className="w-9 h-9 rounded object-cover shrink-0" />
                        <div className="min-w-0 flex-1 font-sans">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-bold truncate leading-snug">{sample.title}</h5>
                            <span className="text-[7px] font-mono text-zinc-500 uppercase font-semibold">{sample.category}</span>
                          </div>
                          <p className="text-[8.5px] text-zinc-500 truncate mt-0.5">{sample.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gemini Returned Results Panels (If available) */}
              {geminiResult && (
                <div className="bg-[#111216] border border-zinc-800 p-4 rounded-xl shadow-md space-y-4 font-sans animate-fadeIn">
                  
                  {/* Headline & Actions */}
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase tracking-widest font-mono text-emerald-400 font-bold block">
                        Audit Report Concluded
                      </span>
                      <h4 className="text-xs font-bold text-zinc-150 font-mono">RECOMMENDATION DECK</h4>
                    </div>
                    <button
                      onClick={() => { setGeminiResult(null); }}
                      className="text-[9px] font-mono border border-zinc-800 hover:bg-zinc-850 px-2 py-0.5 text-zinc-450 rounded font-bold cursor-pointer"
                    >
                      RESET SCAN
                    </button>
                  </div>

                  {/* Recommendation Grid dials */}
                  <div className="grid grid-cols-2 gap-2.5 text-[10px] font-mono">
                    <div className="bg-zinc-950 p-2 border border-zinc-850 rounded-lg">
                      <span className="text-[7.5px] tracking-wider text-zinc-500 uppercase block font-bold">Severity Rating</span>
                      <div className="text-base font-bold text-red-400 mt-0.5">{geminiResult.severityScore}/100</div>
                    </div>
                    <div className="bg-zinc-950 p-2 border border-zinc-850 rounded-lg">
                      <span className="text-[7.5px] tracking-wider text-zinc-500 uppercase block font-bold">Priority Status</span>
                      <div className={`text-xs font-bold mt-0.5 ${
                        geminiResult.priorityLevel === "Immediate" ? "text-red-400" :
                        geminiResult.priorityLevel === "High" ? "text-amber-500" : "text-emerald-400"
                      }`}>{geminiResult.priorityLevel}</div>
                    </div>
                    <div className="bg-zinc-950 p-2 border border-zinc-850 rounded-lg COL-SPAN-1">
                      <span className="text-[7.5px] tracking-wider text-zinc-500 uppercase block font-bold">SLA Timeline</span>
                      <div className="text-[10px] text-zinc-200 font-bold mt-0.5 flex items-center gap-1">
                        <Clock size={11} className="text-[#38bdf8]" />
                        {geminiResult.estimatedRepairTimeline}
                      </div>
                    </div>
                    <div className="bg-zinc-950 p-2 border border-zinc-850 rounded-lg">
                      <span className="text-[7.5px] tracking-wider text-zinc-500 uppercase block font-bold">CapEx Envelope</span>
                      <div className="text-[10px] text-zinc-200 mt-0.5 flex items-center gap-1 font-bold">
                        <Coins size={11} className="text-emerald-400" />
                        {geminiResult.maintenanceCostCategory}
                      </div>
                    </div>
                  </div>

                  {/* Action recommendation */}
                  <div className="p-2.5 bg-zinc-950 border border-[#38bdf8]/15 rounded-lg text-xs">
                    <span className="text-[8px] font-mono uppercase text-[#38bdf8] block font-bold">Tactical Action Guide</span>
                    <p className="font-bold text-zinc-205 mt-1 font-sans">{geminiResult.recommendedAction}</p>
                  </div>

                  {/* Engineering report */}
                  <div className="space-y-1 text-[10px]">
                    <span className="text-[8px] font-mono uppercase text-zinc-500 block font-bold">AI Engineering Audit Case</span>
                    <p className="text-[#a1a1aa] leading-relaxed text-[10px] bg-zinc-950/60 p-2.5 rounded border border-zinc-850/60 font-sans italic">
                      "{geminiResult.analysisReport}"
                    </p>
                  </div>

                  {/* Identified Defects list */}
                  <div className="space-y-1.5 pt-1.5 border-t border-zinc-850">
                    <span className="text-[8px] font-mono uppercase text-zinc-500 block font-bold">Specific Issues Log ({geminiResult.issues.length})</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                      {geminiResult.issues.map((issue: any, iIdx: number) => (
                        <div key={iIdx} className="p-1 px-2.5 bg-zinc-900/60 border border-zinc-850 text-[10px] rounded space-y-0.5">
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-[#38bdf8] font-bold uppercase">{issue.type}</span>
                            <span className="text-red-400 font-bold">{issue.severity}</span>
                          </div>
                          <p className="text-[10.5px] text-zinc-100 font-medium font-sans">{issue.description}</p>
                          <span className="text-[8.5px] text-zinc-500 block font-mono">Location: {issue.location}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Commit action */}
                  <div className="border-t border-zinc-850 pt-2.5">
                    {userRole === "Viewer" ? (
                      <p className="text-[8.5px] text-amber-500 italic font-mono text-center">Viewer has read-only status.</p>
                    ) : (
                      <button
                        onClick={handleCommitGeminiToDatabase}
                        disabled={isCommitted}
                        className={`w-full text-white font-bold text-xs p-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer font-sans shadow transition-all ${
                          isCommitted ? "bg-[#10b981] cursor-default" : "bg-[#1b43bc] hover:bg-blue-700"
                        }`}
                      >
                        {isCommitted ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Audit Metrics Plotted on GIS Map</span>
                          </>
                        ) : (
                          <>
                            <FileText size={13} />
                            <span>Register Defects & Plott to GIS Map</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* Small educational banner */}
              <div className="bg-[#111216] border border-zinc-800 p-3 rounded-lg text-[9px] text-zinc-500 leading-normal">
                <span className="font-bold text-zinc-400 uppercase tracking-widest block font-mono text-[8px] mb-0.5">
                  Multi-Modal Analysis Guide
                </span>
                We pass loaded assets or local JPEGs along with targeted prompts directly to Google Gemini's advanced multimodal vision layer.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
