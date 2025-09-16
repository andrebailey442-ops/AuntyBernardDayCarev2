
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

const slideImages = [
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
]

type HeroSlideshowProps = {
    title: string;
};

export default function HeroSlideshow({ title }: HeroSlideshowProps) {
  return (
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
  );
}
