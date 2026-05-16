'use client';

import { useEffect, useState } from 'react';
import { Slide, SlideLayer } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LayerRenderer } from './layer-renderer';
import { toast } from 'sonner';

interface SlideCanvasProps {
  slide: Slide;
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
}

export function SlideCanvas({ slide, selectedLayerId, onSelectLayer }: SlideCanvasProps) {
  const [layers, setLayers] = useState<SlideLayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLayers = async () => {
      try {
        const { data } = await supabase
          .from('slide_layers')
          .select('*')
          .eq('slide_id', slide.id)
          .order('order', { ascending: true });

        setLayers(data || []);
      } catch (error) {
        console.error(' Error loading layers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLayers();
  }, [slide.id]);

  const handleAddLayer = async (type: SlideLayer['type']) => {
    try {
      const newOrder = layers.length > 0 ? Math.max(...layers.map(l => l.order)) + 1 : 0;

      const { data, error } = await supabase
        .from('slide_layers')
        .insert([{
          slide_id: slide.id,
          type,
          order: newOrder,
          visible: true,
          opacity: 1,
          blend_mode: 'normal',
          content: { type: 'text', data: {} }
        }])
        .select()
        .single();

      if (error) throw error;

      setLayers([...layers, data]);
      onSelectLayer(data.id);
      toast.success('Layer added');
    } catch (error: any) {
      toast.error('Failed to add layer');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading slide...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Toolbar */}
      <div className="border-b border-border bg-card p-4 flex items-center gap-2">
        <div className="text-sm font-medium text-foreground mr-4">Add Layer:</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddLayer('background')}
        >
          Background
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddLayer('content')}
        >
          Content
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddLayer('overlay')}
        >
          Overlay
        </Button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg" style={{ aspectRatio: '16/9' }}>
          {/* Slide Canvas */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {layers.map((layer) => (
              <LayerRenderer
                key={layer.id}
                layer={layer}
                selected={selectedLayerId === layer.id}
                onSelect={() => onSelectLayer(layer.id)}
              />
            ))}

            {layers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-primary/5 to-accent/5">
                <p>Add layers to build your slide</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
