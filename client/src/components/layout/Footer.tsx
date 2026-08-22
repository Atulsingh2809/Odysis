import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-sky-400 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">GlobeTrotter</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Personalized, intelligent, collaborative travel-planning platform. Plan multi-city trips, estimate costs, and visualize your journeys.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-white transition-colors">
                  My Trips
                </Link>
              </li>
              <li>
                <Link to="/trips/new" className="hover:text-white transition-colors">
                  Plan New Trip
                </Link>
              </li>
              <li>
                <Link to="/explore/cities" className="hover:text-white transition-colors">
                  Explore Destinations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Features</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore/activities" className="hover:text-white transition-colors">
                  Activity Finder
                </Link>
              </li>
              <li className="text-slate-400">Multi-city Itinerary Builder</li>
              <li className="text-slate-400">Smart Budget Calculator</li>
              <li className="text-slate-400">Public Sharing & Copy Trip</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Currencies Supported</h4>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300 mb-4">
              <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">INR (₹)</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">USD ($)</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">EUR (€)</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">GBP (£)</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">JPY (¥)</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">AED (AED)</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GlobeTrotter. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Built with precision & passion for travelers worldwide.
          </div>
        </div>
      </div>
    </footer>
  );
}
