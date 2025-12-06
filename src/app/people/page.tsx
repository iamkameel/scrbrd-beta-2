import { fetchCollection } from "@/lib/firestore";
import { normalizePeople } from "@/lib/normalizePerson";
import PeopleClient from "@/components/people/PeopleClient";

export const dynamic = 'force-dynamic';

export default async function PeopleDirectoryPage() {
  // Fetch all people from Firestore
  const rawData = await fetchCollection<any>('people');
  const people = normalizePeople(rawData);

  // TODO: Get user role from auth context
  // For now, hardcode as Admin for full access
  const userRole = 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <PeopleClient initialPeople={people} userRole={userRole} />
    </div>
  );
}
