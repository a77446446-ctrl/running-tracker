import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RunLog } from '../types';
import { Link } from 'react-router-dom';
import { Activity, Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react';

interface StatsChartProps {
  data: RunLog[];
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    // Mock weather for Moscow/Russia context or fetch from open-meteo
    const fetchWeather = async () => {
      try {
        // Moscow coordinates
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173&current_weather=true');
        const data = await res.json();
        if (data.current_weather) {
          setWeather({
            temp: data.current_weather.temperature,
            code: data.current_weather.weathercode
          });
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };
    fetchWeather();
  }, []);

  if (!weather) return null;

  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun size={16} className="text-yellow-400" />;
    if (code <= 48) return <Cloud size={16} className="text-slate-400" />;
    if (code <= 67) return <CloudRain size={16} className="text-blue-400" />;
    return <CloudSnow size={16} className="text-white" />;
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800/80 px-2 py-1 rounded-lg backdrop-blur-sm border border-slate-700">
      {getWeatherIcon(weather.code)}
      <span className="text-xs font-bold text-white">{weather.temp > 0 ? '+' : ''}{weather.temp}°C</span>
    </div>
  );
};

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
      <div className="h-48 flex items-center justify-center text-slate-500 bg-surface rounded-xl relative">
        Нет данных для графика
        
        {/* Weather Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <WeatherWidget />
        </div>

         {/* FAB Button Bottom Center */}
        <Link to="/add" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="p-4 rounded-full bg-primary text-dark shadow-[0_0_15px_rgba(163,230,53,0.5)] transition-all transform hover:scale-105 border border-slate-600">
            <Activity size={32} />
            </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-surface p-4 rounded-xl shadow-lg border border-slate-700 relative mb-8">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 text-sm font-medium">Прогресс (КМ)</h3>
        {/* Weather Top Right */}
        <div className="z-10">
             <WeatherWidget />
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
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

      {/* FAB Button Bottom Center */}
      <Link to="/add" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="p-4 rounded-full bg-primary text-dark shadow-[0_0_15px_rgba(163,230,53,0.5)] transition-all transform hover:scale-105 border border-slate-600">
          <Activity size={32} />
        </div>
      </Link>
    </div>
  );
};

export default StatsChart;