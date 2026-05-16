'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LyricAnimation } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface LyricAnimationBuilderProps {
  lyricId: string;
  lyricContent: string;
}

const ANIMATION_TYPES = ['fade', 'slide', 'scale'] as const;

export function LyricAnimationBuilder({ lyricId, lyricContent }: LyricAnimationBuilderProps) {
  const [animations, setAnimations] = useState<LyricAnimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState(false);

  const words = lyricContent.split(' ').filter(w => w.length > 0);

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const { data } = await supabase
          .from('lyric_animations')
          .select('*')
          .eq('lyric_id', lyricId)
          .order('word_index', { ascending: true });

        setAnimations(data || []);
      } catch (error) {
        console.error(' Error loading animations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnimations();
  }, [lyricId]);

  const handleAddAnimation = async () => {
    try {
      const { data, error } = await supabase
        .from('lyric_animations')
        .insert([{
          lyric_id: lyricId,
          word_index: selectedWordIndex,
          animation_type: 'fade',
          duration: 500,
          delay: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setAnimations([...animations, data]);
      toast.success('Animation added');
    } catch (error: any) {
      toast.error('Failed to add animation');
    }
  };

  const handleUpdateAnimation = async (animationId: string, updates: Partial<LyricAnimation>) => {
    try {
      const { data, error } = await supabase
        .from('lyric_animations')
        .update(updates)
        .eq('id', animationId)
        .select()
        .single();

      if (error) throw error;

      setAnimations(animations.map(a => a.id === animationId ? data : a));
      toast.success('Animation updated');
    } catch (error: any) {
      toast.error('Failed to update animation');
    }
  };

  const handleDeleteAnimation = async (animationId: string) => {
    try {
      await supabase.from('lyric_animations').delete().eq('id', animationId);
      setAnimations(animations.filter(a => a.id !== animationId));
      toast.success('Animation deleted');
    } catch (error: any) {
      toast.error('Failed to delete animation');
    }
  };

  const getAnimationForWord = (index: number) => {
    return animations.find(a => a.word_index === index);
  };

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading animations...</p>;
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg text-foreground mb-4">Word Animation Builder</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Build animations for worship songs with simple fade, slide, and scale effects
        </p>
      </div>

      {/* Preview */}
      <div className="border border-border rounded-lg p-4 bg-muted/20 min-h-24 flex items-center justify-center">
        {previewMode ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {words.map((word, index) => {
              const animation = getAnimationForWord(index);
              return (
                <span
                  key={index}
                  className={`text-2xl font-semibold text-foreground transition-all ${
                    animation ? `animate-${animation.animation_type}` : ''
                  }`}
                  style={{
                    animation: animation
                      ? `${animation.animation_type} ${animation.duration}ms ${animation.delay}ms ease-out`
                      : 'none'
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {words.map((word, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                  selectedWordIndex === index
                    ? 'bg-primary text-primary-foreground'
                    : getAnimationForWord(index)
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setSelectedWordIndex(index)}
              >
                {word}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preview Toggle */}
      <Button
        variant="outline"
        onClick={() => setPreviewMode(!previewMode)}
        className="w-full"
      >
        <Play className="w-4 h-4 mr-2" />
        {previewMode ? 'Stop Preview' : 'Preview Animation'}
      </Button>

      {/* Word Selection & Animation Setup */}
      {!previewMode && (
        <div className="space-y-4 border-t border-border pt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Selected Word: <span className="text-primary">{words[selectedWordIndex]}</span>
            </label>

            {getAnimationForWord(selectedWordIndex) ? (
              <AnimationSettings
                animation={getAnimationForWord(selectedWordIndex)!}
                onUpdate={(updates) =>
                  handleUpdateAnimation(getAnimationForWord(selectedWordIndex)!.id, updates)
                }
                onDelete={() =>
                  handleDeleteAnimation(getAnimationForWord(selectedWordIndex)!.id)
                }
              />
            ) : (
              <Button onClick={handleAddAnimation} className="bg-primary hover:bg-primary/90 w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Animation
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Animation List */}
      {animations.length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Animations</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {animations.map((anim) => (
              <div key={anim.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <span className="text-sm flex-1">
                  <span className="font-medium">{words[anim.word_index]}</span>
                  <span className="text-muted-foreground ml-2">
                    {anim.animation_type} ({anim.duration}ms)
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAnimation(anim.id)}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

interface AnimationSettingsProps {
  animation: LyricAnimation;
  onUpdate: (updates: Partial<LyricAnimation>) => void;
  onDelete: () => void;
}

function AnimationSettings({ animation, onUpdate, onDelete }: AnimationSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Type</label>
        <select
          value={animation.animation_type}
          onChange={(e) =>
            onUpdate({ animation_type: e.target.value as typeof animation.animation_type })
          }
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {ANIMATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Duration: {animation.duration}ms
        </label>
        <Slider
          value={[animation.duration]}
          onValueChange={([value]) => onUpdate({ duration: value })}
          min={100}
          max={2000}
          step={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Delay: {animation.delay}ms
        </label>
        <Slider
          value={[animation.delay]}
          onValueChange={([value]) => onUpdate({ delay: value })}
          min={0}
          max={1000}
          step={50}
        />
      </div>

      {animation.direction && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Direction</label>
          <select
            value={animation.direction}
            onChange={(e) => onUpdate({ direction: e.target.value as any })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}

      <Button variant="destructive" className="w-full" onClick={onDelete}>
        <Trash2 className="w-4 h-4 mr-2" />
        Remove Animation
      </Button>
    </div>
  );
}
