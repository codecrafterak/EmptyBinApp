export interface Reading {
  timestamp: string;
  distanceCm: number;
  fillPercentage: number;
}

export interface Bin {
  id: string;
  name: string;
  location: string;
  heightCm: number;
  currentDistanceCm: number;
  lastUpdated: string;
  status: 'active' | 'offline' | 'maintenance';
  history: Reading[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'warning' | 'info' | 'success';
  binId?: string;
}

export interface UserSettings {
  darkMode: boolean;
  unit: 'cm' | 'in';
  notificationsEnabled: boolean;
  fullThreshold: number; // e.g., 80
  emptyThreshold: number; // e.g., 20
}
