
import { initializeFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

async function seedDatabase() {
    console.log('Seeding database...');
    const { firestore } = initializeFirebase();

    const batch = writeBatch(firestore);

    try {
        // Seed App Stats
        const statsRef = doc(firestore, 'app-stats', 'live-stats');
        batch.set(statsRef, {
            routesPlanned: 275,
            happyTravelers: 450,
            destinations: 85,
        });
        console.log('Successfully prepared app-stats for seeding!');

        // Seed Local Supporters
        const supporters = [
            {
                id: "supporter-maria",
                name: "Maria G.",
                bio: "Born and raised in Madrid! I'm a foodie and history buff. Happy to share the best tapas spots or help you navigate the metro. I work near the Prado Museum.",
                location: "Madrid, Spain",
                languages: ["Spanish", "English"],
                avatarUrl: "https://i.pravatar.cc/150?u=maria",
                response_time: "Within a few hours"
            },
            {
                id: "supporter-kenji",
                name: "Kenji Tanaka",
                bio: "I'm a university student in Tokyo. I love photography and exploring quiet neighborhoods. I can help you find cool vintage stores or the best ramen.",
                location: "Tokyo, Japan",
                languages: ["Japanese", "English"],
                avatarUrl: "https://i.pravatar.cc/150?u=kenji",
                response_time: "Usually in the evening"
            },
            {
                id: "supporter-aisha",
                name: "Aisha Khan",
                bio: "I'm a designer living in Mumbai. I can give you tips on the best street food, fabric markets, and how to get around the city like a local.",
                location: "Mumbai, India",
                languages: ["Hindi", "English", "Marathi"],
                avatarUrl: "https://i.pravatar.cc/150?u=aisha",
                response_time: "Within an hour"
            },
        ];

        const supportersCollection = collection(firestore, 'supporters');
        supporters.forEach(supporter => {
            const supporterRef = doc(supportersCollection, supporter.id);
            batch.set(supporterRef, supporter);
        });
        console.log('Successfully prepared local supporters for seeding!');

        // Commit the batch
        await batch.commit();
        console.log('Database seeding committed successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase();
