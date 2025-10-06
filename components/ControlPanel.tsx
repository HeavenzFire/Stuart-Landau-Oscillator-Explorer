import React from 'react';
import { AdjustmentsIcon, PlayIcon, SpinnerIcon } from './Icons';

interface ControlPanelProps {
  omega1: number;
  setOmega1: (value: number) => void;
  omega2: number;
  setOmega2: (value: number) => void;
  deltat: number;
  setDeltat: (value: number) => void;
  onExecute: () => void;
  isLoading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  omega1,
  setOmega1,
  omega2,
  setOmega2,
  deltat,
  setDeltat,
  onExecute,
  isLoading,
}) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 shadow-lg shadow-cyan-950/20">
      <h2 className="flex items-center text-2xl font-semibold text-cyan-400 mb-4">
        <AdjustmentsIcon className="w-6 h-6 mr-3" />
        System Parameters
      </h2>
      <div className="space-y-6">
        <div>
            <label htmlFor="omega1" className="block text-sm font-medium text-slate-300 mb-2">
                Omega 1 (α-β plane): <span className="font-mono text-cyan-400">{omega1.toFixed(2)}</span>
            </label>
            <input
                id="omega1"
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={omega1}
                onChange={(e) => setOmega1(parseFloat(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>
        
        <div>
            <label htmlFor="omega2" className="block text-sm font-medium text-slate-300 mb-2">
                Omega 2 (γ-δ plane): <span className="font-mono text-cyan-400">{omega2.toFixed(2)}</span>
            </label>
            <input
                id="omega2"
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={omega2}
                onChange={(e) => setOmega2(parseFloat(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        <div>
            <label htmlFor="deltat" className="block text-sm font-medium text-slate-300 mb-2">
                Time Step (Δt): <span className="font-mono text-cyan-400">{deltat.toFixed(2)}</span>
            </label>
            <input
                id="deltat"
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={deltat}
                onChange={(e) => setDeltat(parseFloat(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>


        <button
          onClick={onExecute}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg shadow-cyan-900/50 hover:shadow-cyan-glow focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="animate-spin w-5 h-5 mr-3" />
              Evolving...
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5 mr-3" />
              Evolve State
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
