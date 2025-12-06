import { redirect, notFound } from 'next/navigation';
import { fetchPersonById } from "@/lib/firestore";
import { PlayerDetailClient } from "@/components/players/PlayerDetailClient";

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const person = await fetchPersonById(params.id);
  
  if (!person) {
    notFound();
  }
  
  // Verify this person is actually a player
  const isPlayer = person.role?.toLowerCase().includes('player') || person.role === 'Player';
  
  if (!isPlayer) {
    // Not a player, redirect to generic people page
    redirect(`/people/${params.id}`);
  }
  
  return <PlayerDetailClient player={person} />;
}
