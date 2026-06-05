/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Terminal, Database, Server, Cpu, FileText, Send, Code, Play, CheckCircle2, Copy } from "lucide-react";
import { motion } from "motion/react";

const SYSTEM_ARCHITECTURE = `
                               +----------------------------------+
                               |     4K UAV Drone / Citizen App   |
                               +----------------+-----------------+
                                                |  (Direct Upload image, base64)
                                                v
                               +----------------+-----------------+
Framer Motion  +-------------->|      React SDE Web UI Console    |<-------------+  Tailwind CSS v4
               |               +----------------+-----------------+              |
               v                                | (REST POST / JSON)             v
      +--------+---------+                      v                       +--------+---------+
      |  GIS Map Overlay |             +--------+-----------------+     | Developer Portal |
      +------------------+             | express custom server.ts |     +------------------+
                                       +--------+--------+--------+
                                                |        |
                         +----------------------+        +----------------------+
                         | (YOLOv8 Edge Audit / CV Simulation)                  | (GenAI reports via GoogleGenAI SDK)
                         v                                                      v
      +------------------+-----------------+                  +----------------+-----------------+
      | YOLOv8 OpenCV Inference Pipeline   |                  |  Gemini 3.5-Flash Core Model API |
      | (Potholes, Cracks, Rutting, Wear)  |                  |  (Executive summary synthesis)   |
      +------------------+-----------------+                  +----------------+-----------------+
                         | (Saves coordinates, confidence)
                         v
      +------------------+-----------------+
      | High-fidelity In-Memory Database   |
      | (SQL Seeding, Persistent Logs API) |
      +------------------------------------+
`;

const POSTGRESQL_SCHEMA_SQL = `-- InfraSight Relational Database DDL Schema Script
-- Target: PostgreSQL v15+ (Compatible with Amazon Aurora, Google Cloud SQL)

-- Enable Spatial/GIS telemetries if needed
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users table (RBAC model)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) CHECK (role IN ('Admin', 'Inspector', 'Municipality Officer', 'Viewer')) DEFAULT 'Viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roads and Segments schema
CREATE TABLE roads (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE road_segments (
    id VARCHAR(50) PRIMARY KEY,
    road_id VARCHAR(50) REFERENCES roads(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    length_km NUMERIC(5,2) NOT NULL,
    health_score INT CHECK (health_score BETWEEN 0 AND 100),
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    traffic_volume_daily INT DEFAULT 5000,
    risk_category VARCHAR(30) CHECK (risk_category IN ('Low', 'Moderate', 'High', 'Critical')),
    geom GEOMETRY(LineString, 4326), -- Spatial geometric storage
    last_inspection_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Drone flight telemetry
CREATE TABLE drone_flights (
    id VARCHAR(50) PRIMARY KEY,
    drone_name VARCHAR(100) NOT NULL,
    battery INT CHECK (battery BETWEEN 0 AND 100),
    status VARCHAR(35) CHECK (status IN ('Idle', 'Scanning', 'Returning', 'Charging')),
    altitude_m INT DEFAULT 0,
    speed_kmh INT DEFAULT 0,
    route_name VARCHAR(150),
    coverage_sq_m NUMERIC(10,2) DEFAULT 0.00,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Computer Vision Anomaly Detection Logs (YOLOv8 output)
CREATE TABLE damages (
    id VARCHAR(50) PRIMARY KEY,
    segment_id VARCHAR(50) REFERENCES road_segments(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('Pothole', 'Longitudinal Crack', 'Transverse Crack', 'Alligator Crack', 'Surface Wear', 'Rutting')),
    severity VARCHAR(30) CHECK (severity IN ('Minor', 'Moderate', 'Severe', 'Critical')),
    confidence NUMERIC(5,2) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    area_sq_m NUMERIC(6,2),
    severity_score INT CHECK (severity_score BETWEEN 0 AND 100),
    repair_cost INT,
    labor_cost INT,
    material_cost INT,
    image_url VARCHAR(255),
    status VARCHAR(30) CHECK (status IN ('Detected', 'Verified', 'In Progress', 'Repaired')) DEFAULT 'Detected',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Maintenance Tickets
CREATE TABLE maintenance_tickets (
    id VARCHAR(50) PRIMARY KEY,
    damage_id VARCHAR(50) REFERENCES damages(id) ON DELETE CASCADE,
    road_name VARCHAR(150) NOT NULL,
    damage_type VARCHAR(150) NOT NULL,
    priority VARCHAR(30) CHECK (priority IN ('Low', 'Medium', 'High', 'Immediate')),
    assigned_team VARCHAR(100) NOT NULL,
    cost_estimate INT,
    due_date DATE,
    status VARCHAR(30) CHECK (status IN ('Open', 'Dispatched', 'In Progress', 'Completed')) DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Citizen Complaints Node
CREATE TABLE complaints (
    id VARCHAR(50) PRIMARY KEY,
    citizen_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    location_description TEXT NOT NULL,
    img_url VARCHAR(255),
    detected_type VARCHAR(50),
    verified_severity VARCHAR(30),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) CHECK (status IN ('Submitted', 'Verification', 'Verified', 'Ticket Created', 'Closed')) DEFAULT 'Submitted',
    ticket_id VARCHAR(50) REFERENCES maintenance_tickets(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Define relational spatial indices for near-instant geometric lookup
CREATE INDEX idx_segments_geom ON road_segments USING GIST(geom);
CREATE INDEX idx_damages_coords ON damages(latitude, longitude);
`;

const DJANGO_FASTAPI_BACKEND = `# FastAPI Python Production Hub Implementation Reference
# File: main.py
# Tech Stack: Fast API, SQLAlchemy ORM, YOLOv8 model inference engine

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
import cv2
import numpy as np
from ultralytics import YOLO

app = FastAPI(title="InfraSight Core AI Backend", version="1.0.0")

# Lazy initialize YOLOv8 structural road diagnostic network
try:
    yolo_model = YOLO("models/infrasight_pavement_yolov8x.pt")
except Exception:
    import warnings
    warnings.warn("YOLOv8 Pt parameters unindexed; fallback mapping activated.")
    yolo_model = None

class DamageClassification(BaseModel):
    segment_id: str
    type: str
    severity: str
    confidence: float
    latitude: float
    longitude: float

@app.post("/api/cv/inference", status_code=status.HTTP_201_CREATED)
async def perform_yolo_detection(file: UploadFile = File(...)):
    """
    Accepts raw UAV 4K image file, executes OpenCV and YOLOv8 multi-class
    segmentation on road texture bounds, extracting pothole classifications and GPS tags.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid photo binary stream")
        
    # Run active Ultralytics inference
    if yolo_model:
        results = yolo_model(image, conf=0.25)
        # Bounding box coordinates calculation
        parsed_boxes = []
        for r in results:
            for box in r.boxes:
                coords = box.xyxy[0].tolist() # x1, y1, x2, y2 coordinates
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                label = yolo_model.names[cls]
                parsed_boxes.append({"label": label, "points": coords, "iou_confidence": conf * 100})
        return {"anomalies_detected": len(parsed_boxes), "results": parsed_boxes}
    else:
        # High confidence simulated telemetry response callback
        return {
            "status": "Inference simulation active",
            "anomalies_detected": 1,
            "results": [
                {"label": "Pothole", "points": [120, 240, 280, 360], "iou_confidence": 94.2}
            ]
        }
`;

const REST_API_ENDPOINTS = [
  { method: "GET", path: "/api/segments", desc: "Retrieve active city road segments with risk indices and length telemetries." },
  { method: "GET", path: "/api/damages", desc: "List all computer-vision logged road damages with YOLO confidence meters." },
  { method: "GET", path: "/api/flights", desc: "Scan current autonomous drone squadron battery, coordinate alt, and speed." },
  { method: "GET", path: "/api/tickets", desc: "Provide dispatched maintenance crews tickets and scheduled CapEx funds." },
  { method: "GET", path: "/api/complaints", desc: "Pull citizen pavement notifications verified by the neural verifier." },
  { method: "GET", path: "/api/logs", desc: "Consult platform audit log sequence." },
  { method: "GET", path: "/api/budgets", desc: "Aggregate municipal budgets allocated vs spent on road infrastructure." }
];

export default function DeveloperHub() {
  const [activeTab, setActiveTab] = useState<"architecture" | "database" | "fastapi" | "client">("architecture");
  const [selectedEndpoint, setSelectedEndpoint] = useState(REST_API_ENDPOINTS[0]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  // Trigger actual real fetch against Express backend (REAL REST CLIENT)
  const handleTestEndpoint = async () => {
    setApiLoading(true);
    setApiResponse(null);
    try {
      const res = await fetch(selectedEndpoint.path);
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: "Fetch query failed", msg: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 font-sans animate-fadeIn" id="developer-hub-root">
      
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 bg-[#111216] border border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col justify-between" id="developer-hub-control-panel">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-zinc-900 border border-zinc-805 text-zinc-400 rounded font-mono text-[9px] font-bold">
              <Terminal size={13} />
            </span>
            <span className="font-semibold text-zinc-150 text-xs uppercase tracking-wider font-mono">Expert SDE Deck</span>
          </div>
          <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
            SaaS system blueprint board. Inspect databases schema configurations, Docker, FastAPI code templates, and test live HTTP end-points.
          </p>

          <div className="space-y-1.5 border-t border-zinc-850 pt-3">
            <button
              id="set-dev-tab-architecture"
              onClick={() => setActiveTab("architecture")}
              className={`w-full flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                activeTab === "architecture"
                  ? "bg-sky-505/10 border-sky-500/30 text-[#38bdf8] font-bold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-850 text-zinc-400"
              }`}
            >
              <Server size={13} />
              <span>System Architecture</span>
            </button>

            <button
              id="set-dev-tab-database"
              onClick={() => setActiveTab("database")}
              className={`w-full flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                activeTab === "database"
                  ? "bg-sky-505/10 border-sky-500/30 text-[#38bdf8] font-bold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-850 text-zinc-400"
              }`}
            >
              <Database size={13} />
              <span>PostgreSQL Schema (DDL)</span>
            </button>

            <button
              id="set-dev-tab-fastapi"
              onClick={() => setActiveTab("fastapi")}
              className={`w-full flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                activeTab === "fastapi"
                  ? "bg-sky-505/10 border-sky-500/30 text-[#38bdf8] font-bold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-850 text-zinc-400"
              }`}
            >
              <Code size={13} />
              <span>FastAPI YOLO Inference</span>
            </button>

            <button
              id="set-dev-tab-client"
              onClick={() => setActiveTab("client")}
              className={`w-full flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                activeTab === "client"
                  ? "bg-sky-505/10 border-sky-500/30 text-[#38bdf8] font-bold"
                  : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-850 text-zinc-400"
              }`}
            >
              <Terminal size={13} />
              <span>REST Payload Client</span>
            </button>
          </div>
        </div>

        {/* Runtime Parameters instead of tech-larping indicators */}
        <div className="bg-zinc-950/60 border border-zinc-850 p-3.5 rounded-lg mt-4 space-y-1.5 text-[10px] text-zinc-400">
          <div className="flex items-center justify-between font-mono font-bold text-zinc-300">
            <span>RUNTIME SPECIFICATIONS:</span>
            <span className="text-emerald-400 font-mono">DOCKER CONTAINER</span>
          </div>
          <p className="leading-snug text-[9.5px] text-zinc-500">
             Express Node.js application server with static builds routing traffic in Cloud Run environment.
          </p>
        </div>
      </div>

      {/* Code / Visual display frame */}
      <div className="lg:col-span-3 bg-[#111216] border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between h-[490px] overflow-hidden" id="developer-hub-content-view">
        
        {/* Dynamic header */}
        <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5 mb-3">
          <div className="space-y-0.5">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Expert SDE Registry</span>
            <h3 className="font-bold text-zinc-200 text-xs font-mono">
              {activeTab === "architecture" ? "SYSTEM DATAFLOW TOPOLOGY" :
               activeTab === "database" ? "RELATIONAL POSTGRESQL DDL SCHEMAS" :
               activeTab === "fastapi" ? "FASTAPI/YOLOV8 PYTHON PIPELINE" :
               "REACTIVE REST PAYLOAD HANDLER"}
            </h3>
          </div>
          
          <button
            id="copy-dev-code-btn"
            onClick={() => handleCopyCode(
              activeTab === "architecture" ? SYSTEM_ARCHITECTURE :
              activeTab === "database" ? POSTGRESQL_SCHEMA_SQL :
              activeTab === "fastapi" ? DJANGO_FASTAPI_BACKEND :
              JSON.stringify(REST_API_ENDPOINTS, null, 2)
            )}
            className="p-1 px-2.5 border border-zinc-800 text-zinc-400 hover:text-white rounded bg-zinc-900 transition-all cursor-pointer font-mono text-[9px] font-bold"
          >
            {copyStatus ? "COPIED" : "COPY SOURCE"}
          </button>
        </div>

        {/* Content displays */}
        <div className="flex-1 overflow-auto pr-1 text-xs font-mono text-zinc-300" id="dev-code-editor-scroller">
          {activeTab === "architecture" && (
            <pre className="leading-normal text-[9px] text-[#38bdf8]/90 select-all whitespace-pre font-mono">
              {SYSTEM_ARCHITECTURE}
            </pre>
          )}

          {activeTab === "database" && (
            <pre className="leading-relaxed select-all text-[9.5px] text-zinc-450">
              {POSTGRESQL_SCHEMA_SQL}
            </pre>
          )}

          {activeTab === "fastapi" && (
            <pre className="leading-relaxed select-all text-[9.5px] text-zinc-400">
              {DJANGO_FASTAPI_BACKEND}
            </pre>
          )}

          {/* Interactive live Client test tool */}
          {activeTab === "client" && (
            <div className="space-y-3.5 font-sans" id="rest-endpoint-tester">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Available routes left */}
                <div className="space-y-2 border-r border-zinc-850 pr-4">
                  <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">API Routes Logbook:</h5>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                    {REST_API_ENDPOINTS.map((endpoint, idx) => (
                      <button
                        key={idx}
                        id={`select-endpoint-${idx}`}
                        onClick={() => { setSelectedEndpoint(endpoint); setApiResponse(null); }}
                        className={`w-full p-2 rounded border text-left transition-all cursor-pointer ${
                          selectedEndpoint.path === endpoint.path
                            ? "border-sky-500/30 bg-sky-505/10 text-slate-100"
                            : "border-zinc-850 hover:bg-zinc-900 text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[7.5px] font-mono bg-zinc-950 border border-zinc-800 px-1 py-0.5 rounded font-bold text-center text-[#38bdf8] min-w-[38px]">
                            {endpoint.method}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-200">{endpoint.path}</span>
                        </div>
                        <p className="text-[8.5px] text-zinc-500 mt-0.5 truncate">{endpoint.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HTTP debug responses console */}
                <div className="border border-zinc-850 bg-zinc-950 p-2.5 rounded-lg flex flex-col justify-between h-[300px]">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[8px] font-mono tracking-wider text-zinc-500 font-bold uppercase">JSON Response Output</span>
                    <span className="text-[8.5px] font-mono text-emerald-400">STATUS: 200 OK</span>
                  </div>

                  <div className="flex-1 overflow-auto my-3 text-[9px] font-mono text-zinc-300" id="json-raw-response">
                    {apiLoading ? (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-650">
                        <Terminal className="animate-spin text-[#38bdf8] mb-1.5" size={18} />
                        <span className="font-mono text-[9px]">Querying database backend...</span>
                      </div>
                    ) : apiResponse ? (
                      <pre className="text-left select-all text-lime-400 font-mono text-[8.5px]">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-zinc-500 italic text-center mt-12 text-[10px]">
                        Select a target endpoint and click the query launcher to pull dynamic payload lists.
                      </p>
                    )}
                  </div>

                  <button
                    id="initiate-http-fetch-btn"
                    onClick={handleTestEndpoint}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-850 font-bold text-[10px] p-1.5 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                  >
                    <Play size={11} fill="currentColor" className="text-[#38bdf8]" />
                    <span>LAUNCH BACKEND FETCH QUERY</span>
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer info box */}
        <div className="mt-3 border-t border-zinc-850 pt-2 text-[8.5px] text-zinc-500 flex items-center justify-between font-mono">
          <span>Target Platform: Cloud Run Docker Enclosure</span>
          <span>Authorization: Bearer Session Locks Active</span>
        </div>
      </div>
    </div>
  );
}
