import { Link, useLocation } from 'react-router-dom';
import { Home, Map, PlusCircle, Compass, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MobileNavigation() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'My Trips', path: '/trips', icon: Map },
    { label: 'New Trip', path: '/trips/new', icon: PlusCircle, highlight: true },
    { label: 'Explore', path: '/explore/cities', icon: Compass },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

        if (item.highlight) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center text-xs font-medium text-white -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-sky-500 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-2 border-white">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] mt-0.5 text-primary-700 font-semibold">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-xs font-medium transition-colors ${
              active ? 'text-primary-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-primary-600' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
