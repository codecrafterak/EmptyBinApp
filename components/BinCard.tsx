import React from 'react';
import { Bin } from '../types';
import { calculateFillLevel } from '../services/mockService';
import { AlertCircle, WifiOff, CheckCircle } from 'lucide-react';

interface BinCardProps {
  bin: Bin;
  onClick: (bin: Bin) => void;
}

export const BinCard: React.FC<BinCardProps> = ({ bin, onClick }) => {
  const fillPercentage = calculateFillLevel(bin.heightCm, bin.currentDistanceCm);
  
  // Determine status color
  let statusColor = 'text-green-500';
  let StatusIcon = CheckCircle;
  let borderColor = 'border-gray-200 dark:border-gray-700';

  if (bin.status === 'offline') {
    statusColor = 'text-gray-400';
    StatusIcon = WifiOff;
  } else if (fillPercentage > 80) {
    statusColor = 'text-red-500';
    StatusIcon = AlertCircle;
    borderColor = 'border-red-200 dark:border-red-900';
  } else if (fillPercentage > 50) {
    statusColor = 'text-yellow-500';
  }

  return (
    <div 
      onClick={() => onClick(bin)}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border
        ${borderColor} group relative overflow-hidden
      `}
    >
      {/* Background fill animation hint */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-brand-50 dark:bg-brand-900/10 transition-all duration-1000 ease-out -z-0"
        style={{ height: `${fillPercentage}%` }}
      />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 transition-colors">
              {bin.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bin.location}</p>
          </div>
          <StatusIcon className={`w-5 h-5 ${statusColor}`} />
        </div>

        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {fillPercentage}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">Full</span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              fillPercentage > 80 ? 'bg-red-500' : fillPercentage > 50 ? 'bg-yellow-500' : 'bg-brand-500'
            }`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Capacity: {bin.heightCm}cm</span>
          <span>Reading: {bin.currentDistanceCm}cm</span>
        </div>
      </div>
    </div>
  );
};
