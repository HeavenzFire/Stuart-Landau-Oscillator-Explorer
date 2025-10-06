import { NetworkState, LogEntry } from './types';

export const INITIAL_NETWORK_STATE: NetworkState = {
  "alpha-734": 0.5,
  "beta-211": 0.5,
  "gamma-909": 0.5,
  "delta-486": 0.5,
};

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 0,
    timestamp: new Date(),
    type: 'info',
    content: 'Stuart-Landau Oscillator simulator initialized. System online.',
  },
  {
    id: 1,
    timestamp: new Date(),
    type: 'info',
    content: "Awaiting command... Type 'help' for a list of commands.",
  },
];


export const HELP_MESSAGE = `
Available commands:
  execute                         - Evolve the system state by one time step.
  set omega1 <v>                  - Set frequency for alpha-beta plane. v: 0.0-10.0.
  set omega2 <v>                  - Set frequency for gamma-delta plane. v: 0.0-10.0.
  set deltat <v>                  - Set simulation time step. v: 0.01-0.5.
  status                          - Display current system parameters and state.
  reset                           - Reset the system to its initial state.
  clear                           - Clear the terminal screen.
  help                            - Show this help message.
`;
