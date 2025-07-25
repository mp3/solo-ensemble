import React from 'react';

interface LevelMeterProps {
  label: string;
  level: number;
}

export const LevelMeter: React.FC<LevelMeterProps> = ({ label, level }) => {
  return (
    <div className="flex-1 max-w-[200px]">
      <label className="block text-center text-text-secondary mb-1">{label}</label>
      <div className="h-5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-success via-yellow-400 to-error transition-all duration-50" 
          style={{ width: `${level * 100}%` }}
        />
      </div>
    </div>
  );
};