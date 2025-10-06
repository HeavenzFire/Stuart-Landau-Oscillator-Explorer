export type NetworkState = Record<string, number>;

export interface LogEntry {
  id: number;
  timestamp: Date;
  type: 'command' | 'response' | 'error' | 'info';
  content: string;
}

// Fix: Define and export the 'Persona' type, which was used in `services/geminiService.ts` but not declared.
export type Persona = 'balanced' | 'aggressive' | 'conservative';

// Fix: Define and export the 'NudgeSuggestion' interface, which was used in `services/geminiService.ts` but not declared.
export interface NudgeSuggestion {
  reasoning: string;
  analysis: string;
  newState: NetworkState;
}
