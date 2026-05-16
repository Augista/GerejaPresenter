'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NewPresentationPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const router = useRouter();

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('presentations')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          description: description.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Presentation created');
      router.push(`/presentations/${data.id}/editor`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Presentations
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create New Presentation</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Card className="p-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Presentation Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sunday Service - May 15, 2026"
                disabled={loading}
                className="text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this presentation..."
                disabled={loading}
                className="w-full min-h-24 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Presentation'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
