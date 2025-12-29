import { Bin, Reading } from '../types';
import { MOCK_BINS_DATA } from '../constants';

/* 
 * FIREBASE IMPLEMENTATION REFERENCE
 * 
 * To switch to real Firebase:
 * 1. Install firebase: npm install firebase
 * 2. Initialize app with config
 * 
 * export const subscribeToBins = (cb) => {
 *   const db = getDatabase();
 *   const binsRef = ref(db, 'bins');
 *   return onValue(binsRef, (snapshot) => {
 *     const data = snapshot.val();
 *     const list = data ? Object.keys(data).map(k => ({...data[k], id: k})) : [];
 *     cb(list);
 *   });
 * }
 * 
 * export const updateBinLocation = (id, loc) => update(ref(db, `bins/${id}`), { location: loc });
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