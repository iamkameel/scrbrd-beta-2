
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setAdminRole() {
    // Use dynamic import
    const { findUserByEmail, setDocument } = await import('./src/lib/firestore');

    const targetEmail = process.argv[2];

    if (!targetEmail) {
        console.error('Please provide an email address as an argument.');
        process.exit(1);
    }

    console.log(`Looking for user with email: ${targetEmail}`);

    try {
        const users = await findUserByEmail(targetEmail);

        if (users.length === 0) {
            console.log('No user found. Please Sign Up first.');
        } else {
            const user = users[0] as any;
            console.log(`Found user: ${user.id} (${user.displayName})`);
            console.log(`Current Role: ${user.role}`);

            console.log('Promoting to System Architect...');

            await setDocument('users', user.id, {
                ...user,
                role: 'System Architect',
                roles: ['System Architect', 'Player', 'Coach', 'Scorer', 'Umpire'], // Give all roles
                updatedAt: new Date().toISOString()
            });

            console.log('SUCCESS! User is now a System Architect.');
        }
    } catch (error) {
        console.error('Error setting admin role:', error);
    }
}

setAdminRole().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
});
