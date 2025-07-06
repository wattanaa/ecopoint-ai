import React, { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react';
import LoginScreen from './components/LoginScreen';
import MainApp from './components/MainApp';
import { type User, type Activity, type TierName } from './types';
import { TIERS } from './constants';

interface UserContextType {
  currentUser: User | null;
  login: (phone: string) => void;
  logout: () => void;
  addActivityAndUpdateUser: (activity: Omit<Activity, 'id' | 'timestamp'>, scanResult?: {bottles?: number, cans?: number, glass?: number}) => void;
  updateUserName: (name: string) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const calculateTier = (points: number): TierName => {
    for (const tier of Object.values(TIERS)) {
        if (points >= tier.min && points <= tier.max) {
            return tier.name;
        }
    }
    return 'Bronze';
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('ecoPointUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('ecoPointUser');
    }
  }, []);

  const login = useCallback((phone: string) => {
    const newUser: User = {
      name: 'นักรักษ์โลก',
      phone,
      points: 100, // Welcome bonus
      totalBottles: 0,
      totalCans: 0,
      totalGlass: 0,
      tier: 'Bronze',
      history: [{
        id: Date.now(),
        description: 'ยินดีต้อนรับสมาชิกใหม่!',
        points: 100,
        timestamp: new Date().toISOString(),
        type: 'earn'
      }],
      joinDate: new Date().toISOString()
    };
    localStorage.setItem('ecoPointUser', JSON.stringify(newUser));
    setCurrentUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ecoPointUser');
    setCurrentUser(null);
  }, []);

  const addActivityAndUpdateUser = useCallback((activityInfo: Omit<Activity, 'id' | 'timestamp'>, scanResult?: {bottles?: number, cans?: number, glass?: number}) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;

      const newActivity: Activity = {
        ...activityInfo,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };
      
      const updatedUser: User = {
        ...prevUser,
        points: prevUser.points + activityInfo.points,
        totalBottles: prevUser.totalBottles + (scanResult?.bottles || 0),
        totalCans: prevUser.totalCans + (scanResult?.cans || 0),
        totalGlass: prevUser.totalGlass + (scanResult?.glass || 0),
        history: [newActivity, ...prevUser.history.slice(0, 49)],
      };

      updatedUser.tier = calculateTier(updatedUser.points);
      localStorage.setItem('ecoPointUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);
  
  const updateUserName = useCallback((name: string) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, name };
      localStorage.setItem('ecoPointUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const contextValue = useMemo(() => ({
    currentUser,
    login,
    logout,
    addActivityAndUpdateUser,
    updateUserName,
  }), [currentUser, login, logout, addActivityAndUpdateUser, updateUserName]);

  return (
    <UserContext.Provider value={contextValue}>
      <main className="max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto p-4 pb-28">
          {currentUser ? <MainApp /> : <LoginScreen />}
      </main>
    </UserContext.Provider>
  );
};

export default App;