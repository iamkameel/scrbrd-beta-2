import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-xl p-8 mb-8 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/90 text-sm">{description}</p>
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
