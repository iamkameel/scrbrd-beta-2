import { fetchTrips, fetchVehicles } from "@/lib/firestore";
import { Bus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransportClient } from "@/components/transport/TransportClient";

export default async function TransportPage() {
  const [trips, vehicles] = await Promise.all([
    fetchTrips(),
    fetchVehicles()
  ]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Bus className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Transport Coordinator</h1>
          </div>
          <p className="text-muted-foreground">
            Manage fleet logistics and schedule team travel
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Trip
        </Button>
      </div>

      <TransportClient trips={trips as any} vehicles={vehicles as any} />
    </div>
  );
}

