
export interface RunLog {
  id: string;
  date: string; // ISO string
  distance: number; // in km
  duration: number; // in minutes
  pace: number; // minutes per km
  notes: string;
  imageUrl?: string; // base64
  aiFeedback?: string;
}

export interface RunAnalysis {
  distance?: number;
  duration?: number;
  notes?: string;
  feedback?: string;
}

export interface UserProfile {
  name: string;
  photoUrl?: string;
}

export enum NavigationTab {
  DASHBOARD = 'dashboard',
  ADD_RUN = 'add_run',
  HISTORY = 'history'
}
