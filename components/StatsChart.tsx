import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RunLog } from '../types';

interface StatsChartProps {
  data: RunLog[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  // Sort data by date and take last 7 runs
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(run => ({
      date: new Date(run.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      distance: run.distance
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 bg-surface rounded-xl">
        Нет данных для графика
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-surface p-4 rounded-xl shadow-lg border border-slate-700">
      <h3 className="text-slate-400 text-sm font-medium mb-4">Прогресс (КМ)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a3e635" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            tick={{fontSize: 12}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{fontSize: 12}} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#a3e635' }}
          />
          <Area 
            type="monotone" 
            dataKey="distance" 
            stroke="#a3e635" 
            fillOpacity={1} 
            fill="url(#colorDist)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;