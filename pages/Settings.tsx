import React from 'react';
import { UserSettings } from '../types';
import { Bell, Moon, Smartphone, Mail, Save, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, updateSettings }) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your preferences and alert configurations.</p>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-lg text-brand-600 dark:text-brand-400">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Enable Alerts</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive in-app push notifications</p>
            </div>
            <button 
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                ${settings.notificationsEnabled ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <span className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Full Threshold (%)
               </label>
               <div className="relative">
                 <input 
                   type="number" 
                   min="50" max="100"
                   value={settings.fullThreshold}
                   onChange={(e) => updateSettings({ fullThreshold: Number(e.target.value) })}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                 />
                 <span className="absolute right-3 top-2.5 text-xs text-gray-500">%</span>
               </div>
               <p className="text-xs text-gray-500 mt-1">Alert when bin exceeds this level.</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Empty Threshold (%)
               </label>
               <div className="relative">
                 <input 
                   type="number" 
                   min="0" max="50"
                   value={settings.emptyThreshold}
                   onChange={(e) => updateSettings({ emptyThreshold: Number(e.target.value) })}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                 />
                 <span className="absolute right-3 top-2.5 text-xs text-gray-500">%</span>
               </div>
               <p className="text-xs text-gray-500 mt-1">Alert when bin is below this level.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Account / General Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">App Preferences</h3>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-3">
                 <Moon className="w-5 h-5 text-gray-500" />
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
              </div>
              <button 
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className={`
                  text-xs font-medium px-3 py-1 rounded-full border transition-colors
                  ${settings.darkMode 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-600 border-gray-200'}
                `}
              >
                {settings.darkMode ? 'On' : 'Off'}
              </button>
           </div>
           
           <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                 <Mail className="w-5 h-5 text-gray-500" />
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Email Reports</span>
              </div>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded">Coming Soon</span>
           </div>
        </div>
      </div>

      <div className="flex justify-end">
         <button className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-all active:scale-95">
            <Save className="w-4 h-4" />
            Save Changes
         </button>
      </div>
    </div>
  );
};
