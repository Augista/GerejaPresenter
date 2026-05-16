'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AICaptions } from '@/components/features/ai-captions';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'id' | 'en'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        try {
          const { data } = await supabase
            .from('translation_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data) {
            setLanguage(data.primary_language);
          }
        } catch (error) {
          console.error(' Error loading settings:', error);
        }
      }
      
      setLoading(false);
    };

    checkUser();
  }, [supabase]);

  const handleLanguageChange = async (newLanguage: 'id' | 'en') => {
    if (!user) return;

    try {
      const existing = await supabase
        .from('translation_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existing.data) {
        await supabase
          .from('translation_settings')
          .update({ primary_language: newLanguage })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('translation_settings')
          .insert([{
            user_id: user.id,
            primary_language: newLanguage,
            auto_translate: false
          }]);
      }

      setLanguage(newLanguage);
      toast.success('Language updated');
    } catch (error: any) {
      toast.error('Failed to update language');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to access settings</p>
          <Link href="/auth/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Account Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Account Created</label>
              <Input
                value={new Date(user.created_at).toLocaleDateString()}
                disabled
                className="bg-muted"
              />
            </div>

            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirm('Are you sure you want to logout?')) return;
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
            >
              Logout
            </Button>
          </div>
        </Card>

        {/* Language & Localization */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Language & Localization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Primary Language</label>
              <div className="flex gap-2">
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => handleLanguageChange('en')}
                  className={language === 'en' ? 'bg-primary hover:bg-primary/90' : ''}
                >
                  English
                </Button>
                <Button
                  variant={language === 'id' ? 'default' : 'outline'}
                  onClick={() => handleLanguageChange('id')}
                  className={language === 'id' ? 'bg-primary hover:bg-primary/90' : ''}
                >
                  Indonesian (Bahasa Indonesia)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Choose your preferred language for the interface. Indonesian captions will be generated from live streams.
              </p>
            </div>
          </div>
        </Card>

        {/* AI Features */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">AI Features</h2>
          <AICaptions userId={user.id} />
        </div>

        {/* Display & Multi-Screen */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Display & Multi-Screen</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              CorneliusPresenter supports multiple displays including:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Stage Display (for musicians/speakers with notes, timer, next slide)</li>
              <li>Presenter View (main editing + monitoring)</li>
              <li>Audience Display (projection)</li>
              <li>Confidence Monitor (speaker notes)</li>
            </ul>
            <p className="text-xs text-muted-foreground bg-muted p-3 rounded">
              Multi-display configuration is managed per presentation in the editor.
            </p>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h2 className="text-xl font-semibold text-foreground mb-2">About CorneliusPresenter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Modern, minimalist presentation software for churches with advanced features including:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Multi-layer slide system with drag-drop editing</li>
            <li>Lyrics with keyword search and word animations</li>
            <li>Media management with video/audio/image support</li>
            <li>Beat detection for automatic slide transitions</li>
            <li>AI-powered Indonesian caption generation</li>
            <li>Stage display with notes and timers</li>
            <li>Bible integration with translations</li>
            <li>Theme editor and graphic templates</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
