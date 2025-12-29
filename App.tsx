import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { HardwareGuide } from './components/HardwareGuide';
import { Menu, Moon, Sun } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode class on html element
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
                <div className="text-center py-20">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
                  <p className="text-gray-500">Configure notifications, user accounts, and global thresholds here.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
