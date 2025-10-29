
import { initializeFirebase } from "@/firebase/server";
import { collection, getDocs, query, orderBy, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Blog } from "./types";

export async function getBlogs(): Promise<Blog[]> {
  const { firestore } = initializeFirebase();
  const blogsCollection = collection(firestore, 'blogs');
  const q = query(blogsCollection, orderBy('createdAt', 'desc'));
  
  try {
    const querySnapshot = await getDocs(q);
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
    const blogDoc = doc(firestore, 'blogs', id);
    const docSnap = await getDoc(blogDoc);

    if (docSnap.exists()) {
        const data = docSnap.data();
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
    const newDocRef = doc(collection(firestore, 'blogs'));
    
    await setDoc(newDocRef, {
        ...post,
        id: newDocRef.id,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || '',
        createdAt: serverTimestamp()
    });

    return newDocRef.id;
}
