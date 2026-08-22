import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold text-slate-900">404 — Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The travel destination or page you are looking for does not exist or has moved.
        </p>
      </div>
      <Link to="/dashboard">
        <Button size="lg">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
