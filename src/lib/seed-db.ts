
import { initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

async function seedDatabase() {
    console.log('Seeding database...');
    const { firestore } = initializeFirebase();

    try {
        const statsRef = doc(firestore, 'app-stats', 'live-stats');
        await setDoc(statsRef, {
            routesPlanned: 275,
            happyTravelers: 450,
            destinations: 85,
        });
        console.log('Successfully seeded app-stats!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase();
