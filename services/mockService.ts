import { Bin, Reading } from '../types';
import { MOCK_BINS_DATA } from '../constants';

/* 
 * FIREBASE IMPLEMENTATION REFERENCE
 * ... (omitted for brevity, same as before)
 */

// --- MOCK REAL-TIME IMPLEMENTATION ---

export const calculateFillLevel = (binHeight: number, currentDist: number): number => {
  if (binHeight <= 0) return 0;
  const validDist = Math.max(0, Math.min(currentDist, binHeight));
  const fill = ((binHeight - validDist) / binHeight) * 100;
  return Math.round(fill);
};

// Initial state
let currentBins: Bin[] = MOCK_BINS_DATA.map(bin => {
  // Generate initial history
  const history: Reading[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const fillP = Math.random() * 80;
    const dist = bin.heightCm - (bin.heightCm * (fillP / 100));
    history.push({
      timestamp: time.toISOString(),
      distanceCm: Math.round(dist),
      fillPercentage: Math.round(fillP),
    });
  }
  return { 
    ...bin, 
    status: bin.status as Bin['status'],
    history, 
    currentDistanceCm: history[history.length - 1].distanceCm 
  };
});

let listeners: ((bins: Bin[]) => void)[] = [];
let simulationInterval: any = null;

const startSimulation = () => {
  if (simulationInterval) return;
  
  simulationInterval = setInterval(() => {
    // Update bins with random new data to simulate sensors
    currentBins = currentBins.map(bin => {
      // 10% chance to update this specific bin in this tick
      if (Math.random() > 0.3) {
        // Simulate a small change in fill level
        const change = (Math.random() * 6) - 2; // -2 to +4 cm change
        let newDist = Math.max(0, Math.min(bin.heightCm, bin.currentDistanceCm - change)); // minus change because dist decreases as bin fills
        
        // Sometimes empty the bin (sudden large distance)
        if (Math.random() > 0.98) {
           newDist = bin.heightCm * 0.95; // 5% full
        }

        const newFill = calculateFillLevel(bin.heightCm, newDist);
        
        // Add new reading
        const newReading: Reading = {
          timestamp: new Date().toISOString(),
          distanceCm: Math.round(newDist),
          fillPercentage: newFill
        };

        // Keep last 50 readings
        const newHistory = [...bin.history.slice(1), newReading];

        return {
          ...bin,
          currentDistanceCm: Math.round(newDist),
          history: newHistory,
          lastUpdated: new Date().toISOString()
        };
      }
      return bin;
    });

    notifyListeners();
  }, 2500); // Updates every 2.5 seconds
};

const notifyListeners = () => {
  listeners.forEach(listener => listener([...currentBins]));
};

export const subscribeToBins = (callback: (bins: Bin[]) => void) => {
  listeners.push(callback);
  
  // Start data stream if not running
  if (!simulationInterval) {
    startSimulation();
  }
  
  // Send immediate initial data
  callback([...currentBins]);

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

export const updateBinLocation = async (binId: string, newLocation: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  currentBins = currentBins.map(b => 
    b.id === binId ? { ...b, location: newLocation } : b
  );
  notifyListeners();
  return true;
};

// --- DATA EXPORT & ANALYSIS UTILS ---

export const generateCSV = (bin: Bin): string => {
  const headers = ['Timestamp', 'Date', 'Time', 'Distance (cm)', 'Fill Percentage (%)'];
  const rows = bin.history.map(r => {
    const d = new Date(r.timestamp);
    return [
      r.timestamp,
      d.toLocaleDateString(),
      d.toLocaleTimeString(),
      r.distanceCm.toFixed(2),
      r.fillPercentage.toFixed(2)
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (bin: Bin) => {
  const csvContent = generateCSV(bin);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${bin.name.replace(/\s+/g, '_')}_history.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Mock function to provide broader context to Gemini
export const getMockWeeklyStats = (bin: Bin) => {
  return {
    averageFillRate: Math.round(Math.random() * 5 + 2) + '% per hour',
    peakDay: ['Monday', 'Tuesday', 'Friday', 'Saturday'][Math.floor(Math.random() * 4)],
    peakHour: Math.floor(Math.random() * 12 + 8) + ':00',
    collectionEfficiency: 'Medium'
  };
};
