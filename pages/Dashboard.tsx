import React, { useState, useEffect } from 'react';
import { Bin } from '../types';
import { subscribeToBins, calculateFillLevel, updateBinLocation, downloadCSV } from '../services/mockService';
import { analyzeBinData } from '../services/geminiService';
import { BinCard } from '../components/BinCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { RefreshCw, Sparkles, X, Activity, Edit2, Check, MapPin, Download } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [loading, setLoading] = useState(true);
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  // Editing State
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [tempLocation, setTempLocation] = useState("");
  const [isSavingLoc, setIsSavingLoc] = useState(false);

  // 1. Real-time Subscription
  useEffect(() => {
    const unsubscribe = subscribeToBins((updatedBins) => {
      setBins(updatedBins);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Keep Selected Bin synchronized with real-time updates
  useEffect(() => {
    if (selectedBin) {
      const updated = bins.find(b => b.id === selectedBin.id);
      if (updated) {
        // Only update non-UI transient state to avoid disrupting editing
        setSelectedBin(prev => ({ ...updated, ...prev, ...updated }));
      }
    }
  }, [bins]);

  const handleAnalyze = async () => {
    if (!selectedBin) return;
    setAnalyzing(true);
    const result = await analyzeBinData(selectedBin);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const startEditingLocation = () => {
    if (selectedBin) {
      setTempLocation(selectedBin.location);
      setIsEditingLoc(true);
    }
  };

  const saveLocation = async () => {
    if (!selectedBin) return;
    setIsSavingLoc(true);
    await updateBinLocation(selectedBin.id, tempLocation);
    setIsSavingLoc(false);
    setIsEditingLoc(false);
  };

  if (loading && bins.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Circular Progress Calculation
  const getCircularProps = (percentage: number) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return { radius, circumference, offset };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Dashboard
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Real-time waste monitoring levels</p>
        </div>
      </div>

      {/* Grid of Bins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bins.map(bin => (
          <BinCard key={bin.id} bin={bin} onClick={setSelectedBin} />
        ))}
      </div>

      {/* Selected Bin Detail Modal */}
      {selectedBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedBin.name}</h3>
                
                {/* Location Editor */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {isEditingLoc ? (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in">
                      <input 
                        value={tempLocation}
                        onChange={(e) => setTempLocation(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Enter location"
                        autoFocus
                      />
                      <button 
                        onClick={saveLocation}
                        disabled={isSavingLoc}
                        className="p-1 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded hover:bg-brand-200 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setIsEditingLoc(false)}
                        className="p-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditingLocation}>
                      <span>{selectedBin.location}</span>
                      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => downloadCSV(selectedBin)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors font-medium mr-2"
                  title="Download CSV Data"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button 
                  onClick={() => { setSelectedBin(null); setAiAnalysis(""); setIsEditingLoc(false); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Circular Progress Section */}
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                  {(() => {
                    const fillPercentage = calculateFillLevel(selectedBin.heightCm, selectedBin.currentDistanceCm);
                    const { radius, circumference, offset } = getCircularProps(fillPercentage);
                    const colorClass = fillPercentage > 80 ? 'text-red-500' : fillPercentage > 50 ? 'text-yellow-500' : 'text-brand-500';
                    
                    return (
                      <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90">
                          {/* Background Circle */}
                          <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          {/* Progress Circle */}
                          <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className={`${colorClass} transition-all duration-1000 ease-out`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-4xl font-bold ${colorClass.replace('text-', 'text-gray-900 dark:text-')}`}>
                            {fillPercentage}%
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">FULL</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="mt-4 grid grid-cols-2 gap-8 text-center w-full max-w-xs">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Capacity</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedBin.heightCm} cm</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Reading</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedBin.currentDistanceCm} cm</p>
                    </div>
                  </div>
                </div>

                {/* AI & Status Column */}
                <div className="space-y-6">
                  <div className="bg-brand-50 dark:bg-brand-900/10 rounded-xl p-6 border border-brand-100 dark:border-brand-900/30">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-500" />
                        Data & Insights
                      </h4>
                      {!aiAnalysis && (
                        <button 
                          onClick={handleAnalyze}
                          disabled={analyzing}
                          className="px-3 py-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white rounded-md transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {analyzing ? 'Thinking...' : 'Generate Analysis'}
                        </button>
                      )}
                    </div>
                    
                    {analyzing ? (
                       <div className="space-y-3 animate-pulse">
                         <div className="h-2 bg-brand-200 dark:bg-brand-800 rounded w-full"></div>
                         <div className="h-2 bg-brand-200 dark:bg-brand-800 rounded w-5/6"></div>
                         <div className="h-2 bg-brand-200 dark:bg-brand-800 rounded w-4/6"></div>
                       </div>
                    ) : aiAnalysis ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                         <ul className="list-none space-y-2">
                           {aiAnalysis.split('\n').filter(l => l.trim()).map((line, i) => (
                             <li key={i} className="text-sm text-brand-800 dark:text-brand-200 flex gap-2">
                               <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span>
                               {line.replace(/^- /, '').replace(/^\d\.\s/, '')}
                             </li>
                           ))}
                         </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-brand-600/70 dark:text-brand-400/70">
                        View AI-generated usage patterns, peak filling times, and schedule optimizations based on weekly history.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-time Chart */}
              <div className="h-72 w-full pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-500" />
                  Real-time Fill History
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedBin.history}>
                    <defs>
                      <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      stroke="#9CA3AF"
                      fontSize={11}
                      tickMargin={10}
                      minTickGap={30}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="fillPercentage" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorFill)" 
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
