'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SlideLayer } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PropertiesPanelProps {
  slideId: string;
  layerId: string;
  onUpdate: () => void;
}

export function PropertiesPanel({ slideId, layerId, onUpdate }: PropertiesPanelProps) {
  const [layer, setLayer] = useState<SlideLayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [localText, setLocalText] = useState('');
  const [localOpacity, setLocalOpacity] = useState(1);

  useEffect(() => {
    const loadLayer = async () => {
      try {
        const { data } = await supabase
          .from('slide_layers')
          .select('*')
          .eq('id', layerId)
          .single();

        setLayer(data);
        setLocalText(data?.content?.data?.text || '');
        setLocalOpacity(data?.opacity ?? 1);
      } catch (error) {
        console.error(' Error loading layer:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLayer();
  }, [layerId]);

  const handleUpdate = async (updates: Partial<SlideLayer>) => {
    try {
      const { data, error } = await supabase
        .from('slide_layers')
        .update(updates)
        .eq('id', layerId)
        .select()
        .single();

      if (error) throw error;

      setLayer(data);
      onUpdate();
      toast.success('Layer updated');
    } catch (error: any) {
      toast.error('Failed to update layer');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this layer?')) return;

    try {
      await supabase.from('slide_layers').delete().eq('id', layerId);
      toast.success('Layer deleted');
      onUpdate();
    } catch (error: any) {
      toast.error('Failed to delete layer');
    }
  };

  if (loading || !layer) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Layer Info */}
      <div>
        <h3 className="font-semibold text-foreground mb-2 capitalize">{layer.type} Layer</h3>
        <p className="text-xs text-muted-foreground">Order: {layer.order + 1}</p>
      </div>

      {/* Visibility */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          {layer.visible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
          Visibility
        </label>
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => handleUpdate({ visible: !layer.visible })}
        >
          {layer.visible ? 'Hide' : 'Show'}
        </Button>
      </div>

      {/* Opacity */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Opacity: {Math.round(localOpacity * 100)}%
        </label>
        <Slider
          value={[localOpacity]}
          onValueChange={([value]) => setLocalOpacity(value)}
          onValueChangeCommit={([value]) => handleUpdate({ opacity: value })}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Text Content (if applicable) */}
      {(layer.type === 'content' || layer.type === 'overlay') && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Text</label>
          <textarea
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={() => handleUpdate({
              content: {
                ...layer.content,
                data: { ...layer.content.data, text: localText }
              }
            })}
            placeholder="Enter text..."
            className="w-full min-h-20 p-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Blend Mode */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Blend Mode</label>
        <select
          value={layer.blend_mode}
          onChange={(e) => handleUpdate({ blend_mode: e.target.value })}
          className="w-full px-2 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="normal">Normal</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
          <option value="lighten">Lighten</option>
          <option value="darken">Darken</option>
        </select>
      </div>

      {/* Delete Button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Layer
        </Button>
      </div>
    </div>
  );
}
