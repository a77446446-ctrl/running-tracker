import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Trophy, Activity } from 'lucide-react';
import { NavigationTab } from '../types';

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getLinkClass = (path: string) => {
    const isActive = currentPath === path;
    return `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
    } transition-colors duration-200`;
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-surface/90 backdrop-blur-md border-t border-slate-700 z-50">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-4">
          <Link to="/" className={getLinkClass('/')}>
            <LayoutDashboard size={24} />
            <span className="text-xs font-medium">Обзор</span>
          </Link>
          
          <Link to="/races" className={getLinkClass('/races')}>
            <Trophy size={24} />
            <span className="text-xs font-medium">Старты</span>
          </Link>
          
          <Link to="/history" className={getLinkClass('/history')}>
            <History size={24} />
            <span className="text-xs font-medium">История</span>
          </Link>
        </div>
      </nav>

      {/* Floating Action Button for Adding Training */}
      <Link to="/add" className="fixed bottom-12 right-6 z-50">
        <div className={`p-4 rounded-full ${currentPath === '/add' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(163,230,53,0.5)]' : 'bg-slate-700 text-slate-400'} transition-all transform hover:scale-105 shadow-xl border border-slate-600`}>
          <Activity size={32} />
        </div>
      </Link>
    </>
  );
};

export default Navigation;
