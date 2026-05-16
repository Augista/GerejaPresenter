'use client';

import { useState, useEffect } from 'react';
import { Presentation, Slide } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { SlidesPanel } from './slides-panel';
import { SlideCanvas } from './slide-canvas';
import { PropertiesPanel } from './properties-panel';
import { toast } from 'sonner';

interface PresentationEditorProps {
  presentation: Presentation;
  initialSlides: Slide[];
}

export function PresentationEditor({ presentation, initialSlides }: PresentationEditorProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(
    initialSlides.length > 0 ? initialSlides[0].id : null
  );
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const selectedSlide = slides.find(s => s.id === selectedSlideId);

  const handleAddSlide = async () => {
    try {
      const newOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) + 1 : 0;
      
      const { data, error } = await supabase
        .from('slides')
        .insert([{
          presentation_id: presentation.id,
          order: newOrder,
          title: `Slide ${newOrder + 1}`
        }])
        .select()
        .single();

      if (error) throw error;

      setSlides([...slides, data]);
      setSelectedSlideId(data.id);
      toast.success('Slide added');
    } catch (error: any) {
      toast.error('Failed to add slide');
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm('Delete this slide?')) return;

    try {
      await supabase.from('slides').delete().eq('id', slideId);
      
      const newSlides = slides.filter(s => s.id !== slideId);
      setSlides(newSlides);
      
      if (selectedSlideId === slideId) {
        setSelectedSlideId(newSlides.length > 0 ? newSlides[0].id : null);
      }
      
      toast.success('Slide deleted');
    } catch (error: any) {
      toast.error('Failed to delete slide');
    }
  };

  const handleReorderSlides = async (newSlides: Slide[]) => {
    setSlides(newSlides);
    
    try {
      const updates = newSlides.map((slide, index) => ({
        id: slide.id,
        order: index
      }));

      await supabase.from('slides').upsert(updates, { onConflict: 'id' });
      toast.success('Slides reordered');
    } catch (error: any) {
      toast.error('Failed to reorder slides');
    }
  };

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Slides Panel */}
      <div className="w-64 border-r border-border bg-card overflow-y-auto">
        <div className="p-4 space-y-4">
          <Button onClick={handleAddSlide} className="w-full bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Slide
          </Button>
          
          <SlidesPanel
            slides={slides}
            selectedSlideId={selectedSlideId}
            onSelectSlide={setSelectedSlideId}
            onDeleteSlide={handleDeleteSlide}
            onReorderSlides={handleReorderSlides}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-muted/30 overflow-auto">
        {selectedSlide ? (
          <SlideCanvas
            slide={selectedSlide}
            onSelectLayer={setSelectedLayerId}
            selectedLayerId={selectedLayerId}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No slides yet</p>
              <Button onClick={handleAddSlide} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create First Slide
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Properties Panel */}
      <div className="w-72 border-l border-border bg-card overflow-y-auto">
        {selectedSlide && selectedLayerId ? (
          <PropertiesPanel
            slideId={selectedSlide.id}
            layerId={selectedLayerId}
            onUpdate={() => {}}
          />
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <p>Select a layer to edit properties</p>
          </div>
        )}
      </div>
    </div>
  );
}
