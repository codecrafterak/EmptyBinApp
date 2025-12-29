import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { HardwareGuide } from './components/HardwareGuide';
import { Settings } from './pages/Settings';
import { NotificationMenu } from './components/NotificationMenu';
import { Menu, Moon, Sun } from 'lucide-react';
import { UserSettings, Notification, Bin } from './types';
import { subscribeToBins, calculateFillLevel } from './services/mockService';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // App State
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    unit: 'cm',
    notificationsEnabled: true,
    fullThreshold: 80,
    emptyThreshold: 20
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  // To avoid alert spam, track last alerted time per bin per type
  const lastAlerts = useRef<Record<string, number>>({}); 

  // Toggle dark mode class on html element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, [settings.darkMode]);

  // Global monitoring for notifications
  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    const unsubscribe = subscribeToBins((bins) => {
      bins.forEach(bin => {
        const fill = calculateFillLevel(bin.heightCm, bin.currentDistanceCm);
        const now = Date.now();
        const cooldown = 60 * 60 * 1000; // 1 hour cooldown for alerts

        // Check Full Threshold
        if (fill >= settings.fullThreshold) {
          const key = `${bin.id}-full`;
          if (!lastAlerts.current[key] || now - lastAlerts.current[key] > cooldown) {
            addNotification({
              id: Date.now().toString() + Math.random(),
              title: 'Bin Almost Full',
              message: `${bin.name} in ${bin.location} is ${fill}% full.`,
              timestamp: new Date().toISOString(),
              read: false,
              type: 'warning',
              binId: bin.id
            });
            lastAlerts.current[key] = now;
          }
        }

        // Check Empty Threshold (Optional logic, e.g. for "Just emptied")
        // Only trigger "Empty" alert if it was previously full? For simplicity, we just check level.
        if (fill <= settings.emptyThreshold && fill > 5) {
          // Maybe distinct logic or skip "Empty" alerts for now unless critical
        }
      });
    });

    return () => unsubscribe();
  }, [settings]);

  const addNotification = (n: Notification) => {
    setNotifications(prev => [n, ...prev]);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <div className="flex h-screen overflow-hidden">
        {/* Navigation Sidebar */}
        <Navigation 
          currentTab={currentTab} 
          setTab={setCurrentTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 z-10">
            <button 
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <NotificationMenu 
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onClearAll={clearAllNotifications}
                onDismiss={dismissNotification}
              />

              <button 
                onClick={() => handleUpdateSettings({ darkMode: !settings.darkMode })}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 border border-brand-200 dark:border-brand-700 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-xs">
                JD
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {currentTab === 'dashboard' && <Dashboard />}
              {currentTab === 'hardware' && <HardwareGuide />}
              {currentTab === 'settings' && (
                <Settings settings={settings} updateSettings={handleUpdateSettings} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
