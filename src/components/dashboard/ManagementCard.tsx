import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface ManagementCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export default function ManagementCard({ 
  icon: Icon, 
  title, 
  description, 
  href 
}: ManagementCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-card border border-border rounded-xl p-6 transition-all cursor-pointer hover:bg-card/80 hover:border-primary/50 hover:translate-x-1">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          {/* Arrow Button */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary flex-shrink-0 group-hover:scale-110 transition-transform">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
