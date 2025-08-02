
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SavedContent {
  id: string;
  title: string;
  tool: string;
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'eduai-scholar-saved-content';

export function useSavedContent() {
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        setSavedContents(JSON.parse(items));
      }
    } catch (error) {
      console.error("Failed to load saved content from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveContent = useCallback((content: Omit<SavedContent, 'id' | 'timestamp'>) => {
    try {
      const newContent: SavedContent = {
        ...content,
        id: `saved-${Date.now()}`,
        timestamp: Date.now(),
      };
      const newSavedContents = [newContent, ...savedContents];
      setSavedContents(newSavedContents);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedContents));
      return true;
    } catch (error) {
      console.error("Failed to save content to localStorage", error);
      return false;
    }
  }, [savedContents]);
  
  const deleteContent = useCallback((id: string) => {
    try {
      const newSavedContents = savedContents.filter(item => item.id !== id);
      setSavedContents(newSavedContents);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedContents));
    } catch (error) {
      console.error("Failed to delete content from localStorage", error);
    }
  }, [savedContents]);

  return { savedContents, saveContent, deleteContent, isLoaded };
}
