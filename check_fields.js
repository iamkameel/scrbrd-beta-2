
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function checkFields() {
  const snapshot = await db.collection('fields').get();
  console.log(`Found ${snapshot.size} fields.`);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data().name);
  });
}

checkFields();
