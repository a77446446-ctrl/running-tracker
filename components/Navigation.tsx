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
            <span className="text-xs font-medium">Афиша</span>
          </Link>
          
          <Link to="/history" className={getLinkClass('/history')}>
            <History size={24} />
            <span className="text-xs font-medium">История</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
