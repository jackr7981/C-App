import React, { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Notification } from '../types';

interface Props {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationCenter: React.FC<Props> = ({ notifications, onMarkRead, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 relative text-gray-400 hover:text-ocean transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-navy">Notifications</h3>
              {notifications.length > 0 && (
                <button onClick={onClearAll} className="text-xs text-gray-500 hover:text-ocean">
                  Clear All
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                      onClick={() => onMarkRead(notif.id)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${notif.type === 'alert' ? 'text-red-600' : 'text-navy'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {new Date(notif.timestamp).toLocaleTimeString()} • {new Date(notif.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;