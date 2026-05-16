'use client';

import { useEffect, useState } from 'react';
import { Slide, StageDisplayConfig } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface StageDisplayProps {
  presentationId: string;
  currentSlide?: Slide;
  nextSlide?: Slide;
  notes?: string;
}

export function StageDisplay({
  presentationId,
  currentSlide,
  nextSlide,
  notes
}: StageDisplayProps) {
  const [config, setConfig] = useState<StageDisplayConfig | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, [presentationId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setElapsed(e => e + 1);

      if (countdownActive && countdownTime > 0) {
        setCountdownTime(t => t - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownActive, countdownTime]);

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from('stage_display_configs')
        .select('*')
        .eq('presentation_id', presentationId)
        .single();

      setConfig(data || {
        show_current_slide: true,
        show_next_slide: true,
        show_timer: true,
        show_notes: true,
        show_clock: true
      } as StageDisplayConfig);
    } catch (error) {
      console.error(' Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<StageDisplayConfig>) => {
    try {
      if (config?.id) {
        const { data } = await supabase
          .from('stage_display_configs')
          .update(updates)
          .eq('id', config.id)
          .select()
          .single();

        setConfig(data);
      } else {
        const { data } = await supabase
          .from('stage_display_configs')
          .insert([{ presentation_id: presentationId, ...updates }])
          .select()
          .single();

        setConfig(data);
      }
      
      toast.success('Stage display updated');
    } catch (error: any) {
      toast.error('Failed to update stage display');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading stage display...</p>;
  }

  return (
    <div className="bg-black text-white min-h-screen p-8 font-sans">
      <div className="grid grid-cols-3 gap-8 h-full">
        {/* Main Display Area */}
        <div className="col-span-2 space-y-6">
          {/* Current Slide */}
          {config?.show_current_slide && currentSlide && (
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-8 min-h-96 flex items-center justify-center border border-primary/20">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">CURRENT SLIDE</p>
                <h1 className="text-5xl font-bold text-white">{currentSlide.title}</h1>
                {currentSlide.duration && (
                  <p className="text-lg text-gray-400 mt-4">Duration: {currentSlide.duration}s</p>
                )}
              </div>
            </div>
          )}

          {/* Next Slide Preview */}
          {config?.show_next_slide && nextSlide && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Next Slide</p>
              <h2 className="text-2xl font-semibold text-gray-200">{nextSlide.title}</h2>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Clock */}
          {config?.show_clock && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Current Time</p>
              <p className="text-3xl font-bold text-white font-mono">
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Timer */}
          {config?.show_timer && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Presentation Timer</p>
              <p className="text-4xl font-bold text-primary font-mono">{formatTime(elapsed)}</p>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setElapsed(0)}
                className="w-full text-xs"
              >
                Reset Timer
              </Button>
            </div>
          )}

          {/* Countdown */}
          {config?.countdown_duration !== undefined && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Countdown</p>
              <p className={`text-4xl font-bold font-mono ${countdownTime > 10 ? 'text-gray-400' : 'text-destructive'}`}>
                {formatTime(countdownTime)}
              </p>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (countdownActive) {
                    setCountdownActive(false);
                  } else {
                    setCountdownTime(config.countdown_duration || 300);
                    setCountdownActive(true);
                  }
                }}
                className="w-full text-xs"
              >
                {countdownActive ? 'Pause' : 'Start'} Countdown
              </Button>
            </div>
          )}

          {/* Notes */}
          {config?.show_notes && notes && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 max-h-48 overflow-y-auto">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Button (bottom right) */}
      <div className="fixed bottom-6 right-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            updateConfig({
              show_timer: !config?.show_timer,
              show_clock: !config?.show_clock,
              show_notes: !config?.show_notes,
              show_current_slide: !config?.show_current_slide,
              show_next_slide: !config?.show_next_slide
            });
          }}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
