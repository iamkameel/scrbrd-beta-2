
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { fetchCollection, fetchPersonById } from './src/lib/firestore';


async function debugPersonData() {
  console.log('Fetching all people...');
  const people = await fetchCollection<any>('people');
  console.log(`Found ${people.length} people.`);

  if (people.length > 0) {
    const person = people[0];
    console.log(`\nTesting fetchPersonById for ID: ${person.id}`);
    const fetchedPerson = await fetchPersonById(person.id);
    
    if (fetchedPerson) {
      console.log('Successfully fetched person:');
      console.log(JSON.stringify(fetchedPerson, null, 2));
      
      console.log('\nChecking relationships:');
      console.log(`School ID: ${fetchedPerson.schoolId}`);
      console.log(`Team IDs: ${fetchedPerson.teamIds}`);
    } else {
      console.error('Failed to fetch person by ID.');
    }
  } else {
    console.log('No people found in the database.');
  }
}

debugPersonData().catch(console.error);
