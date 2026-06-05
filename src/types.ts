/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RoadSegment {
  id: string;
  name: string;
  city: string;
  lengthKm: number;
  healthScore: number; // 0 to 100
  riskScore: number; // 0 to 100
  trafficVolumeDaily: number;
  trafficImpactScore: number; // Estimated delay in minutes or accident risk
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  coords: [number, number][]; // Line coordinates
  lastInspectionDate: string;
}

export interface Damage {
  id: string;
  segmentId: string;
  roadName: string;
  type: 'Pothole' | 'Longitudinal Crack' | 'Transverse Crack' | 'Alligator Crack' | 'Surface Wear' | 'Rutting';
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  confidence: number; // 0 to 100
  latitude: number;
  longitude: number;
  areaSqM: number;
  severityScore: number; // 0 to 100
  repairCost: number;
  laborCost: number;
  materialCost: number;
  detectedAt: string;
  status: 'Detected' | 'Verified' | 'In Progress' | 'Repaired';
  imageUrl?: string;
}

export interface DroneFlight {
  id: string;
  droneName: string;
  battery: number; // percentage
  status: 'Idle' | 'Scanning' | 'Returning' | 'Charging';
  altitudeM: number;
  speedKmh: number;
  flightRouteName: string;
  coverageSqM: number;
  durationMinutes: number;
}

export interface MaintenanceTicket {
  id: string;
  damageId: string;
  roadName: string;
  damageType: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Immediate';
  assignedTeam: string;
  costEstimate: number;
  dueDate: string;
  status: 'Open' | 'Dispatched' | 'In Progress' | 'Completed';
  createdAt: string;
}

export interface Complaint {
  id: string;
  citizenName: string;
  phone: string;
  locationDescription: string;
  imageUrl?: string;
  detectedType?: 'Pothole' | 'Longitudinal Crack' | 'Transverse Crack' | 'Alligator Crack' | 'Surface Wear' | 'Rutting';
  verifiedSeverity?: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  latitude: number;
  longitude: number;
  status: 'Submitted' | 'Verification' | 'Verified' | 'Ticket Created' | 'Closed';
  ticketId?: string;
  createdAt: string;
}

export interface BudgetSnapshot {
  city: string;
  totalAllocated: number;
  spent: number;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  forecastNextYear: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ip: string;
}
