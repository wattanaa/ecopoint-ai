import React from 'react';
import { type Tier, type Reward, type TierName, type LeaderboardUser } from './types';
import { ShoppingBag, Gift, Box, Coffee, Shirt, Sprout } from 'lucide-react';


export const TIERS: Record<TierName, Tier> = {
  Bronze: { name: 'Bronze', min: 0, max: 499, bonus: 1.0, badge: 'B', class: 'bg-gradient-to-br from-amber-500 to-yellow-700' },
  Silver: { name: 'Silver', min: 500, max: 1999, bonus: 1.1, badge: 'S', class: 'bg-gradient-to-br from-slate-400 to-gray-500' },
  Gold: { name: 'Gold', min: 2000, max: 4999, bonus: 1.2, badge: 'G', class: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
  Platinum: { name: 'Platinum', min: 5000, max: 9999, bonus: 1.3, badge: 'P', class: 'bg-gradient-to-br from-cyan-200 to-teal-400' },
  Diamond: { name: 'Diamond', min: 10000, max: Infinity, bonus: 1.5, badge: 'D', class: 'bg-gradient-to-br from-sky-300 to-blue-500' }
};

export const TIERS_ARRAY = Object.values(TIERS);


export const REWARDS: Reward[] = [
  {
    id: 'eco_bag_basic',
    name: 'ถุงผ้า Eco-Friendly',
    description: 'ถุงผ้าเพื่อสิ่งแวดล้อม',
    cost: 2500,
    icon: <ShoppingBag size={28} className="text-white"/>,
    gradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
  },
  {
    id: 'coffee_voucher',
    name: 'บัตรกำนัลร้านกาแฟ',
    description: 'ส่วนลด 50 บาท ที่ร้านกาแฟออร์แกนิค',
    cost: 1500,
    icon: <Coffee size={28} className="text-white"/>,
    gradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
  },
  {
    id: 'premium_bag',
    name: 'กล่องสุ่มรักษ์โลก',
    description: 'ของรางวัลพิเศษในกล่อง',
    cost: 4500,
    icon: <Box size={28} className="text-white"/>,
    gradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  },
   {
    id: 'eco_shirt',
    name: 'เสื้อยืด EcoPoint',
    description: 'ทำจากผ้าฝ้ายรีไซเคิล 100%',
    cost: 6000,
    icon: <Shirt size={28} className="text-white" />,
    gradient: 'from-teal-50 to-cyan-50',
    borderColor: 'border-teal-200',
    iconBg: 'bg-gradient-to-br from-teal-400 to-cyan-500',
  },
  {
    id: 'luxury_tote',
    name: 'บัตรกำนัลส่วนลด',
    description: 'สำหรับร้านค้าที่ร่วมรายการ',
    cost: 8000,
    icon: <Gift size={28} className="text-white" />,
    gradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-gradient-to-br from-purple-400 to-pink-500',
  },
  {
    id: 'plant_tree',
    name: 'บริจาคปลูกป่า',
    description: 'ร่วมปลูกต้นไม้ 1 ต้นในนามของคุณ',
    cost: 10000,
    icon: <Sprout size={28} className="text-white" />,
    gradient: 'from-lime-50 to-green-50',
    borderColor: 'border-lime-200',
    iconBg: 'bg-gradient-to-br from-lime-400 to-green-500',
  },
];

export const POINTS_CONFIG = {
  bottle: 10,
  can: 15,
  glass: 20,
};

export const LEADERBOARD_DATA: LeaderboardUser[] = [
    { id: 1, name: 'สมชาย', points: 15230, tier: 'Diamond' },
    { id: 2, name: 'มานี', points: 12100, tier: 'Diamond' },
    { id: 3, name: 'John C.', points: 9850, tier: 'Platinum' },
    { id: 4, name: 'อารี', points: 8400, tier: 'Platinum' },
    { id: 5, name: 'EcoWarrior', points: 6500, tier: 'Platinum' },
    { id: 6, name: 'ปิติ', points: 4800, tier: 'Gold' },
    { id: 7, name: 'ชูใจ', points: 3550, tier: 'Gold' },
    { id: 8, name: 'GreenThumb', points: 2100, tier: 'Gold' },
    { id: 9, name: 'สมศรี', points: 1800, tier: 'Silver' },
    { id: 10, name: 'มานะ', points: 1250, tier: 'Silver' },
    { id: 11, name: 'RecycleBin', points: 950, tier: 'Silver' },
    { id: 12, name: 'ใจดี', points: 450, tier: 'Bronze' },
];
