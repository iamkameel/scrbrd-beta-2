import { ScrbrdLogo } from '@/components/scrbrd/ScrbrdLogo';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <ScrbrdLogo height={24} />
      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        BETA
      </span>
    </div>
  );
}

