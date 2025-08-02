
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

export interface SavedContent {
  id: string; // Firestore document ID
  userId: string;
  title: string;
  tool: string;
  content: string;
  timestamp: Timestamp;
}

export interface NewSavedContent {
  title: string;
  tool: string;
  content: string;
}

export function useSavedContent() {
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((newUser) => {
      setUser(newUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchSavedContent = useCallback(async () => {
    if (!user) {
      setSavedContents([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    try {
      const q = query(
        collection(db, 'savedContent'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const contents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedContent[];
      setSavedContents(contents);
    } catch (error) {
      console.error('Failed to load saved content from Firestore', error);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedContent();
  }, [fetchSavedContent]);

  const saveContent = useCallback(
    async (content: NewSavedContent) => {
      if (!user) {
        console.error('User not logged in, cannot save content.');
        return false;
      }
      try {
        await addDoc(collection(db, 'savedContent'), {
          ...content,
          userId: user.uid,
          timestamp: Timestamp.now(),
        });
        fetchSavedContent(); // Re-fetch to update the list
        return true;
      } catch (error) {
        console.error('Failed to save content to Firestore', error);
        return false;
      }
    },
    [user, fetchSavedContent]
  );

  const deleteContent = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(db, 'savedContent', id));
        fetchSavedContent(); // Re-fetch to update the list
      } catch (error) {
        console.error('Failed to delete content from Firestore', error);
      }
    },
    [fetchSavedContent]
  );

  return { savedContents, saveContent, deleteContent, isLoaded };
}
