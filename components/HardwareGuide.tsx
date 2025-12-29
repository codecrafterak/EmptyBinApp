import React from 'react';
import { ESP32_CODE_SNIPPET, FIREBASE_RULES_SNIPPET } from '../constants';
import { Copy, Terminal, Database, Cpu } from 'lucide-react';

export const HardwareGuide: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Cpu className="text-brand-500" />
          Hardware Setup
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          To connect your physical bin to this dashboard, you'll need an ESP32 microcontroller and an HC-SR04 ultrasonic sensor.
          Connect the Sensor Trig to Pin 5 and Echo to Pin 18.
        </p>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              ESP32 / Arduino Sketch
            </h3>
            <button 
              onClick={() => copyToClipboard(ESP32_CODE_SNIPPET)}
              className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
            >
              <Copy className="w-3 h-3" /> Copy Code
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm font-mono text-gray-300">
              <code>{ESP32_CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Firebase Realtime Database Rules
            </h3>
            <button 
              onClick={() => copyToClipboard(FIREBASE_RULES_SNIPPET)}
              className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
            >
              <Copy className="w-3 h-3" /> Copy Rules
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm font-mono text-gray-300">
              <code>{FIREBASE_RULES_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
