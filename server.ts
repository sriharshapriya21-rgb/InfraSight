/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { RoadSegment, Damage, DroneFlight, MaintenanceTicket, Complaint, BudgetSnapshot, AuditLog } from "./src/types";

// Setup Express
const app = express();
const PORT = 3000;

app.use(express.json());

// IN-MEMORY STORAGE STATE (Seeded with high-fidelity, startup-quality data)
let cities = ["Metro City (Central District)", "Oakridge Highway Sector", "Southshore Coastal Route"];

let segments: RoadSegment[] = [
  // Metro City
  {
    id: "seg-101",
    name: "Broadway Boulevard (Main Corridor)",
    city: "Metro City (Central District)",
    lengthKm: 4.8,
    healthScore: 78,
    riskScore: 22,
    trafficVolumeDaily: 42000,
    trafficImpactScore: 12,
    riskCategory: "Moderate",
    coords: [[40.71, -74.00], [40.72, -73.99], [40.73, -73.98]],
    lastInspectionDate: "2026-05-15",
  },
  {
    id: "seg-102",
    name: "Avenue-C Flyover & Bridge",
    city: "Metro City (Central District)",
    lengthKm: 1.2,
    healthScore: 42,
    riskScore: 68,
    trafficVolumeDaily: 58000,
    trafficImpactScore: 28,
    riskCategory: "High",
    coords: [[40.73, -73.97], [40.74, -73.96]],
    lastInspectionDate: "2026-06-01",
  },
  {
    id: "seg-103",
    name: "Martin Luther King Expressway",
    city: "Metro City (Central District)",
    lengthKm: 8.5,
    healthScore: 91,
    riskScore: 12,
    trafficVolumeDaily: 75000,
    trafficImpactScore: 8,
    riskCategory: "Low",
    coords: [[40.70, -74.02], [40.69, -74.04]],
    lastInspectionDate: "2026-05-28",
  },
  // Oakridge
  {
    id: "seg-201",
    name: "Interstate-95 North (Forest Sector)",
    city: "Oakridge Highway Sector",
    lengthKm: 12.4,
    healthScore: 63,
    riskScore: 48,
    trafficVolumeDaily: 68000,
    trafficImpactScore: 18,
    riskCategory: "High",
    coords: [[40.85, -74.15], [40.88, -74.12], [40.91, -74.10]],
    lastInspectionDate: "2026-05-10",
  },
  {
    id: "seg-202",
    name: "Oakridge Mountain Tunnel Entry",
    city: "Oakridge Highway Sector",
    lengthKm: 2.1,
    healthScore: 35,
    riskScore: 85,
    trafficVolumeDaily: 24000,
    trafficImpactScore: 35,
    riskCategory: "Critical",
    coords: [[40.93, -74.08], [40.94, -74.07]],
    lastInspectionDate: "2026-05-30",
  },
  // Southshore
  {
    id: "seg-301",
    name: "Pacific Marine Drive (Coastal)",
    city: "Southshore Coastal Route",
    lengthKm: 15.6,
    healthScore: 82,
    riskScore: 31,
    trafficVolumeDaily: 18000,
    trafficImpactScore: 15,
    riskCategory: "Moderate",
    coords: [[34.01, -118.49], [34.02, -118.48], [34.03, -118.47]],
    lastInspectionDate: "2026-06-03",
  },
  {
    id: "seg-302",
    name: "Sunset Pier Access Road",
    city: "Southshore Coastal Route",
    lengthKm: 0.8,
    healthScore: 56,
    riskScore: 52,
    trafficVolumeDaily: 11000,
    trafficImpactScore: 22,
    riskCategory: "High",
    coords: [[34.00, -118.52], [33.99, -118.51]],
    lastInspectionDate: "2026-04-18",
  }
];

let damages: Damage[] = [
  // seg-102 (Avenue-C)
  {
    id: "dmg-1001",
    segmentId: "seg-102",
    roadName: "Avenue-C Flyover & Bridge",
    type: "Pothole",
    severity: "Critical",
    confidence: 96.4,
    latitude: 40.732,
    longitude: -73.968,
    areaSqM: 1.8,
    severityScore: 92,
    repairCost: 4500,
    laborCost: 2000,
    materialCost: 1800,
    detectedAt: "2026-06-01T08:14:22Z",
    status: "Verified",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "dmg-1002",
    segmentId: "seg-102",
    roadName: "Avenue-C Flyover & Bridge",
    type: "Alligator Crack",
    severity: "Severe",
    confidence: 89.1,
    latitude: 40.735,
    longitude: -73.965,
    areaSqM: 12.5,
    severityScore: 84,
    repairCost: 15200,
    laborCost: 6000,
    materialCost: 7200,
    detectedAt: "2026-06-01T08:21:40Z",
    status: "In Progress",
    imageUrl: "https://images.unsplash.com/photo-1621460248083-bf019864fe06?auto=format&fit=crop&w=600&q=80"
  },
  // seg-101 (Broadway)
  {
    id: "dmg-1003",
    segmentId: "seg-101",
    roadName: "Broadway Boulevard (Main Corridor)",
    type: "Longitudinal Crack",
    severity: "Moderate",
    confidence: 94.2,
    latitude: 40.715,
    longitude: -74.002,
    areaSqM: 4.2,
    severityScore: 58,
    repairCost: 2100,
    laborCost: 900,
    materialCost: 850,
    detectedAt: "2026-05-15T15:30:10Z",
    status: "Verified",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "dmg-1004",
    segmentId: "seg-101",
    roadName: "Broadway Boulevard (Main Corridor)",
    type: "Transverse Crack",
    severity: "Minor",
    confidence: 97.8,
    latitude: 40.725,
    longitude: -73.987,
    areaSqM: 2.1,
    severityScore: 32,
    repairCost: 950,
    laborCost: 400,
    materialCost: 350,
    detectedAt: "2026-05-15T15:42:00Z",
    status: "Repaired",
    imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80"
  },
  // seg-202 (Oakridge Tunnel Entry)
  {
    id: "dmg-2001",
    segmentId: "seg-202",
    roadName: "Oakridge Mountain Tunnel Entry",
    type: "Rutting",
    severity: "Critical",
    confidence: 91.5,
    latitude: 40.932,
    longitude: -74.078,
    areaSqM: 22.0,
    severityScore: 94,
    repairCost: 28000,
    laborCost: 11000,
    materialCost: 13500,
    detectedAt: "2026-05-30T10:11:55Z",
    status: "Detected",
  },
  {
    id: "dmg-2002",
    segmentId: "seg-202",
    roadName: "Oakridge Mountain Tunnel Entry",
    type: "Surface Wear",
    severity: "Severe",
    confidence: 88.0,
    latitude: 40.938,
    longitude: -74.072,
    areaSqM: 35.5,
    severityScore: 78,
    repairCost: 18500,
    laborCost: 7500,
    materialCost: 8000,
    detectedAt: "2026-05-30T10:19:22Z",
    status: "Detected",
  },
  // seg-302 (Sunset Pier Road)
  {
    id: "dmg-3001",
    segmentId: "seg-302",
    roadName: "Sunset Pier Access Road",
    type: "Pothole",
    severity: "Severe",
    confidence: 95.1,
    latitude: 33.998,
    longitude: -118.515,
    areaSqM: 3.1,
    severityScore: 82,
    repairCost: 6500,
    laborCost: 2800,
    materialCost: 2600,
    detectedAt: "2026-04-18T14:22:00Z",
    status: "Detected",
  }
];

let droneFlights: DroneFlight[] = [
  {
    id: "flight-01",
    droneName: "UAV SkyScan-Pro Alpha",
    battery: 84,
    status: "Scanning",
    altitudeM: 45,
    speedKmh: 28,
    flightRouteName: "Sector 4B Corridor Survey",
    coverageSqM: 14500,
    durationMinutes: 18,
  },
  {
    id: "flight-02",
    droneName: "UAV Sentinel-4 Drone",
    battery: 12,
    status: "Returning",
    altitudeM: 60,
    speedKmh: 35,
    flightRouteName: "Oakridge North Interstate Recon",
    coverageSqM: 48000,
    durationMinutes: 44,
  },
  {
    id: "flight-03",
    droneName: "UAV CoastScan MultiSpectral",
    battery: 100,
    status: "Charging",
    altitudeM: 0,
    speedKmh: 0,
    flightRouteName: "Dock-Station Charlie Docking",
    coverageSqM: 0,
    durationMinutes: 0,
  }
];

let maintenanceTickets: MaintenanceTicket[] = [
  {
    id: "tkt-501",
    damageId: "dmg-1002",
    roadName: "Avenue-C Flyover & Bridge",
    damageType: "Alligator Crack (Severe, 12.5m²)",
    severity: "Severe",
    priority: "High",
    assignedTeam: "Rapid-Repair Unit Bravo",
    costEstimate: 15200,
    dueDate: "2026-06-12",
    status: "In Progress",
    createdAt: "2026-06-01T12:00:00Z"
  },
  {
    id: "tkt-502",
    damageId: "dmg-1001",
    roadName: "Avenue-C Flyover & Bridge",
    damageType: "Pothole (Critical depth structural)",
    severity: "Critical",
    priority: "Immediate",
    assignedTeam: "Metro Asphalt Division 1",
    costEstimate: 4500,
    dueDate: "2026-06-06",
    status: "Open",
    createdAt: "2026-06-02T09:15:00Z"
  }
];

let complaints: Complaint[] = [
  {
    id: "cmpl-801",
    citizenName: "Jonathan Vance",
    phone: "+1 (555) 728-1922",
    locationDescription: "Right lane, 100 meters before the toll gate heading north",
    detectedType: "Pothole",
    verifiedSeverity: "Severe",
    latitude: 40.722,
    longitude: -73.992,
    status: "Ticket Created",
    ticketId: "tkt-502",
    createdAt: "2026-06-02T07:11:00Z",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cmpl-802",
    citizenName: "Sarah Peterson",
    phone: "+1 (555) 303-9188",
    locationDescription: "Oakridge Hwy intersection near Tunnel entrance, massive cracking",
    status: "Submitted",
    latitude: 40.933,
    longitude: -74.077,
    createdAt: "2026-06-04T12:44:00Z",
  }
];

let budgets: BudgetSnapshot[] = [
  {
    city: "Metro City (Central District)",
    totalAllocated: 1250000,
    spent: 420000,
    materialCost: 180000,
    laborCost: 160000,
    equipmentCost: 80000,
    forecastNextYear: 1400000
  },
  {
    city: "Oakridge Highway Sector",
    totalAllocated: 850000,
    spent: 245000,
    materialCost: 110000,
    laborCost: 95000,
    equipmentCost: 40000,
    forecastNextYear: 980000
  },
  {
    city: "Southshore Coastal Route",
    totalAllocated: 600000,
    spent: 120000,
    materialCost: 55000,
    laborCost: 45000,
    equipmentCost: 20000,
    forecastNextYear: 620000
  }
];

let auditLogs: AuditLog[] = [
  {
    id: "log-901",
    timestamp: "2026-06-04T13:10:22Z",
    user: "officer_vance@muni.gov",
    action: "Citizen Complaint Verification",
    details: "Manually approved complaint cmpl-801, spawned service priority card (tkt-502)",
    ip: "10.225.12.82"
  },
  {
    id: "log-902",
    timestamp: "2026-06-04T11:42:01Z",
    user: "uav_autopilot_system",
    action: "UAV Telemetry Log Upload",
    details: "Autonomous route 'Forest Recon' successfully uploaded. 2 anomalies registered.",
    ip: "192.168.1.41"
  },
  {
    id: "log-903",
    timestamp: "2026-06-04T07:22:15Z",
    user: "administrator_infra",
    action: "System Configuration Update",
    details: "YOLOv8 deep inference confidence threshold calibrated to 85.0%",
    ip: "10.225.10.1"
  }
];

// LAZY INIT GEMINI CLIENT UTILITY (to avoid startup failures if key is absent)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      console.warn("WARNING: GEMINI_API_KEY is not defined or is a placeholder. Server-side AI will operate in simulated high-fidelity mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// REST API ROUTER & CONTROLLERS
app.get("/api/segments", (req, res) => {
  res.json({ segments });
});

app.get("/api/damages", (req, res) => {
  res.json({ damages });
});

app.post("/api/damages", (req, res) => {
  const newDmg: Damage = {
    id: `dmg-${Date.now()}`,
    ...req.body,
    detectedAt: new Date().toISOString(),
    status: req.body.status || "Detected"
  };
  damages.unshift(newDmg);

  // Auto update health index of associated road segment
  const segment = segments.find(s => s.id === newDmg.segmentId);
  if (segment) {
    const originalScore = segment.healthScore;
    const impact = newDmg.severity === "Critical" ? 18 : newDmg.severity === "Severe" ? 12 : newDmg.severity === "Moderate" ? 6 : 2;
    segment.healthScore = Math.max(10, segment.healthScore - impact);
    segment.riskScore = Math.min(98, segment.riskScore + Math.floor(impact * 1.2));
    if (segment.healthScore < 40) segment.riskCategory = "Critical";
    else if (segment.healthScore < 60) segment.riskCategory = "High";
    else if (segment.healthScore < 80) segment.riskCategory = "Moderate";
    else segment.riskCategory = "Low";

    // log log
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "uav_autopilot_system",
      action: "Autonomous Anomaly Detected",
      details: `UAV telemetry added ${newDmg.type} to '${segment.name}'. Impact: Segment health decreased from ${originalScore} to ${segment.healthScore}`,
      ip: "192.168.1.41"
    });
  }

  res.status(201).json(newDmg);
});

app.get("/api/flights", (req, res) => {
  res.json({ flights: droneFlights });
});

app.post("/api/flights/update", (req, res) => {
  const { id, status, battery, altitudeM, speedKmh } = req.body;
  const drone = droneFlights.find(d => d.id === id);
  if (drone) {
    if (status !== undefined) drone.status = status;
    if (battery !== undefined) drone.battery = battery;
    if (altitudeM !== undefined) drone.altitudeM = altitudeM;
    if (speedKmh !== undefined) drone.speedKmh = speedKmh;
    res.json(drone);
  } else {
    res.status(404).json({ error: "Drone not found" });
  }
});

app.get("/api/tickets", (req, res) => {
  res.json({ tickets: maintenanceTickets });
});

app.post("/api/tickets", (req, res) => {
  const ticket: MaintenanceTicket = {
    id: `tkt-${Math.floor(Math.random() * 900) + 100}`,
    createdAt: new Date().toISOString(),
    status: "Open",
    ...req.body
  };
  maintenanceTickets.unshift(ticket);
  
  // Update associated damage status
  const dmg = damages.find(d => d.id === ticket.damageId);
  if (dmg) {
    dmg.status = "In Progress";
  }

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: "officer_vance@muni.gov",
    action: "Ticket Generated",
    details: `Initiated dispatch of ${ticket.assignedTeam} for road ${ticket.roadName}. Budget allocated: $${ticket.costEstimate.toLocaleString()}`,
    ip: "10.225.12.82"
  });

  res.status(201).json(ticket);
});

app.post("/api/tickets/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ticket = maintenanceTickets.find(t => t.id === id);
  if (ticket) {
    ticket.status = status;
    const dmg = damages.find(d => d.id === ticket.damageId);
    if (dmg) {
      if (status === "Completed") {
        dmg.status = "Repaired";
        const seg = segments.find(s => s.id === dmg.segmentId);
        if (seg) {
          seg.healthScore = Math.min(100, seg.healthScore + 8);
          seg.riskScore = Math.max(0, seg.riskScore - 8);
        }
      } else if (status === "In Progress") {
        dmg.status = "In Progress";
      } else if (status === "Dispatched") {
        dmg.status = "Verified";
      }
    }
    res.json(ticket);
  } else {
    res.status(404).json({ error: "Ticket not found" });
  }
});

app.post("/api/tickets/resolve", (req, res) => {
  const { id } = req.body;
  const ticket = maintenanceTickets.find(t => t.id === id);
  if (ticket) {
    ticket.status = "Completed";
    const dmg = damages.find(d => d.id === ticket.damageId);
    if (dmg) {
      dmg.status = "Repaired";
      // Slightly improve segment score after repair
      const seg = segments.find(s => s.id === dmg.segmentId);
      if (seg) {
        seg.healthScore = Math.min(100, seg.healthScore + 8);
        seg.riskScore = Math.max(0, seg.riskScore - 8);
      }
    }

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "field_dispatcher@infra.net",
      action: "Repair Ticket Completed",
      details: `Ticket ${id} marked completed. Asphalt resealed and drone inspection triggered.`,
      ip: "10.225.14.3"
    });

    res.json(ticket);
  } else {
    res.status(404).json({ error: "Ticket not found" });
  }
});

app.get("/api/complaints", (req, res) => {
  res.json({ complaints });
});

// Citizen Complaint Portal & AI Complaint Verification (Feature 28 & 29)
app.post("/api/complaints", (req, res) => {
  const { citizenName, phone, locationDescription, latitude, longitude } = req.body;
  
  // Setup a new complaint
  const complaintId = `cmpl-${Math.floor(Math.random() * 800) + 110}`;
  
  // Feature 29: AI Complaint Verification & Automatic damage ticket creation
  const possibleDamages = ["Pothole", "Alligator Crack", "Longitudinal Crack", "Transverse Crack", "Surface Wear", "Rutting"];
  const randomType = possibleDamages[Math.floor(Math.random() * possibleDamages.length)] as any;
  const randomSeverity = (Math.random() > 0.5 ? "Severe" : "Critical") as any;
  const confidenceScore = parseFloat((82 + Math.random() * 16).toFixed(1));
  const severityScore = randomSeverity === "Critical" ? 90 : 75;
  const repairCost = randomSeverity === "Critical" ? 5400 : 2200;

  // Let's create an associated damage entry automatically upon AI verification simulation
  const dummySegmentId = "seg-101"; // Default corridor
  const segment = segments[0];

  const autoDamage: Damage = {
    id: `dmg-comp-${complaintId}`,
    segmentId: dummySegmentId,
    roadName: segment.name,
    type: randomType,
    severity: randomSeverity,
    confidence: confidenceScore,
    latitude: latitude || 40.718,
    longitude: longitude || -74.001,
    areaSqM: 3.5,
    severityScore,
    repairCost,
    laborCost: Math.floor(repairCost * 0.45),
    materialCost: Math.floor(repairCost * 0.4),
    detectedAt: new Date().toISOString(),
    status: "Verified"
  };

  damages.unshift(autoDamage);

  // Create complaint
  const newComplaint: Complaint = {
    id: complaintId,
    citizenName,
    phone,
    locationDescription,
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80",
    detectedType: randomType,
    verifiedSeverity: randomSeverity,
    latitude: latitude || 40.718,
    longitude: longitude || -74.001,
    status: "Ticket Created",
    createdAt: new Date().toISOString()
  };

  // Create immediate dispatch ticket
  const autoTicket: MaintenanceTicket = {
    id: `tkt-cp-${Math.floor(Math.random() * 800) + 100}`,
    damageId: autoDamage.id,
    roadName: segment.name,
    damageType: `AI-Verified Citizen Filed: ${randomType} (${randomSeverity})`,
    severity: randomSeverity,
    priority: randomSeverity === "Critical" ? "Immediate" : "High",
    assignedTeam: "Rapid-Repair Unit Bravo",
    costEstimate: repairCost,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days later
    status: "Open",
    createdAt: new Date().toISOString()
  };

  maintenanceTickets.unshift(autoTicket);
  newComplaint.ticketId = autoTicket.id;
  
  complaints.unshift(newComplaint);

  // Log in system records
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: "Infrasight AI Verifier",
    action: "Citizen Complaint AI auto-approval",
    details: `Complaint ${complaintId} by ${citizenName} successfully processed via Computer Vision. Spawning Emergency Ticket ${autoTicket.id}.`,
    ip: "10.225.10.254"
  });

  res.status(201).json({
    complaint: newComplaint,
    ticket: autoTicket,
    damageId: autoDamage.id
  });
});

app.get("/api/logs", (req, res) => {
  res.json({ logs: auditLogs });
});

app.get("/api/budgets", (req, res) => {
  res.json({ budgets });
});

// Feature 31: GenAI Executive Report Generator using Gemini API
app.post("/api/gemini/generate-report", async (req, res) => {
  const { city, metrics } = req.body;
  const ai = getGeminiClient();

  // Create an informative prompt for Gemini with current municipal telemetry
  const prompt = `You are the lead Smart City Infrastructure Advisory Agent for the InfraSight SaaS Platform.
Analyze the following road inspection state and generate an executive-ready, startup-quality infrastructure intelligence report.

MUNICIPAL TARGET: ${city || "Metro City"}
KEY TELEMETRY METRICS:
- Overall City Infrastructure Score: ${metrics?.cityHealthScore || 78}/100
- Active Tracked UAV Scans: ${metrics?.activeScans || 2} flight groups
- Total Anomalies Detected (YOLOv8): ${metrics?.totalDamages || 7} sites
- Road Segments Marked "Critical" or "High Risk": ${metrics?.criticalSegmentsCount || 2} corridor lines
- Total Projected Repair Cost: $${metrics?.totalPlannedRepairCost || 135400}
- Current Budget Allocated: $${metrics?.budgetAllocated || 1250000}
- Current Budget Spent: $${metrics?.budgetSpent || 420000} (Available Reserves: $${(metrics?.budgetAllocated || 1250000) - (metrics?.budgetSpent || 420000)})

Please construct a comprehensive report matching the following structure using elegant markdown, professional engineering terminology, and concise startup-quality phrasing. Avoid sales talk or self-complimentary words.

# INFRASTRUCTURE ANALYSIS & PREDICTIVE MAINTENANCE BOARD

## 1. EXECUTIVE SUMMARY
[Provide a highly dense 3-line synthesis of the city's general road health, highlighting structural bottlenecks vs fiscal readiness]

## 2. INFRASTRUCTURE INSIGHTS & RISK AREAS
[Discuss specific anomalies such as potholes, wear, alligator cracks. Identify where high safety risk or traffic degradation is highly probable]

## 3. PREDICTIVE REPAIR WORKFLOW & ESTIMATION
[Estimate growth modeling in 7, 30, and 90 days if left untreated. Detail material usage, emission savings by hot-mix recycling asphalt, and labor allocation]

## 4. ACTIONABLE MAINTENANCE PRIORITIZATION
[Assign exact tactical steps (e.g. Resurfacing high risk corridor immediately, patch pothole within 48h, schedule overnight closures to reduce traffic delays by 15 mins)]

Ensure the feedback reads as a professional consultant would structure a smart city recommendation. Do not include meta comments, greetings, or placeholders. Make it feel highly customized and complete.`;

  if (!ai) {
    // Return a pristine simulated report if API key is not present or is a placeholder
    const simulatedReport = `# INFRASTRUCTURE ANALYSIS & PREDICTIVE MAINTENANCE BOARD

## 1. EXECUTIVE SUMMARY
${city || "Metro City"} exhibits a moderately resilient municipal pavement grid with an overall Health Index of ${metrics?.cityHealthScore || 78}/100. Localized distress clusters on specific high-traffic corridors threaten safety metrics. With a robust available budget reserve of $${(((metrics?.budgetAllocated || 1250000) - (metrics?.budgetSpent || 420000))).toLocaleString()}, immediate tactical intervention is fully capitalized and recommended prior to multi-zone structural decay.

## 2. INFRASTRUCTURE INSIGHTS & RISK AREAS
YOLOv8 deep imagery telemetry registers ${metrics?.totalDamages || 7} road anomalies, heavily weighted toward structural alligator cracking and rapid-growth potholes on principal expressways. Coastal saltwater spray or industrial hauling loads have accelerated surface stripping along active sectors. Heavy traffic volume (typically peaks up to 58,000 daily vehicles) exponentially expands crack widths, presenting an elevated safety hazard and a severe risk of sudden chassis damage.

## 3. PREDICTIVE REPAIR WORKFLOW & ESTIMATION
Our XGBoost and Random Forest forecasting modules modeling localized deterioration indicate that if current moderate longitudinal cracks remain unsealed, they are predicted to degrade into catastrophic alligator clusters within 30 days, raising repair costs by up to 280%. Utilizing cold-in-place asphalt recycling rather than conventional hot-mix asphalt is estimated to lower project carbon footprint by indices of 42.5%, preventing approximately 18.2 metric tons of CO₂ emissions.

## 4. ACTIONABLE MAINTENANCE PRIORITIZATION
1. **Immediate Resurfacing (0-7 Days)**: Prioritize overnight milling and structural inlay along risk zones. Scheduling repairs during 22:00 to 05:00 reduces daytime commuter congestion indexes by 84%.
2. **Citizen Complaint Action (48 Hours)**: Rapidly fill high-urgency potholes validated in the citizen portal to maintain civic trust and route compliance.
3. **Continuous Drone Flights**: Deploy quadcopters thrice weekly to capture 4K orthomosaic imagery for dynamic growth monitoring.`;

    // Wait a brief simulated latency so the loader looks authentic
    await new Promise(resolve => setTimeout(resolve, 1400));
    return res.json({ report: simulatedReport, simulated: true });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    const reportText = response.text || "Report generation failed. Please verify raw prompts and try again.";
    res.json({ report: reportText, simulated: false });
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    res.status(500).json({ error: "Gemini report generation failed.", details: error.message });
  }
});

// Feature: Multi-modal Gemini Vision AI Image Analysis & Maintenance Recommendations
app.post("/api/gemini/analyze-image", async (req, res) => {
  const { imageBase64, imageName, category } = req.body;
  const ai = getGeminiClient();

  const prompt = `You are the lead Smart City AI Vision Auditor for InfraSight.
Analyse this infrastructure damage photo (category: ${category || "Pavement/Road"}).
Detect all defects such as cracks (longitudinal, transverse, alligator), potholes, surface degradation, structural damage, water seepage, or safety hazards.

Generate a highly specific audit result. It MUST be valid JSON matching the following schema structure:
{
  "issues": [
    {
      "type": "Crack" | "Pothole" | "Degradation" | "Structural" | "Hazard",
      "severity": "Minor" | "Moderate" | "Severe" | "Critical",
      "location": "Pavement surface" | "Bridge joint" | "Sidewalk fringe" | "Drainage inlet",
      "description": "Specific visual pattern detected..."
    }
  ],
  "severityScore": number (value between 10 and 100 representing aggregate damage severity),
  "priorityLevel": "Low" | "Medium" | "High" | "Immediate",
  "estimatedRepairTimeline": "1-2 days" | "3-5 days" | "within 24 hours" | "routine schedule",
  "recommendedAction": "Immediate polymer slurry injection" | "Standard cold-patching" | "Asphalt overlay mill" | "Structural joint bracing",
  "maintenanceCostCategory": "Under $1,000" | "$1,000 - $5,000" | "$5,000 - $15,000" | "Over $15,000",
  "analysisReport": "A concise, 4-sentence professional engineering summary of the findings, safety implications, and structural outlook."
}

Do not return any markdown formatting blocks (such as \`\`\`json) or other meta comments outside of the raw, clean JSON data. Ensure it is fully compliant, valid JSON.`;

  if (!ai || !imageBase64) {
    // Elegant high-fidelity fallback analysis
    let issues = [
      { type: "Pothole", severity: "Severe", location: "Central lane crown", description: "Expanded structural pothole with water erosion at core boundaries." },
      { type: "Crack", severity: "Moderate", location: "Subbase interface", description: "Interconnected longitudinal thermal cracks indicating subgrade failure." }
    ];
    let severityScore = 78;
    let priorityLevel = "High";
    let estimatedRepairTimeline = "3-5 days";
    let recommendedAction = "Asphalt overlay mill & polymer slurry application";
    let maintenanceCostCategory = "$1,000 - $5,000";
    let analysisReport = "The pavement sector demonstrates heavy surface degradation with severe localized pitting and interlocking cracking. Water penetration into the sub-base is imminent, which will accelerate aggregate stripping if unaddressed. Immediate chemical sealant or targeted overlays is advised to preserve the structural coefficient of this urban connector lane.";

    if (category === "Bridge") {
      issues = [
        { type: "Structural", severity: "Critical", location: "Span joint abutment", description: "Horizontal tension fractures intersecting reinforced structural concrete column." },
        { type: "Hazard", severity: "Severe", location: "Parapet safety rail", description: "Corrosive chemical leaching from drainage spouts degrading barrier reinforcement structure." }
      ];
      severityScore = 92;
      priorityLevel = "Immediate";
      estimatedRepairTimeline = "within 24 hours";
      recommendedAction = "Structural joint bracing & reinforcement concrete overlay";
      maintenanceCostCategory = "Over $15,000";
      analysisReport = "Abutment joint shear cracks present an active threat to load-bearing capabilities. Heavy structural stress from continuous hauling operations has degraded the elastomeric pad. Advise emergency lane closures to implement composite carbon-fiber wraps and structural realignment.";
    } else if (category === "Drainage") {
      issues = [
        { type: "Hazard", severity: "Moderate", location: "Inlet catch basin", description: "Severe debris blockage with storm grate rust degrading local drainage throughput." },
        { type: "Degradation", severity: "Minor", location: "Gully transition slab", description: "Minor concrete scour from high-velocity stormwater surface velocities." }
      ];
      severityScore = 55;
      priorityLevel = "Medium";
      estimatedRepairTimeline = "routine schedule";
      recommendedAction = "Sump debris clearing & anti-rust metallic resin coating";
      maintenanceCostCategory = "Under $1,000";
      analysisReport = "Blockage at the drainage inlet has triggered minor ponding risk across standard commuter margins. Pavement scouring around the collar is currently non-critical but could accelerate subgrade compromise if storm pooling persists. Routine maintenance to clean aggregate sumps is recommended.";
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    return res.json({
      success: true,
      data: {
        issues,
        severityScore,
        priorityLevel,
        estimatedRepairTimeline,
        recommendedAction,
        maintenanceCostCategory,
        analysisReport
      },
      simulated: true
    });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        },
        prompt
      ]
    });

    const val = (response.text || "").trim();
    const cleanJson = val.replace(/^```json/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanJson);

    res.json({
      success: true,
      data: parsed,
      simulated: false
    });
  } catch (error: any) {
    console.error("Gemini Image Analysis failed:", error);
    res.status(500).json({ error: "Gemini Image Analysis failed.", details: error.message });
  }
});

// VITE MIDDLEWARE INTERPOLATION & PRODUCTION SERVING
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[InfraSight Backend] Active and routing at http://0.0.0.0:${PORT}`);
  });
}

startServer();
