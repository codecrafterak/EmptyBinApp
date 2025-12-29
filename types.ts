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

export interface UserSettings {
  darkMode: boolean;
  unit: 'cm' | 'in';
  notificationsEnabled: boolean;
}
