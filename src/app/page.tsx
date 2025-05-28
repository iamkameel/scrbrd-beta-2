import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { navLinks } from "@/lib/nav-links";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const features = navLinks.filter(link => link.href !== '/' && !link.separator);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to <span className="text-[hsl(var(--accent))]">SCRBRD Beta</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your all-in-one platform for cricket management and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.href} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <feature.icon className="h-8 w-8 text-[hsl(var(--primary))]" />
                <CardTitle className="text-xl">{feature.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>
                Access and manage {feature.label.toLowerCase()}.
                {feature.disabled && <span className="ml-2 text-xs font-semibold text-destructive">(Coming Soon)</span>}
              </CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild variant="default" className="w-full" disabled={feature.disabled}>
                <Link href={feature.disabled ? "#" : feature.href}>
                  Go to {feature.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
