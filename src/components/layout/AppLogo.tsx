import Image from 'next/image';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2 text-xl font-semibold text-[hsl(var(--accent))]">
      {/* Replace ugly icon with custom SVG/logo */}
      <Image src="/images/scrbrd-logo.png" alt="SCRBRD Logo" width={28} height={28} className="h-7 w-7 object-contain" />
      <span>SCRBRD Beta</span>
    </div>
  );
}
