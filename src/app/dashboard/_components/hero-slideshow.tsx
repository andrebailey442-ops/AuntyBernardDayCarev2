
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { BusyBeeLogo } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resizeImage } from '@/ai/flows/resize-image';
import { Skeleton } from '@/components/ui/skeleton';

type SlideImage = {
    src: string;
    alt: string;
    hint: string;
}

const defaultSlideImages: SlideImage[] = [
    {
        src: "https://picsum.photos/seed/slide1/1200/400",
        alt: "Preschool classroom with children playing",
        hint: "classroom children"
    },
    {
        src: "https://picsum.photos/seed/slide2/1200/400",
        alt: "Children painting in an art class",
        hint: "children painting"
    },
    {
        src: "https://picsum.photos/seed/slide3/1200/400",
        alt: "Kids reading books in a library",
        hint: "children reading"
    }
];

const SLIDESHOW_STORAGE_KEY = 'slideshowImages';

type HeroSlideshowProps = {
    title: string;
};

export default function HeroSlideshow({ title }: HeroSlideshowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [slideImages, setSlideImages] = React.useState<SlideImage[]>(defaultSlideImages);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
      const storedImages = localStorage.getItem(SLIDESHOW_STORAGE_KEY);
      if (storedImages) {
          setSlideImages(JSON.parse(storedImages));
      } else {
          localStorage.setItem(SLIDESHOW_STORAGE_KEY, JSON.stringify(defaultSlideImages));
      }
  }, []);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsResizing(true);
      toast({
          title: 'AI is Adjusting Your Image',
          description: 'Please wait while we resize the image for the slideshow...',
      });

      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const dataUri = e.target?.result as string;
              const resized = await resizeImage({ 
                  photoDataUri: dataUri,
                  targetWidth: 1200,
                  targetHeight: 400,
              });

              if (!resized.imageUrl) {
                  throw new Error("AI failed to return a resized image.");
              }
              
              const newImage: SlideImage = {
                  src: resized.imageUrl,
                  alt: 'User uploaded slideshow image',
                  hint: 'custom image'
              };

              setSlideImages(prev => {
                  const newImages = [...prev, newImage];
                  localStorage.setItem(SLIDESHOW_STORAGE_KEY, JSON.stringify(newImages));
                  return newImages;
              });

              toast({
                  title: 'Image Added',
                  description: 'Your image has been resized and added to the slideshow.',
              });

          } catch (error) {
              console.error("Image resizing failed: ", error);
              toast({
                  variant: 'destructive',
                  title: 'Upload Failed',
                  description: 'The AI could not process your image. Please try another one.',
              });
          } finally {
              setIsResizing(false);
              if (uploadInputRef.current) {
                  uploadInputRef.current.value = '';
              }
          }
      };
      reader.readAsDataURL(file);
  }

  const handleRemoveImage = (index: number) => {
      setSlideImages(prev => {
          const newImages = prev.filter((_, i) => i !== index);
          localStorage.setItem(SLIDESHOW_STORAGE_KEY, JSON.stringify(newImages));
          return newImages;
      });
      toast({
          title: 'Image Removed',
          description: 'The image has been removed from the slideshow.',
      })
  }

  return (
    <div className="relative group">
    <Carousel 
        plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
            }),
        ]}
        className="w-full"
    >
      <CarouselContent>
        {slideImages.map((image, index) => (
          <CarouselItem key={index}>
            <Card className="overflow-hidden relative">
              <CardContent className="p-0">
                <Image
                  alt={image.alt}
                  className="aspect-[3/1] w-full object-cover"
                  height="400"
                  src={image.src}
                  width="1200"
                  data-ai-hint={image.hint}
                  priority={index === 0} // Prioritize loading the first image
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-4">
                    <div className="flex items-center gap-4 bg-black/50 p-6 rounded-lg">
                        <BusyBeeLogo className="h-16 w-16 text-white" />
                        <h1 className="text-5xl font-bold text-white tracking-wider">
                            {title}
                        </h1>
                    </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4" />
      <CarouselNext className="absolute right-4" />
    </Carousel>
    {user?.role === 'Admin' && (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            Edit Slideshow
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Edit Slideshow Images</DialogTitle>
                <DialogDescription>Add or remove images from the hero slideshow.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
                {slideImages.map((image, index) => (
                    <div key={index} className="relative group/image">
                        <Image src={image.src} alt={image.alt} width={300} height={100} className="rounded-md object-cover aspect-[3/1]" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" onClick={() => handleRemoveImage(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {isResizing && (
                    <div className="flex items-center justify-center aspect-[3/1] border-2 border-dashed rounded-md">
                        <div className="text-center space-y-2">
                            <Wand2 className="h-8 w-8 mx-auto animate-pulse text-primary" />
                            <p className="text-sm text-muted-foreground">AI is resizing...</p>
                        </div>
                    </div>
                )}
            </div>
             <input type="file" ref={uploadInputRef} className="hidden" onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" />
            <Button onClick={() => uploadInputRef.current?.click()} disabled={isResizing}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
            </Button>
        </DialogContent>
      </Dialog>
    )}
    </div>
  );
}
