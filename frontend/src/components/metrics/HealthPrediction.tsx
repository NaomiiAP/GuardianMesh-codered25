import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { HealthPrediction } from '../../types/node';

interface HealthPredictionProps {
  predictions: HealthPrediction[];
}

export function HealthPredictionCard({ predictions }: HealthPredictionProps) {
  const sortedPredictions = [...predictions].sort((a, b) => b.risk - a.risk);
  const highestRisk = sortedPredictions[0];

  if (!highestRisk) return null;

  const getRiskColor = (risk: number) => {
    if (risk > 0.7) return 'text-red-500 dark:text-red-400';
    if (risk > 0.4) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  const getTimeFrameLabel = (timeFrame: string) => {
    switch (timeFrame) {
      case '1h': return '1 hour';
      case '1d': return '1 day';
      case '1w': return '1 week';
      default: return timeFrame;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Health Prediction
        </h3>
      </div>

      <div className="space-y-3">
        {sortedPredictions.map((prediction, index) => (
          <div 
            key={index}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${getRiskColor(prediction.risk)}`}>
                {(prediction.risk * 100).toFixed(0)}% Risk
              </span>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {getTimeFrameLabel(prediction.timeFrame)}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {prediction.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}