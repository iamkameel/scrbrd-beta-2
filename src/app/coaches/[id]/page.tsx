import { redirect } from 'next/navigation';
import { fetchPersonById } from "@/lib/firestore";

export default async function CoachProfilePage({ params }: { params: { id: string } }) {
  const person = await fetchPersonById(params.id);
  
  if (!person) {
    redirect('/people');
  }
  
  // Verify this person is actually a coach
  const isCoach = person.role?.toLowerCase().includes('coach');
  
  if (!isCoach) {
    // Not a coach, redirect to generic people page
    redirect(`/people/${params.id}`);
  }
  
  // Redirect to the person profile page with coach context
  redirect(`/people/${params.id}`);
}
