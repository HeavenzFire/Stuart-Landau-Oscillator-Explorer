import React, { useState, useCallback } from 'react';
import { LogEntry, NetworkState } from './types';
import { INITIAL_LOGS, INITIAL_NETWORK_STATE, HELP_MESSAGE } from './constants';
import ControlPanel from './components/ControlPanel';
import Terminal from './components/LogDisplay';
import NetworkVisualizer from './components/NetworkVisualizer';
import { AnalyticsIcon, TerminalIcon } from './components/Icons';

export default function App() {
  const [networkState, setNetworkState] = useState<NetworkState>(INITIAL_NETWORK_STATE);
  const [omega1, setOmega1] = useState<number>(1.5);
  const [omega2, setOmega2] = useState<number>(2.7);
  const [deltat, setDeltat] = useState<number>(0.1);
  const [time, setTime] = useState<number>(0.0);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs(prevLogs => [
      ...prevLogs,
      {
        id: prevLogs.length,
        timestamp: new Date(),
        ...entry,
      },
    ]);
  }, []);

  const handleEvolveState = useCallback(async () => {
    setIsLoading(true);

    const newTime = time + deltat;
    addLog({ type: 'command', content: `execute --evolve --deltat=${deltat}` });
    
    // Deconstruct state into a vector
    const nodeKeys = Object.keys(networkState);
    const x_t = nodeKeys.map(key => networkState[key]);

    // 1. Amplitude dynamics: r_dot = r(1 - r^2)
    const r_t = Math.sqrt(x_t.reduce((sum, val) => sum + val * val, 0));
    
    // Exact solution for r(t)
    let r_t_plus_deltat: number;
    if (r_t === 0) {
        r_t_plus_deltat = 0;
    } else {
        const r0_sq = r_t * r_t;
        r_t_plus_deltat = r_t / Math.sqrt(r0_sq + (1 - r0_sq) * Math.exp(-2 * deltat));
    }


    // 2. Angular dynamics: u_dot = B u
    // For small deltat, apply rotations. u(t) = exp(tB)u0
    // B is represented by rotations in two orthogonal planes (alpha-beta, gamma-delta)
    const u_t = r_t === 0 ? x_t.map(() => 0) : x_t.map(v => v / r_t);
    
    let u_t_plus_deltat = [...u_t];

    // Rotation in alpha-beta plane (components 0 and 1)
    const theta1 = omega1 * deltat;
    const cos1 = Math.cos(theta1);
    const sin1 = Math.sin(theta1);
    const u0 = u_t_plus_deltat[0];
    const u1 = u_t_plus_deltat[1];
    u_t_plus_deltat[0] = u0 * cos1 - u1 * sin1;
    u_t_plus_deltat[1] = u0 * sin1 + u1 * cos1;
    
    // Rotation in gamma-delta plane (components 2 and 3)
    const theta2 = omega2 * deltat;
    const cos2 = Math.cos(theta2);
    const sin2 = Math.sin(theta2);
    const u2 = u_t_plus_deltat[2];
    const u3 = u_t_plus_deltat[3];
    u_t_plus_deltat[2] = u2 * cos2 - u3 * sin2;
    u_t_plus_deltat[3] = u2 * sin2 + u3 * cos2;

    // 3. Combine to get the new state vector
    const x_t_plus_deltat = u_t_plus_deltat.map(v => v * r_t_plus_deltat);
    
    const newState: NetworkState = {};
    nodeKeys.forEach((key, index) => {
        newState[key] = x_t_plus_deltat[index];
    });

    setNetworkState(newState);
    setTime(newTime);
    addLog({
      type: 'info',
      content: `System evolved. Total time: ${newTime.toFixed(2)}s. New state: ${JSON.stringify(newState)}`,
    });
    
    setIsLoading(false);
  }, [addLog, networkState, omega1, omega2, deltat, time]);

    const handleCommand = useCallback((commandStr: string) => {
    addLog({ type: 'command', content: commandStr });
    const [command, ...args] = commandStr.trim().split(/\s+/);

    const handleSetCommand = (params: string[]) => {
      if (params.length < 2) {
        addLog({ type: 'error', content: 'Usage: set <parameter> <value>' });
        return;
      }
      const [param, ...valueParts] = params;
      const value = valueParts.join(' ');
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        addLog({ type: 'error', content: `Invalid numeric value: ${value}` });
        return;
      }

      switch (param.toLowerCase()) {
        case 'omega1':
          if (numValue >= 0 && numValue <= 10) {
            setOmega1(numValue);
            addLog({ type: 'info', content: `Omega 1 set to: ${numValue.toFixed(2)}` });
          } else {
            addLog({ type: 'error', content: 'Invalid value. Must be between 0.0 and 10.0.' });
          }
          break;
        case 'omega2':
          if (numValue >= 0 && numValue <= 10) {
            setOmega2(numValue);
            addLog({ type: 'info', content: `Omega 2 set to: ${numValue.toFixed(2)}` });
          } else {
            addLog({ type: 'error', content: 'Invalid value. Must be between 0.0 and 10.0.' });
          }
          break;
        case 'deltat':
            if (numValue >= 0.01 && numValue <= 0.5) {
              setDeltat(numValue);
              addLog({ type: 'info', content: `Time Step (Δt) set to: ${numValue.toFixed(2)}` });
            } else {
              addLog({ type: 'error', content: 'Invalid value. Must be between 0.01 and 0.5.' });
            }
            break;
        default:
          addLog({ type: 'error', content: `Unknown parameter: ${param}. Use: omega1, omega2, deltat.` });
      }
    };
    
    switch (command.toLowerCase()) {
      case 'execute':
        handleEvolveState();
        break;
      case 'set':
        handleSetCommand(args);
        break;
      case 'reset':
        addLog({ type: 'info', content: 'Resetting system state...' });
        setNetworkState(INITIAL_NETWORK_STATE);
        setLogs(INITIAL_LOGS);
        setOmega1(1.5);
        setOmega2(2.7);
        setDeltat(0.1);
        setTime(0.0);
        break;
      case 'clear':
        setLogs([]);
        break;
      case 'help':
        addLog({ type: 'info', content: HELP_MESSAGE });
        break;
      case 'status':
        addLog({ type: 'info', content: `
Current Status:
  - Omega 1 (α-β): ${omega1.toFixed(2)} rad/s
  - Omega 2 (γ-δ): ${omega2.toFixed(2)} rad/s
  - Time Step (Δt): ${deltat.toFixed(2)} s
  - Total Time: ${time.toFixed(2)} s
  - Network State: ${JSON.stringify(networkState)}
        `.trim()});
        break;
      default:
        addLog({ type: 'error', content: `Unknown command: '${command}'. Type 'help' for a list of commands.` });
        break;
    }
  }, [addLog, handleEvolveState, networkState, omega1, omega2, deltat, time]);

  return (
    <div className="min-h-screen bg-gray-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.3),rgba(255,255,255,0))]">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">
            Stuart-Landau Oscillator Explorer
          </h1>
          <p className="text-slate-400 mt-2">Visualizing Higher-Dimensional Dynamics</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 shadow-lg shadow-cyan-950/20">
              <h2 className="flex items-center text-2xl font-semibold text-cyan-400 mb-4">
                <AnalyticsIcon className="w-6 h-6 mr-3" />
                System State
              </h2>
              <NetworkVisualizer data={networkState} />
            </div>
             <ControlPanel
                omega1={omega1}
                setOmega1={setOmega1}
                omega2={omega2}
                setOmega2={setOmega2}
                deltat={deltat}
                setDeltat={setDeltat}
                onExecute={handleEvolveState}
                isLoading={isLoading}
              />
          </div>

          <div className="lg:col-span-3">
             <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg shadow-lg shadow-cyan-950/20 h-[calc(100vh-10rem)] flex flex-col">
                <h2 className="flex items-center text-2xl font-semibold text-cyan-400 p-4 border-b border-cyan-500/20">
                  <TerminalIcon className="w-6 h-6 mr-3" />
                  SLO Terminal
                </h2>
                <Terminal logs={logs} onCommand={handleCommand} isLoading={isLoading}/>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}