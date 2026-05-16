'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Copy, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { toast } from 'sonner';

interface PresentationGridProps {
  presentations: any[];
}

export function PresentationGrid({ presentations: initialPresentations }: PresentationGridProps) {
  const [presentations, setPresentations] = useState(initialPresentations);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this presentation?')) return;
    
    try {
      await supabase.from('presentations').delete().eq('id', id);
      setPresentations(presentations.filter(p => p.id !== id));
      toast.success('Presentation deleted');
    } catch (error) {
      toast.error('Failed to delete presentation');
    }
  };

  const handleDuplicate = async (presentation: any) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: newPres } = await supabase
        .from('presentations')
        .insert([{
          user_id: user.user.id,
          title: `${presentation.title} (Copy)`,
          description: presentation.description
        }])
        .select()
        .single();

      if (newPres) {
        setPresentations([newPres, ...presentations]);
        toast.success('Presentation duplicated');
      }
    } catch (error) {
      toast.error('Failed to duplicate presentation');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {presentations.map((presentation) => (
        <Card key={presentation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary/30 mb-2">Slides</div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-1">
              {presentation.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {presentation.description || 'No description'}
            </p>
            
            <div className="flex gap-2">
              <Link href={`/presentations/${presentation.id}/editor`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Open
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDuplicate(presentation)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(presentation.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
