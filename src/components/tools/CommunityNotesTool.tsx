
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { UploadCloud, FileText, X } from 'lucide-react';
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
  fileUrls: string[];
  fileTypes: string[];
  authorName: string;
  authorPhotoUrl: string;
  timestamp: Timestamp;
}

interface FilePreview {
  file: File;
  previewUrl: string;
}

export default function CommunityNotesTool() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [notes, setNotes] = useState<CommunityNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles(prev => [...prev, ...newFiles]);

      const newPreviews = newFiles.map(file => {
        return { file, previewUrl: URL.createObjectURL(file) };
      });
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(file => file !== fileToRemove));
    setPreviews(prev => prev.filter(p => p.file !== fileToRemove));
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
    if (!title.trim() || !description.trim() || files.length === 0) {
      toast({
        title: 'All Fields Required',
        description: 'Please provide a title, description, and at least one file.',
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
      // 1. Upload files to Firebase Storage
      const uploadPromises = files.map(file => {
        const storageRef = ref(storage, `community-notes/${Date.now()}_${file.name}`);
        return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
      });

      const fileUrls = await Promise.all(uploadPromises);
      const fileTypes = files.map(file => file.type);

      // 2. Add note metadata to Firestore
      await addDoc(collection(db, 'communityNotes'), {
        title,
        description,
        fileUrls,
        fileTypes,
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
      setFiles([]);
      setPreviews([]);
      
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
              Upload images or PDFs of your notes along with a title and description.
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
              <Label htmlFor="file-upload" className="font-medium">Note Files (Images or PDF)</Label>
               <div className="mt-2 relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[16rem]">
                 <UploadCloud className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Drag & drop files here, or click to select files
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Images and PDFs supported</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading || !user}
                    multiple
                  />
              </div>
            </div>
            
            {previews.length > 0 && (
              <div>
                <p className="font-medium mb-2">Selected Files:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {previews.map((item, index) => (
                    <div key={index} className="relative group">
                       {item.file.type.startsWith('image/') ? (
                         <Image
                            src={item.previewUrl}
                            alt={item.file.name}
                            width={150}
                            height={150}
                            className="w-full h-32 object-cover rounded-md"
                          />
                       ) : (
                         <div className="w-full h-32 bg-muted rounded-md flex flex-col items-center justify-center p-2">
                           <FileText className="w-12 h-12 text-muted-foreground" />
                           <p className="text-xs text-center text-muted-foreground mt-2 truncate">{item.file.name}</p>
                         </div>
                       )}
                       <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 rounded-full h-6 w-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(item.file)}
                        disabled={isUploading}
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!user && (
              <p className="text-sm text-center text-destructive">
                Please sign in to share your notes with the community.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUploading || !user || !title.trim() || !description.trim() || files.length === 0}>
              {isUploading && <LoadingSpinner className="mr-2" />}
              {isUploading ? `Sharing ${files.length} file(s)...` : 'Share with Community'}
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
                 <div className="w-full">
                    {note.fileUrls && note.fileUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {note.fileUrls.map((url, index) => (
                           <a href={url} target="_blank" rel="noopener noreferrer" key={index} className="w-full">
                           {note.fileTypes[index]?.startsWith('image/') ? (
                               <Image src={url} alt={`${note.title} - file ${index + 1}`} width={200} height={150} className="w-full h-32 object-cover rounded-md transition-transform hover:scale-105" data-ai-hint="document study" />
                           ) : (
                                <div className="w-full h-32 bg-muted rounded-md flex flex-col items-center justify-center p-2 transition-colors hover:bg-muted/80">
                                   <FileText className="w-10 h-10 text-muted-foreground" />
                                   <p className="text-xs text-center text-primary mt-2">View PDF</p>
                                </div>
                           )}
                         </a>
                        ))}
                      </div>
                    ) : (
                       <div className="w-full h-32 bg-muted rounded-md flex flex-col items-center justify-center">
                          <p className="text-sm text-muted-foreground">No files attached</p>
                        </div>
                    )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
