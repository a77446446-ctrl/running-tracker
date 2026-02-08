
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Activity, MapPin, Clock, Calendar, ChevronRight, Upload, Camera, Loader2, Trophy, Flame, User, Settings, ArrowLeft } from 'lucide-react';
import StatsChart from './components/StatsChart';
import Navigation from './components/Navigation';
import { analyzeRunImage, generateWeeklyAdvice } from './services/geminiService';
import { RunLog, RunAnalysis, UserProfile } from './types';

// Helper to convert file to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- PAGES ---

// 1. DASHBOARD
const Dashboard: React.FC<{ runs: RunLog[]; userProfile: UserProfile }> = ({ runs, userProfile }) => {
  const [advice, setAdvice] = useState<string>("");

  const totalDistance = runs.reduce((acc, run) => acc + run.distance, 0);
  const totalDuration = runs.reduce((acc, run) => acc + run.duration, 0);
  const runCount = runs.length;
  
  useEffect(() => {
    if (runCount > 0) {
      generateWeeklyAdvice(totalDistance, runCount).then(setAdvice);
    }
  }, [runCount, totalDistance]);

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Привет, {userProfile.name}! 👋</h1>
          <p className="text-slate-400 text-sm">Готов к новым рекордам?</p>
        </div>
        <Link to="/profile">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center overflow-hidden border-2 border-slate-700 hover:border-primary transition-colors cursor-pointer shadow-lg">
            {userProfile.photoUrl ? (
              <img src={userProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="text-dark" size={24} />
            )}
          </div>
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface p-4 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <Activity size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Всего км</span>
          </div>
          <p className="text-3xl font-black text-white">{totalDistance.toFixed(1)}</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center space-x-2 text-secondary mb-2">
            <Flame size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Тренировок</span>
          </div>
          <p className="text-3xl font-black text-white">{runCount}</p>
        </div>
      </div>

      {/* AI Advice */}
      {advice && (
        <div className="mb-6 bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 flex items-start gap-3">
          <Trophy className="text-yellow-400 shrink-0 mt-1" size={20} />
          <p className="text-sm text-slate-200 italic leading-relaxed">"{advice}"</p>
        </div>
      )}

      {/* Chart */}
      <div className="mb-8">
        <StatsChart data={runs} />
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-bold text-white">Последние пробежки</h2>
        </div>
        
        {runs.slice().reverse().slice(0, 3).map(run => (
          <div key={run.id} className="bg-surface p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {run.imageUrl ? (
                <img src={run.imageUrl} alt="Run" className="w-12 h-12 rounded-lg object-cover border border-slate-600" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Activity size={20} className="text-slate-500" />
                </div>
              )}
              <div>
                <p className="font-bold text-white">{run.distance} км</p>
                <div className="flex items-center text-xs text-slate-400 gap-2">
                   <span className="flex items-center gap-1"><Clock size={12} /> {run.duration} мин</span>
                   <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                   <span>{new Date(run.date).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">
                {run.pace.toFixed(2)} мин/км
              </span>
            </div>
          </div>
        ))}
        {runs.length === 0 && (
          <p className="text-center text-slate-500 py-4">Пока нет записей. Начни бегать!</p>
        )}
      </div>
    </div>
  );
};

// 2. PROFILE PAGE
const ProfilePage: React.FC<{ userProfile: UserProfile; onSave: (p: UserProfile) => void }> = ({ userProfile, onSave }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(userProfile.name);
  const [photo, setPhoto] = useState<string | undefined>(userProfile.photoUrl);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Файл слишком большой. Максимум 5MB.");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setPhoto(base64);
      } catch (error) {
        console.error("Photo upload error", error);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, photoUrl: photo });
    navigate('/');
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Мой Профиль</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="flex flex-col items-center">
          <label className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-500" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-dark p-2 rounded-full shadow-lg transform translate-x-1/4 translate-y-1/4">
              <Camera size={20} />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <p className="text-slate-500 text-xs mt-3">Нажми, чтобы изменить фото</p>
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-xs uppercase font-bold">Имя</label>
          <input 
            type="text" 
            required
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full bg-surface border border-slate-700 rounded-xl p-4 text-white text-lg font-bold focus:border-primary focus:outline-none transition-colors"
            placeholder="Ваше имя"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-secondary to-blue-500 text-dark font-bold text-lg py-4 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all transform active:scale-95"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
};

const RacesPage: React.FC = () => {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch('/api/events/recommendedEvents?Language=ru&Size=50');
        if (!response.ok) throw new Error('Failed to fetch races');
        
        const data = await response.json();
        // Assuming data is an array or has a property with array
        // Adjust based on actual API response. RussiaRunning usually returns an array or object with List
        const events = Array.isArray(data) ? data : (data.events || data.Items || []);
        
        const now = new Date();
        const futureEvents = events
          .filter((e: any) => new Date(e.DateStart || e.startDate || e.date) >= now)
          .sort((a: any, b: any) => new Date(a.DateStart || a.startDate || a.date).getTime() - new Date(b.DateStart || b.startDate || b.date).getTime());

        setRaces(futureEvents);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить список соревнований. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Соревнования</h1>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-center">
          {error}
        </div>
      )}

      {!loading && !error && races.length === 0 && (
        <p className="text-slate-500 text-center py-8">Соревнований не найдено</p>
      )}

      <div className="space-y-4">
        {races.map((race) => (
          <div key={race.Id || race.id} className="bg-surface p-4 rounded-xl border border-slate-700 flex gap-4">
            {race.Logo?.Url || race.logoUrl ? (
               <img src={race.Logo?.Url || race.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-contain bg-white/5" />
            ) : (
               <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                 <Trophy size={24} />
               </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{race.Title || race.Name || race.name || 'Название события'}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <Calendar size={12} />
                <span>{new Date(race.DateStart || race.startDate || race.date).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <MapPin size={12} />
                <span className="truncate">{race.City?.Name || race.city || 'Местоположение'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. ADD RUN
const AddRun: React.FC<{ onAdd: (run: RunLog) => void }> = ({ onAdd }) => {
  const navigate = useNavigate();
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic size check (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Файл слишком большой. Максимум 5MB.");
        return;
      }

      setIsAnalyzing(true);
      try {
        const base64 = await fileToBase64(file);
        const base64Data = base64.split(',')[1];
        
        setImage(base64); // Keep full string for display
        
        const analysis = await analyzeRunImage(base64Data);
        
        if (analysis.distance) setDistance(analysis.distance.toString());
        if (analysis.duration) setDuration(analysis.duration.toString());
        if (analysis.notes) setNotes(prev => prev ? `${prev}\n${analysis.notes}` : analysis.notes);
        if (analysis.feedback) setAiFeedback(analysis.feedback);
        
      } catch (error) {
        console.error("Error processing image", error);
        alert("Ошибка обработки фото");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || !duration) return;

    const distNum = parseFloat(distance);
    const durNum = parseFloat(duration);

    const newRun: RunLog = {
      id: Date.now().toString(),
      date,
      distance: distNum,
      duration: durNum,
      pace: durNum / distNum,
      notes,
      imageUrl: image || undefined,
      aiFeedback
    };

    onAdd(newRun);
    navigate('/');
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Новая тренировка</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Photo Upload Area */}
        <div className="relative">
          <label className="block w-full aspect-video rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center group overflow-hidden">
            {image ? (
              <>
                <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-black/60 p-2 rounded-full mb-2">
                        <Camera className="text-white" />
                    </div>
                    <span className="text-xs text-white font-medium bg-black/60 px-2 py-1 rounded">Изменить фото</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-700 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="text-primary" />
                </div>
                <span className="text-slate-400 font-medium">Загрузить фото</span>
                <span className="text-slate-600 text-xs mt-1">Трекер, часы или пейзаж</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl">
              <Loader2 className="animate-spin text-primary mb-2" size={32} />
              <span className="text-primary font-medium animate-pulse">ИИ анализирует фото...</span>
            </div>
          )}
        </div>

        {/* AI Feedback Banner */}
        {aiFeedback && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
            <p className="text-primary text-sm italic">"{aiFeedback}"</p>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-slate-400 text-xs uppercase font-bold">Дистанция (км)</label>
            <input 
              type="number" 
              step="0.01" 
              required
              value={distance} 
              onChange={e => setDistance(e.target.value)}
              className="w-full bg-surface border border-slate-700 rounded-xl p-4 text-white text-lg font-bold focus:border-primary focus:outline-none transition-colors"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-400 text-xs uppercase font-bold">Время (мин)</label>
            <input 
              type="number" 
              required
              value={duration} 
              onChange={e => setDuration(e.target.value)}
              className="w-full bg-surface border border-slate-700 rounded-xl p-4 text-white text-lg font-bold focus:border-secondary focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-xs uppercase font-bold">Дата</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="date" 
              required
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full bg-surface border border-slate-700 rounded-xl p-4 pl-12 text-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-xs uppercase font-bold">Заметки</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-surface border border-slate-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-colors min-h-[100px]"
            placeholder="Как прошла пробежка?.."
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-lime-500 text-dark font-bold text-lg py-4 rounded-xl hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] transition-all transform active:scale-95"
        >
          Сохранить тренировку
        </button>
      </form>
    </div>
  );
};

// 4. HISTORY
const HistoryPage: React.FC<{ runs: RunLog[] }> = ({ runs }) => {
  const sortedRuns = [...runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">История</h1>
      
      <div className="space-y-4">
        {sortedRuns.map(run => (
          <div key={run.id} className="bg-surface rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar size={14} />
                  <span>{new Date(run.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                {run.pace < 5 ? (
                    <Flame size={16} className="text-orange-500" />
                ) : null}
              </div>
              
              <div className="flex items-center gap-6 mb-3">
                 <div>
                    <span className="text-2xl font-bold text-white">{run.distance}</span>
                    <span className="text-slate-500 text-xs ml-1">км</span>
                 </div>
                 <div className="w-px h-8 bg-slate-700"></div>
                 <div>
                    <span className="text-2xl font-bold text-white">{run.duration}</span>
                    <span className="text-slate-500 text-xs ml-1">мин</span>
                 </div>
                 <div className="w-px h-8 bg-slate-700"></div>
                 <div>
                    <span className="text-xl font-bold text-primary">{run.pace.toFixed(2)}</span>
                    <span className="text-slate-500 text-xs ml-1">мин/км</span>
                 </div>
              </div>

              {run.notes && (
                <p className="text-slate-400 text-sm border-t border-slate-700 pt-3 mt-3">
                  {run.notes}
                </p>
              )}

              {run.aiFeedback && (
                 <div className="mt-3 bg-slate-800/50 p-2 rounded text-xs text-primary italic">
                    AI: {run.aiFeedback}
                 </div>
              )}
            </div>
            {run.imageUrl && (
              <div className="h-32 w-full overflow-hidden relative">
                <img src={run.imageUrl} alt="Run environment" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-50"></div>
              </div>
            )}
          </div>
        ))}
        {sortedRuns.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500">История пуста.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP ROOT ---

const App: React.FC = () => {
  // Load runs
  const [runs, setRuns] = useState<RunLog[]>(() => {
    const saved = localStorage.getItem('run_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Load user profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : { name: 'Бегун' };
  });

  useEffect(() => {
    localStorage.setItem('run_logs', JSON.stringify(runs));
  }, [runs]);

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const addRun = (run: RunLog) => {
    setRuns(prev => [...prev, run]);
  };

  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-dark text-slate-100 font-sans selection:bg-primary selection:text-dark">
        <Routes>
          <Route path="/" element={<Dashboard runs={runs} userProfile={userProfile} />} />
          <Route path="/add" element={<AddRun onAdd={addRun} />} />
          <Route path="/history" element={<HistoryPage runs={runs} />} />
          <Route path="/races" element={<RacesPage />} />
          <Route path="/profile" element={<ProfilePage userProfile={userProfile} onSave={updateProfile} />} />
        </Routes>
        <Navigation />
      </div>
    </HashRouter>
  );
};

export default App;
