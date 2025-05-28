import { ClipboardList } from 'lucide-react'; // Using ClipboardList as a more generic logo icon

export function AppLogo() {
  return (
    <div className="flex items-center gap-2 text-xl font-semibold text-[hsl(var(--accent))]"> {/* Green color for logo text */}
      <ClipboardList className="h-7 w-7 stroke-[hsl(var(--accent))]" /> {/* Green color for icon */}
      <span>SCRBRD Beta</span>
    </div>
  );
}
