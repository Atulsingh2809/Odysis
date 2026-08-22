import { Compass } from 'lucide-react';

export function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
}: {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-slate-600">
      <div
        className={`rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center animate-pulse ${
          size === 'sm' ? 'w-8 h-8 p-1.5' : size === 'md' ? 'w-12 h-12 p-2.5' : 'w-16 h-16 p-3.5'
        }`}
      >
        <Compass className="w-full h-full animate-spin-slow" />
      </div>
      {text && <p className="text-xs font-semibold text-slate-500 tracking-wide">{text}</p>}
    </div>
  );
}
