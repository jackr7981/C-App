import React from 'react';
import { Utensils, Home, User as UserIcon, LogOut } from 'lucide-react';
import { User, Notification } from '../types';
import NotificationCenter from './NotificationCenter';

interface Props {
  children: React.ReactNode;
  user: User;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearNotifications: () => void;
  onLogout: () => void;
  currentTab: 'home' | 'menu' | 'profile';
  setTab: (t: 'home' | 'menu' | 'profile') => void;
}

const Layout: React.FC<Props> = ({ 
  children, user, notifications, onMarkRead, onClearNotifications, 
  onLogout, currentTab, setTab 
}) => {
  return (
    <div className="min-h-screen bg-soft flex flex-col relative">
      <header className="bg-white shadow-sm px-4 sm:px-6 py-4 sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-xl font-bold text-ocean flex items-center gap-2">
            <Utensils className="w-6 h-6" /> CrewMeal
        </h1>
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-navy">{user.name}</p>
                <p className="text-xs text-gray-500">
                    {user.role === 'admin' ? 'System Admin' : 
                     user.role === 'officer' ? 'Officer Mode' :
                     user.role === 'galley' ? 'Galley Staff' : 'Crew Member'}
                </p>
            </div>
            
            {/* Notification Center */}
            <NotificationCenter 
              notifications={notifications}
              onMarkRead={onMarkRead}
              onClearAll={onClearNotifications}
            />

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500" title="Logout">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto md:max-w-2xl lg:max-w-4xl z-0">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-20 pb-safe">
        <button 
            onClick={() => setTab('home')}
            className={`flex flex-col items-center gap-1 ${currentTab === 'home' ? 'text-ocean' : 'text-gray-400'}`}
        >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
            onClick={() => setTab('menu')}
            className={`flex flex-col items-center gap-1 ${currentTab === 'menu' ? 'text-ocean' : 'text-gray-400'}`}
        >
            <Utensils className="w-6 h-6" />
            <span className="text-[10px] font-bold">Menu</span>
        </button>
        <button 
            onClick={() => setTab('profile')}
            className={`flex flex-col items-center gap-1 ${currentTab === 'profile' ? 'text-ocean' : 'text-gray-400'}`}
        >
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;