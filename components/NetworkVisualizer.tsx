
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { NetworkState } from '../types';

interface NetworkVisualizerProps {
  data: NetworkState;
}

const COLORS = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-cyan-700 p-2 rounded-md shadow-lg">
        <p className="label text-cyan-400">{`${label}`}</p>
        <p className="intro text-slate-200">{`Amplitude : ${payload[0].value.toFixed(4)}`}</p>
      </div>
    );
  }
  return null;
};

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ data }) => {
  const chartData = Object.keys(data).map(key => ({
    name: key,
    amplitude: data[key],
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
          <YAxis domain={[0, 1]} tick={{ fill: '#94a3b8' }} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(8, 145, 178, 0.1)'}} />
          <Bar dataKey="amplitude" fill="url(#colorUv)" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetworkVisualizer;
