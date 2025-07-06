import type React from 'react';

export type Screen = 'dashboard' | 'scan' | 'rewards' | 'profile' | 'leaderboard';

export type TierName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface Activity {
  id: number;
  description: string;
  points: number;
  timestamp: string;
  type: 'earn' | 'redeem';
}

export interface Tier {
  name: TierName;
  min: number;
  max: number;
  bonus: number;
  badge: string;
  class: string;
}

export interface User {
  name: string;
  phone: string;
  points: number;
  totalBottles: number;
  totalCans: number;
  totalGlass: number;
  tier: TierName;
  history: Activity[];
  joinDate: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  iconBg: string;
}

export interface DetectedItem {
  name: 'bottle' | 'can' | 'glass';
  count: number;
}

export interface DetectedObject {
    bbox: [number, number, number, number];
    class: string;
    score: number;
}

export interface ScanResult {
    bottles: number;
    cans: number;
    glass: number;
}

export interface LeaderboardUser {
    id: number;
    name: string;
    points: number;
    tier: TierName;
}
