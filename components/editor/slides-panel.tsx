'use client';

import { Slide } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface SlidesPanelProps {
  slides: Slide[];
  selectedSlideId: string | null;
  onSelectSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onReorderSlides: (slides: Slide[]) => void;
}

export function SlidesPanel({
  slides,
  selectedSlideId,
  onSelectSlide,
  onDeleteSlide,
  onReorderSlides,
}: SlidesPanelProps) {
  const [draggedSlide, setDraggedSlide] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, slideId: string) => {
    setDraggedSlide(slideId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSlideId: string) => {
    e.preventDefault();
    
    if (!draggedSlide || draggedSlide === targetSlideId) return;

    const draggedIndex = slides.findIndex(s => s.id === draggedSlide);
    const targetIndex = slides.findIndex(s => s.id === targetSlideId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSlides = [...slides];
    const [removed] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, removed);

    onReorderSlides(newSlides);
    setDraggedSlide(null);
  };

  return (
    <div className="space-y-2">
      {slides.map((slide, index) => (
        <Card
          key={slide.id}
          draggable
          onDragStart={(e) => handleDragStart(e, slide.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, slide.id)}
          onClick={() => onSelectSlide(slide.id)}
          className={`p-3 cursor-move transition-all ${
            selectedSlideId === slide.id
              ? 'ring-2 ring-primary bg-primary/5'
              : 'hover:bg-muted/50'
          } ${draggedSlide === slide.id ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Slide {index + 1}</p>
              <p className="text-sm font-medium text-foreground truncate">{slide.title}</p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSlide(slide.id);
              }}
              className="flex-shrink-0"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
