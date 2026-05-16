'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Presentation, Slide } from '@/types/database';
import { PresentationEditor } from '@/components/editor/presentation-editor';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Play } from 'lucide-react';

export default function EditorPage({ params }: { params: { id: string } }) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const initSupabase = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (url && key && url !== 'your-supabase-url') {
        return createClient(url, key);
      }
      return null;
    };

    const client = initSupabase();
    setSupabase(client);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const loadPresentation = async () => {
      try {
        const { data: pres } = await supabase
          .from('presentations')
          .select('*')
          .eq('id', params.id)
          .single();

        const { data: slidesData } = await supabase
          .from('slides')
          .select('*')
          .eq('presentation_id', params.id)
          .order('order', { ascending: true });

        setPresentation(pres);
        setSlides(slidesData || []);
      } catch (error) {
        console.error(' Error loading presentation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPresentation();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading presentation...</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Presentation not found</p>
          <Link href="/dashboard">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-foreground">{presentation.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <PresentationEditor 
        presentation={presentation}
        initialSlides={slides}
      />
    </div>
  );
}
