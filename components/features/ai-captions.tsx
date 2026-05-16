'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Play, Pause, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Groq } from 'groq-sdk';

interface AICaptionsProps {
  userId: string;
}

export function AICaptions({ userId }: AICaptionsProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [captions, setCaptions] = useState<{ time: number; text: string }[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Initialize Groq for AI caption generation
  const groqClient = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processAudioWithAI(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Recording started. Speak to generate captions.');
    } catch (error: any) {
      toast.error('Failed to access audio: ' + error.message);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
      setIsRecording(false);
      toast.success('Recording stopped. Processing audio...');
    }
  };

  const processAudioWithAI = async (audioBlob: Blob) => {
    try {
      setLoading(true);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        // Use Groq's Whisper model for transcription
        const transcription = await groqClient.audio.transcriptions.create({
          file: new File([audioBlob], 'audio.webm', { type: 'audio/webm' }),
          model: 'whisper-large-v3-turbo',
          language: 'id', // Indonesian language
        } as any);

        // Parse transcription and convert to Indonesian
        const indonesianText = transcription.text;

        // Save captions to database
        const newCaptions = [
          {
            time: Date.now(),
            text: indonesianText
          }
        ];

        setCaptions(prev => [...prev, ...newCaptions]);

        // Save to database
        await supabase.from('youtube_captions').insert([{
          user_id: userId,
          youtube_stream_id: youtubeUrl,
          content: indonesianText,
          timestamp: Math.floor(Date.now() / 1000),
          language: 'id'
        }]);

        toast.success('Caption generated in Indonesian');
      };
    } catch (error: any) {
      console.error(' Caption error:', error);
      toast.error('Failed to generate caption: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCaptions = () => {
    const srtContent = captions
      .map((cap, index) => {
        const startTime = new Date(cap.time);
        const endTime = new Date(cap.time + 5000); // 5 second duration
        
        const formatTime = (date: Date) => {
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          const ms = String(date.getMilliseconds()).padStart(3, '0');
          return `${hours}:${minutes}:${seconds},${ms}`;
        };

        return `${index + 1}\n${formatTime(startTime)} --> ${formatTime(endTime)}\n${cap.text}\n`;
      })
      .join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.srt';
    a.click();
    
    toast.success('Captions exported as SRT');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-4">AI Caption Generator (Indonesian)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Record live audio from your church stream and auto-generate Indonesian captions using AI
        </p>

        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex gap-2">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                disabled={loading}
                className="flex-1 bg-destructive hover:bg-destructive/90"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* YouTube URL (Optional) */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              YouTube Stream URL (Optional)
            </label>
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              disabled={isRecording}
            />
          </div>

          {/* Status */}
          {isRecording && (
            <div className="p-3 bg-accent/10 border border-accent rounded-md flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-accent font-medium">Recording in progress...</span>
            </div>
          )}

          {loading && (
            <div className="p-3 bg-primary/10 border border-primary rounded-md flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary font-medium">Processing audio with AI...</span>
            </div>
          )}
        </div>
      </Card>

      {/* Captions List */}
      {captions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-foreground">Generated Captions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCaptions}
            >
              <Download className="w-4 h-4 mr-2" />
              Export SRT
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {captions.map((cap, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(cap.time).toLocaleTimeString()}
                </p>
                <p className="text-sm text-foreground">{cap.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
