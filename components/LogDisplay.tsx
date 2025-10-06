
import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
  onCommand: (command: string) => void;
  isLoading: boolean;
}

const LogTypeStyles: Record<LogEntry['type'], string> = {
  command: 'text-cyan-400',
  response: 'text-slate-300',
  error: 'text-red-500',
  info: 'text-slate-400',
};

const LogPrefix: Record<LogEntry['type'], string> = {
    command: '>',
    response: 'AI:',
    error: 'ERR:',
    info: 'SYS:',
};

const Terminal: React.FC<TerminalProps> = ({ logs, onCommand, isLoading }) => {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if(!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleClick = () => {
    inputRef.current?.focus();
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = input.trim();
    if (command && !isLoading) {
      onCommand(command);
      if (command !== commandHistory[commandHistory.length - 1]) {
        const newHistory = [...commandHistory, command];
        setCommandHistory(newHistory);
        setHistoryIndex(newHistory.length);
      } else {
         setHistoryIndex(commandHistory.length);
      }
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.max(0, historyIndex - 1);
      if(commandHistory.length > 0 && newIndex >= 0) {
        setInput(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setInput(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
      } else {
        setInput('');
        setHistoryIndex(commandHistory.length);
      }
    }
  };

  return (
    <div className="flex-grow p-4 font-mono text-sm overflow-y-auto h-full flex flex-col cursor-text" onClick={handleClick}>
      <div className="flex-grow">
        {logs.map((log) => (
          <div key={log.id} className="mb-2 flex items-start">
              <span className={`mr-2 flex-shrink-0 w-8 ${LogTypeStyles[log.type]}`}>
                  {LogPrefix[log.type]}
              </span>
            <p className={`whitespace-pre-wrap break-words ${LogTypeStyles[log.type]}`}>
              {log.content}
            </p>
          </div>
        ))}
        <div ref={endOfLogsRef} />
      </div>
      <form onSubmit={handleFormSubmit} className="flex items-center mt-2">
        <span className="text-cyan-400 mr-2">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="bg-transparent border-none text-slate-200 w-full focus:outline-none focus:ring-0"
          autoComplete="off"
          spellCheck="false"
          autoFocus
        />
      </form>
    </div>
  );
};

export default Terminal;
