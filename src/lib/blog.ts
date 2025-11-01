
import { initializeFirebase } from "@/firebase/server";
import type { Blog } from "./types";

export async function getBlogs(): Promise<Blog[]> {
  const { firestore } = initializeFirebase();
  const blogsCollection = firestore.collection('blogs');
  const q = blogsCollection.orderBy('createdAt', 'desc');
  
  try {
    const querySnapshot = await q.get();
    const blogs: Blog[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        blogs.push({ 
            id: doc.id, 
            ...data,
            // Firestore timestamps need to be converted to a serializable format for Next.js pages
            createdAt: data.createdAt.toDate().toISOString(),
        } as Blog);
    });
    return blogs;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    // In case of error (e.g., rules issue), return empty array to prevent crash
    return [];
  }
}

export async function getBlog(id: string): Promise<Blog | null> {
    const { firestore } = initializeFirebase();
    const blogDoc = firestore.collection('blogs').doc(id);
    const docSnap = await blogDoc.get();

    if (docSnap.exists) {
        const data = docSnap.data();
        if (!data) return null;
        // Firestore timestamps need to be converted to a serializable format for Next.js pages
        return { 
            id: docSnap.id, 
            ...data,
            createdAt: data.createdAt.toDate().toISOString(),
        } as Blog;
    } else {
        return null;
    }
}

export async function createBlog(
    post: Omit<Blog, 'id' | 'createdAt' | 'authorName' | 'authorAvatar'>, 
    user: { uid: string, displayName?: string | null, photoURL?: string | null }
) {
    const { firestore } = initializeFirebase();
    const newDocRef = firestore.collection('blogs').doc();
    
    await newDocRef.set({
        ...post,
        id: newDocRef.id,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || '',
        createdAt: new Date() // Use server-side timestamp
    });

    return newDocRef.id;
}
// final commit
