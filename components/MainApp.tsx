import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useUser } from '../App';
import { type Screen, type Activity, type Reward, type ScanResult, type DetectedObject, type LeaderboardUser, type User } from '../types';
import { TIERS, TIERS_ARRAY, REWARDS, POINTS_CONFIG, LEADERBOARD_DATA } from '../constants';
import { useObjectDetection } from '../hooks/useObjectDetection';
import getEcoTip from '../services/geminiService';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Home, Camera, Gift, Star, Recycle, Trophy, LogOut, X, CheckCircle2, Bot, Info, Package, GlassWater, Trash2, UserRound, Save, Check, Crown, BarChart } from 'lucide-react';

// Reusable Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
                        <div>{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; }> = ({ label, value, icon }) => (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-4">
        <div className="bg-slate-100 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-slate-600 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-800">
                {value}
            </p>
        </div>
    </div>
);

const TierProgressBar: React.FC = () => {
    const { currentUser } = useUser();
    if (!currentUser) return null;

    const currentTier = TIERS[currentUser.tier];
    const nextTierIndex = TIERS_ARRAY.findIndex(t => t.name === currentTier.name) + 1;
    const nextTier = nextTierIndex < TIERS_ARRAY.length ? TIERS_ARRAY[nextTierIndex] : null;
    
    const progress = nextTier ? Math.max(0, (currentUser.points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-slate-700">ระดับ: {currentTier.name}</p>
                {nextTier && <p className="text-sm text-slate-500">ไปต่อ: {nextTier.name}</p>}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <motion.div
                    className={`h-2.5 rounded-full ${currentTier.class}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
            <p className="text-right text-sm text-slate-500 mt-1">
                {currentUser.points.toLocaleString()} / {nextTier ? nextTier.min.toLocaleString() : 'Max'} คะแนน
            </p>
        </div>
    );
};

// ####################
// ### SCREENS      ###
// ####################

const DashboardScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, logout } = useUser();
    if (!currentUser) return null;

    const totalItems = currentUser.totalBottles + currentUser.totalCans + currentUser.totalGlass;

    return (
        <div className="space-y-6">
            {/* User Header */}
            <div className="flex justify-between items-center">
                 <div>
                     <p className="text-lg md:text-xl font-semibold text-slate-800">สวัสดี, {currentUser.name}</p>
                     <p className="text-sm text-slate-500">ยินดีต้อนรับกลับมา!</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onNavigate('profile')} className="p-2 text-slate-500 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-colors">
                        <UserRound size={20} />
                    </button>
                    <button onClick={logout} className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
            
            <TierProgressBar />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard label="คะแนนสะสม" value={currentUser.points.toLocaleString()} icon={<Star size={24} className="text-yellow-500"/>} />
                <StatCard label="ของที่รีไซเคิล" value={totalItems.toLocaleString()} icon={<Recycle size={24} className="text-green-500"/>} />
            </div>

            {/* Quick Actions */}
             <div className="grid grid-cols-3 gap-3 md:gap-4">
                <QuickActionCard onClick={() => onNavigate('scan')} icon={<Camera size={24} />} label="สแกน" color="blue" />
                <QuickActionCard onClick={() => onNavigate('rewards')} icon={<Gift size={24} />} label="แลกรางวัล" color="purple" />
                <QuickActionCard onClick={() => onNavigate('leaderboard')} icon={<Trophy size={24} />} label="ตารางผู้นำ" color="amber" />
            </div>


            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">กิจกรรมล่าสุด</h3>
                <div className="space-y-2">
                    {currentUser.history.length > 0 ? currentUser.history.slice(0, 5).map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                    )) : (
                        <div className="text-center py-8 text-slate-500">
                             <BarChart size={40} className="mx-auto mb-2 text-slate-400" />
                             <p>ยังไม่มีกิจกรรม</p>
                             <p className="text-sm">เริ่มสแกนเพื่อสะสมคะแนนได้เลย!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScanScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, addActivityAndUpdateUser } = useUser();
    const { model, isLoading, detectObjects } = useObjectDetection();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [view, setView] = useState<'idle' | 'scanning' | 'summary'>('idle');
    const [scanResult, setScanResult] = useState<ScanResult>({ bottles: 0, cans: 0, glass: 0 });
    const [summaryData, setSummaryData] = useState<{points: number; tip: string; result: ScanResult} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const earnedPoints = useMemo(() => 
        (scanResult.bottles * POINTS_CONFIG.bottle) + 
        (scanResult.cans * POINTS_CONFIG.can) + 
        (scanResult.glass * POINTS_CONFIG.glass),
    [scanResult]);

    const runDetection = useCallback(async () => {
        if (view !== 'scanning' || !model || !videoRef.current) return;
        
        const predictions = await detectObjects(videoRef.current);
        const newResult: ScanResult = { bottles: 0, cans: 0, glass: 0 };
        predictions.forEach(p => {
            const className = p.class.toLowerCase();
            if (p.score > 0.6) { // Increased confidence threshold
                if (className.includes('bottle')) newResult.bottles++;
                else if (className === 'can') newResult.cans++;
                else if (className.includes('cup') || className.includes('glass')) newResult.glass++;
            }
        });
        setScanResult(newResult);
        requestAnimationFrame(runDetection);
    }, [view, model, detectObjects]);

    useEffect(() => {
        if (view === 'scanning') {
           const animationFrame = requestAnimationFrame(runDetection);
           return () => cancelAnimationFrame(animationFrame);
        }
    }, [view, runDetection]);

    const startCamera = async () => {
        if (!videoRef.current) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } });
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
                setView('scanning');
            };
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleConfirm = async () => {
        if (earnedPoints === 0 || !currentUser) {
            alert("ไม่พบวัตถุที่สามารถรีไซเคิลได้");
            return;
        }

        setIsProcessing(true);
        setView('summary');
        stopCamera();

        const tierBonus = TIERS[currentUser.tier].bonus;
        const finalPoints = Math.round(earnedPoints * tierBonus);
        
        const activityDescription = [
            scanResult.bottles > 0 ? `${scanResult.bottles} ขวด` : '',
            scanResult.cans > 0 ? `${scanResult.cans} กระป๋อง` : '',
            scanResult.glass > 0 ? `${scanResult.glass} แก้ว` : '',
        ].filter(Boolean).join(', ');

        addActivityAndUpdateUser({
            description: `สแกน: ${activityDescription}`,
            points: finalPoints,
            type: 'earn'
        }, scanResult);
        
        setSummaryData({ points: finalPoints, tip: '', result: scanResult });
        
        const tip = await getEcoTip(scanResult);
        setSummaryData(prev => prev ? { ...prev, tip } : null);
        setIsProcessing(false);
    };
    
    const handleReset = () => {
        setScanResult({ bottles: 0, cans: 0, glass: 0 });
        setSummaryData(null);
        setView('idle');
    };
    
    if (view === 'summary' && summaryData) {
        return (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-2xl shadow-lg p-6 text-center space-y-6">
                <motion.div initial={{scale:0.5}} animate={{scale:1}} transition={{type: 'spring', delay: 0.2}}>
                    <CheckCircle2 size={60} className="mx-auto text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800">สแกนสำเร็จ!</h2>
                
                <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.4}} className="bg-slate-100 p-4 rounded-xl">
                    <p className="text-slate-600">คุณได้รับ</p>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">{summaryData.points.toLocaleString()} คะแนน</p>
                </motion.div>
                
                <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.6}} className="text-left bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-4">
                     <div className="flex items-center space-x-2">
                        <Bot size={24} className="text-blue-600 flex-shrink-0" />
                        <h3 className="font-bold text-blue-800">เคล็ดลับรักษ์โลก</h3>
                    </div>
                    {isProcessing ? (
                         <div className="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
                    ) : (
                         <p className="text-blue-900">{summaryData.tip}</p>
                    )}
                </motion.div>

                <motion.button 
                    initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.8}}
                    onClick={() => onNavigate('dashboard')} 
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
                    กลับไปหน้าหลัก
                </motion.button>
            </motion.div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4">
             <div className="flex items-center justify-between mb-4 px-2 pt-2 sm:px-0 sm:pt-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">สแกนเพื่อรีไซเคิล</h2>
                <button onClick={() => { stopCamera(); onNavigate('dashboard'); }} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="relative mb-4 overflow-hidden rounded-lg aspect-[3/4] sm:aspect-video">
                <video ref={videoRef} className="w-full h-full bg-slate-900 object-cover" autoPlay muted playsInline></video>
                
                <AnimatePresence>
                {view === 'scanning' &&
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0">
                        <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none"><div className="scan-line"></div></div>
                        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg">
                            <div className="flex justify-around text-center">
                                <div><GlassWater className="mx-auto text-green-400" /><div className="font-bold text-lg">{scanResult.bottles}</div></div>
                                <div><Package className="mx-auto text-blue-400" /><div className="font-bold text-lg">{scanResult.cans}</div></div>
                                <div><Trash2 className="mx-auto text-purple-400" /><div className="font-bold text-lg">{scanResult.glass}</div></div>
                            </div>
                        </div>
                    </motion.div>
                }
                </AnimatePresence>
            </div>
            
            {view === 'idle' && (
                <button onClick={startCamera} disabled={isLoading} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 transition-all shadow-lg hover:shadow-xl">
                    {isLoading ? 'กำลังโหลด AI...' : <><Camera /><span>เริ่มสแกน</span></> }
                </button>
            )}

            {view === 'scanning' && (
                 <div className="flex space-x-4">
                    <button onClick={() => { stopCamera(); setView('idle'); }} className="flex-1 bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md">หยุด</button>
                    <button onClick={handleConfirm} disabled={earnedPoints === 0} className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md">ยืนยัน</button>
                </div>
            )}
        </div>
    );
};

const RewardsScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, addActivityAndUpdateUser } = useUser();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', success: true});

    const handleRedeem = (reward: Reward) => {
        if (currentUser && currentUser.points >= reward.cost) {
            addActivityAndUpdateUser({
                description: `แลกรางวัล: ${reward.name}`,
                points: -reward.cost,
                type: 'redeem'
            });
            setModalContent({title: 'แลกรางวัลสำเร็จ!', message: `คุณได้แลก "${reward.name}" สำเร็จแล้ว!`, success: true});
        } else {
            setModalContent({title: 'คะแนนไม่เพียงพอ', message: `คุณต้องการ ${reward.cost.toLocaleString()} คะแนนเพื่อแลกรางวัลนี้`, success: false});
        }
        setModalOpen(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
             <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalContent.title}>
                 <div className="flex items-start space-x-3">
                    {modalContent.success ? <CheckCircle2 className="text-green-500 mt-1"/> : <Info className="text-red-500 mt-1"/> }
                    <p className="text-slate-600">{modalContent.message}</p>
                 </div>
                 <button onClick={() => setModalOpen(false)} className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">ตกลง</button>
            </Modal>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">แลกรางวัล</h2>
                <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
            </div>
            <div className="text-center mb-6 bg-slate-100 p-3 rounded-xl">
                 <p className="text-slate-600">คะแนนของคุณ</p>
                 <p className="font-bold text-blue-600 text-2xl">{currentUser?.points.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REWARDS.sort((a,b) => a.cost - b.cost).map(reward => (
                    <RewardCard key={reward.id} reward={reward} onRedeem={handleRedeem} userPoints={currentUser?.points || 0} />
                ))}
            </div>
        </div>
    );
};

const ProfileScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, updateUserName } = useUser();
    const [name, setName] = useState(currentUser?.name || '');
    const [isSaved, setIsSaved] = useState(false);

    if (!currentUser) return null;

    const handleSave = () => {
        if(name.trim() === '') {
            alert('ชื่อที่แสดงผลต้องไม่ว่างเปล่า');
            return;
        }
        updateUserName(name.trim());
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">โปรไฟล์ของฉัน</h2>
                <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">ชื่อที่แสดง</label>
                    <input 
                        id="displayName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="ชื่อของคุณ"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">หมายเลขโทรศัพท์</label>
                    <p className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">{currentUser.phone}</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">สมาชิกตั้งแต่</label>
                    <p className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">{formatDate(currentUser.joinDate)}</p>
                </div>
            </div>

            <button 
                onClick={handleSave} 
                disabled={name === currentUser.name || isSaved}
                className={`w-full flex items-center justify-center space-x-2 text-white py-3 rounded-lg font-semibold transition-all shadow-md ${isSaved ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'}`}
            >
                {isSaved ? <Check size={20}/> : <Save size={20}/>}
                <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกการเปลี่ยนแปลง'}</span>
            </button>
        </div>
    );
};

const LeaderboardScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser } = useUser();

    const leaderboardWithCurrentUser = useMemo(() => {
        if (!currentUser) return LEADERBOARD_DATA;
        
        const userInLeaderboard = LEADERBOARD_DATA.find(u => u.name === currentUser.name);
        if (userInLeaderboard) {
            return LEADERBOARD_DATA.map(u => u.name === currentUser.name ? { ...currentUser, id: u.id, tier: currentUser.tier } : u)
                                   .sort((a, b) => b.points - a.points);
        }
        
        const fullList = [...LEADERBOARD_DATA, { id: 99, ...currentUser }];
        return fullList.sort((a, b) => b.points - a.points);

    }, [currentUser]);

    const currentUserRank = currentUser ? leaderboardWithCurrentUser.findIndex(u => u.name === currentUser.name) + 1 : null;
    
    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">ตารางผู้นำ</h2>
                <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-3">
                {leaderboardWithCurrentUser.map((user, index) => (
                     <LeaderboardItem key={user.id} user={user} rank={index + 1} isCurrentUser={currentUser?.name === user.name} />
                ))}
            </div>

            {currentUser && currentUserRank && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl md:max-w-3xl lg:max-w-4xl px-4">
                     <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl shadow-2xl p-3">
                         <LeaderboardItem user={{...currentUser, id: 99}} rank={currentUserRank} isCurrentUser={true} />
                     </div>
                </div>
            )}
        </div>
    );
};

// ####################
// ### CHILD COMPONENTS ###
// ####################

const QuickActionCard: React.FC<{onClick: () => void; icon: React.ReactNode; label: string; color: string}> = ({onClick, icon, label, color}) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600 text-white',
        purple: 'from-purple-500 to-purple-600 text-white',
        amber: 'from-amber-500 to-amber-600 text-white',
    }
    return (
        <button onClick={onClick} className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-lg p-4 h-full hover:opacity-90 transition-all group flex flex-col items-center justify-center text-center`}>
            <div className="mb-2 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-sm md:text-base font-bold">{label}</h3>
        </button>
    );
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const isEarn = activity.type === 'earn';

    return (
        <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 ${isEarn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} rounded-full flex items-center justify-center`}>
                    {isEarn ? <Recycle size={20} /> : <Gift size={20}/>}
                </div>
                <div>
                    <p className="font-semibold text-slate-800 text-sm sm:text-base">{activity.description}</p>
                    <p className="text-xs text-slate-500">{formatDate(activity.timestamp)}</p>
                </div>
            </div>
            <span className={`font-semibold text-sm ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                {activity.points > 0 ? '+' : ''}{activity.points.toLocaleString()}
            </span>
        </div>
    );
};

const RewardCard: React.FC<{ reward: Reward; onRedeem: (reward: Reward) => void; userPoints: number }> = ({ reward, onRedeem, userPoints }) => {
    const canAfford = userPoints >= reward.cost;
    return (
        <div className={`bg-gradient-to-br ${reward.gradient} rounded-xl p-4 border ${reward.borderColor} flex items-center space-x-4`}>
            <div className={`w-16 h-16 ${reward.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>{reward.icon}</div>
            <div className="flex-grow">
                 <h3 className="font-bold text-slate-800 text-base">{reward.name}</h3>
                 <p className="text-xs text-slate-600 mt-1">{reward.description}</p>
                 <div className="text-base font-bold text-blue-600 mt-2">{reward.cost.toLocaleString()} คะแนน</div>
            </div>
            <button onClick={() => onRedeem(reward)} disabled={!canAfford} className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all shadow">
                {canAfford ? 'แลก' : 'ไม่พอ'}
            </button>
        </div>
    );
};

const LeaderboardItem: React.FC<{user: LeaderboardUser | User; rank: number; isCurrentUser: boolean}> = ({ user, rank, isCurrentUser }) => {
    const rankColors = {
        1: 'bg-amber-400 text-white',
        2: 'bg-slate-400 text-white',
        3: 'bg-amber-600 text-white'
    };
    
    const rankIcon = {
        1: <Crown size={16} className="text-amber-300" />,
        2: <Crown size={16} className="text-slate-300" />,
        3: <Crown size={16} className="text-yellow-700" />,
    };

    const tier = TIERS[user.tier];

    return (
        <div className={`flex items-center p-3 rounded-lg transition-all ${isCurrentUser ? 'bg-blue-50 border-2 border-blue-500 scale-105 shadow-lg' : 'bg-slate-50'}`}>
            <div className="flex items-center space-x-3 w-1/2">
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rankColors[rank] || 'bg-slate-200 text-slate-600'}`}>{rank}</span>
                <div className="flex items-center space-x-2 overflow-hidden">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${tier.class}`}></div>
                    <span className="font-bold text-slate-800 truncate">{user.name}</span>
                </div>
            </div>
            <div className="flex-grow text-right flex items-center justify-end space-x-2">
                 {rankIcon[rank]}
                 <span className="font-bold text-slate-700 text-sm md:text-base">{user.points.toLocaleString()}</span>
            </div>
        </div>
    )
}

const BottomNav: React.FC<{ activeScreen: Screen; onNavigate: (screen: Screen) => void; }> = ({ activeScreen, onNavigate }) => {
    const navItems = [
        { id: 'dashboard', icon: Home, label: 'หน้าหลัก' },
        { id: 'scan', icon: Camera, label: 'สแกน' },
        { id: 'rewards', icon: Gift, label: 'รางวัล' },
    ] as const;

    // Do not show nav on leaderboard screen to avoid clutter with sticky user rank component
    if(activeScreen === 'leaderboard') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg border-t border-slate-200 m-4 rounded-xl shadow-2xl shadow-slate-300/30">
                <LayoutGroup>
                <div className="flex justify-around">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => onNavigate(item.id)}
                            className={`relative flex flex-col items-center py-2.5 px-4 transition-colors duration-200 w-full ${activeScreen === item.id ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'}`}>
                            <item.icon size={24} />
                            <span className="text-xs font-medium mt-1">{item.label}</span>
                             {activeScreen === item.id && <motion.div layoutId="active-nav-indicator" className="absolute bottom-0 h-1 w-8 bg-blue-600 rounded-full"></motion.div>}
                        </button>
                    ))}
                </div>
                </LayoutGroup>
            </div>
        </div>
    );
};


// ####################
// ### MAIN COMPONENT ###
// ####################

const MainApp: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');

    const renderScreen = () => {
        switch (activeScreen) {
            case 'scan':
                return <ScanScreen onNavigate={setActiveScreen} />;
            case 'rewards':
                return <RewardsScreen onNavigate={setActiveScreen} />;
            case 'profile':
                return <ProfileScreen onNavigate={setActiveScreen} />;
            case 'leaderboard':
                return <LeaderboardScreen onNavigate={setActiveScreen} />;
            case 'dashboard':
            default:
                return <DashboardScreen onNavigate={setActiveScreen} />;
        }
    };

    return (
        <div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderScreen()}
                </motion.div>
            </AnimatePresence>
            <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
        </div>
    );
};

export default MainApp;