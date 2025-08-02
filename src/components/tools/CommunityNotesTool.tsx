
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { UploadCloud, Image as ImageIcon, Users } from 'lucide-react';
import Image from 'next/image';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Skeleton } from '../ui/skeleton';

interface CommunityNote {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  authorName: string;
  authorPhotoUrl: string;
  timestamp: Timestamp;
}

export default function CommunityNotesTool() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [notes, setNotes] = useState<CommunityNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for storage
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImagePreview(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    try {
      const q = query(collection(db, 'communityNotes'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedNotes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CommunityNote[];
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching community notes: ", error);
      toast({
        title: "Error",
        description: "Could not load community notes. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNotes(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !imageFile) {
      toast({
        title: 'All Fields Required',
        description: 'Please provide a title, description, and an image.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to share notes.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `community-notes/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // 2. Add note metadata to Firestore
      await addDoc(collection(db, 'communityNotes'), {
        title,
        description,
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoUrl: user.photoURL || '',
        timestamp: Timestamp.now(),
      });
      
      toast({
        title: "Note Shared!",
        description: "Your note is now available for the community.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      
      // Refresh notes
      fetchNotes();

    } catch (error) {
      console.error("Error uploading note: ", error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error sharing your note. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Community Notes</h1>
        <p className="text-muted-foreground mt-2">
          Share your knowledge and learn from others. Upload your study materials here.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Share Your Notes</CardTitle>
            <CardDescription>
              Upload an image of your notes along with a title and description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid w-full gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Summary of Photosynthesis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading || !user}
                required
              />
            </div>
             <div className="grid w-full gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., A one-page summary of the key concepts in Chapter 3."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading || !user}
                required
              />
            </div>

            <div>
              <Label htmlFor="image-upload">Note Image</Label>
              <div className="mt-2 relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-64">
                {!imagePreview && (
                  <>
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      Drag & drop an image here, or click to select a file
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Max file size: 5MB</p>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading || !user}
                      required
                    />
                  </>
                )}
                {imagePreview && (
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreview}
                      alt="Uploaded notes preview"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to share your notes with the community.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUploading || isLoading || !user}>
              {isUploading && <LoadingSpinner className="mr-2" />}
              {isUploading ? 'Sharing...' : 'Share with Community'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-headline">Shared by the Community</h2>
          <p className="text-muted-foreground mt-2">
            Browse and learn from notes uploaded by other students.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingNotes && Array.from({ length: 6 }).map((_, i) => (
             <Card key={i} className="flex flex-col">
              <CardHeader className="flex-row gap-4 items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                   <Skeleton className="h-4 w-3/4" />
                   <Skeleton className="h-3 w-1/2" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                 <Skeleton className="h-48 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
          {!isLoadingNotes && notes.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">No community notes have been shared yet. Be the first!</p>
          )}
          {notes.map(note => (
            <Card key={note.id} className="flex flex-col">
              <CardHeader className='flex-row gap-3 items-center'>
                 <Image src={note.authorPhotoUrl || `https://placehold.co/40x40.png`} alt={note.authorName} width={40} height={40} className="rounded-full" data-ai-hint="person" />
                 <div>
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <CardDescription>by {note.authorName}</CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">{note.description}</p>
              </CardContent>
              <CardFooter>
                <a href={note.imageUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Image src={note.imageUrl} alt={note.title} width={400} height={300} className="w-full h-48 object-cover rounded-md transition-transform hover:scale-105" data-ai-hint="document study" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
