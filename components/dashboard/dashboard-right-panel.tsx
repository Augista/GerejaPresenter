'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Settings,
  Check,
  X,
  QrCode,
  Wand2,
  Send,
  Loader2,
  ImageOff,
  MicOff,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { Media } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnimationParams {
  animationType: 'gradient_flow' | 'particles' | 'waves' | 'bokeh' | 'aurora';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  speed: 'slow' | 'medium' | 'fast';
  brightness: 'dark' | 'medium' | 'bright';
  particleCount: number;
  description: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  params?: AnimationParams | null;
}

interface DashboardRightPanelProps {
  user: any;
  presentations: any[];
  media: Media[];
  mediaLoading: boolean;
  onMediaRefresh?: () => void;
  onClearLyricsSuccess?: () => void;
}

// ─── Canvas animation helpers ─────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function initAnimState(params: AnimationParams, W: number, H: number): any {
  if (params.animationType === 'particles') {
    const count = params.particleCount || 60;
    const colors = [params.primaryColor, params.secondaryColor, params.accentColor];
    return {
      particles: Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.4,
        r: Math.random() * 3 + 1,
        op: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * 3)],
      })),
    };
  }
  if (params.animationType === 'bokeh') {
    const colors = [params.primaryColor, params.secondaryColor, params.accentColor];
    return {
      circles: Array.from({ length: 18 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 110 + 40,
        op: Math.random() * 0.25 + 0.05,
        dx: (Math.random() - 0.5) * 0.7,
        dy: (Math.random() - 0.5) * 0.7,
        color: colors[Math.floor(Math.random() * 3)],
      })),
    };
  }
  return {};
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  params: AnimationParams,
  state: any
) {
  const s = params.speed === 'slow' ? 0.4 : params.speed === 'fast' ? 1.8 : 1;
  const ts = t * s;

  switch (params.animationType) {
    case 'gradient_flow':
      drawGradientFlow(ctx, W, H, ts, params);
      break;
    case 'particles':
      drawParticles(ctx, W, H, params, state);
      break;
    case 'waves':
      drawWaves(ctx, W, H, ts, params);
      break;
    case 'bokeh':
      drawBokeh(ctx, W, H, ts, params, state);
      break;
    case 'aurora':
      drawAurora(ctx, W, H, ts, params);
      break;
    default:
      drawGradientFlow(ctx, W, H, ts, params);
  }
}

function drawGradientFlow(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  p: AnimationParams
) {
  const a = t * 0.4;
  const cx = W / 2 + Math.cos(a) * W * 0.4;
  const cy = H / 2 + Math.sin(a * 0.7) * H * 0.35;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, p.primaryColor);
  bg.addColorStop(0.5 + Math.sin(a) * 0.3, p.secondaryColor);
  bg.addColorStop(1, p.accentColor);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.65);
  g1.addColorStop(0, rgba(p.accentColor, 0.45));
  g1.addColorStop(1, rgba(p.accentColor, 0));
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const cx2 = W - cx;
  const cy2 = H - cy;
  const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, W * 0.55);
  g2.addColorStop(0, rgba(p.secondaryColor, 0.35));
  g2.addColorStop(1, rgba(p.secondaryColor, 0));
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  p: AnimationParams,
  state: any
) {
  const bg = p.brightness === 'bright' ? '#101040' : '#050510';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (const pt of state.particles) {
    pt.x += pt.vx;
    pt.y += pt.vy;
    if (pt.x < -10) pt.x = W + 10;
    if (pt.x > W + 10) pt.x = -10;
    if (pt.y < -10) pt.y = H + 10;
    if (pt.y > H + 10) pt.y = -10;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(pt.color, pt.op);
    ctx.fill();

    const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r * 4);
    glow.addColorStop(0, rgba(pt.color, 0.25));
    glow.addColorStop(1, rgba(pt.color, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.r * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  p: AnimationParams
) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, p.primaryColor);
  bg.addColorStop(1, p.secondaryColor);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 5; i++) {
    const off = (i / 5) * Math.PI * 2;
    const amp = H * 0.09 * (1 - i * 0.08);
    const freq = 2 + i * 0.6;
    const yBase = H * (0.28 + i * 0.12);
    const spd = t * (1 + i * 0.25);
    const op = 0.12 + i * 0.06;

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) {
      const y = yBase + Math.sin((x / W) * freq * Math.PI * 2 + spd + off) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = rgba(p.accentColor, op);
    ctx.fill();
  }
}

function drawBokeh(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  _p: AnimationParams,
  state: any
) {
  ctx.fillStyle = '#000810';
  ctx.fillRect(0, 0, W, H);

  for (const c of state.circles) {
    c.x += c.dx;
    c.y += c.dy;
    if (c.x < -c.r) c.x = W + c.r;
    if (c.x > W + c.r) c.x = -c.r;
    if (c.y < -c.r) c.y = H + c.r;
    if (c.y > H + c.r) c.y = -c.r;

    const pulse = 1 + Math.sin(t * 2 + c.x * 0.01) * 0.18;
    const r = c.r * pulse;
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
    g.addColorStop(0, rgba(c.color, c.op));
    g.addColorStop(0.5, rgba(c.color, c.op * 0.4));
    g.addColorStop(1, rgba(c.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  p: AnimationParams
) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#000510');
  bg.addColorStop(1, '#000818');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const bands = [p.primaryColor, p.secondaryColor, p.accentColor];
  for (let b = 0; b < 3; b++) {
    const off = (b / 3) * Math.PI * 2;
    const color = bands[b];
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 18) {
      const nx = x / W;
      const y =
        H * 0.18 +
        Math.sin(nx * 3 + t + off) * H * 0.14 +
        Math.sin(nx * 7 + t * 1.4 + off) * H * 0.05;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, H * 0.05, 0, H * 0.85);
    gr.addColorStop(0, rgba(color, 0));
    gr.addColorStop(0.3, rgba(color, 0.35));
    gr.addColorStop(0.7, rgba(color, 0.15));
    gr.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = gr;
    ctx.fill();
  }
}

async function generateVideoBlob(params: AnimationParams): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas 2D not supported'));

    const state = initAnimState(params, 1280, 720);

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    recorder.onerror = () => reject(new Error('Recording failed'));

    recorder.start();

    const start = performance.now();
    const DURATION = 5000;

    function frame(now: number) {
      const elapsed = (now - start) / 1000;
      drawFrame(ctx!, 1280, 720, elapsed, params, state);
      if (now - start < DURATION) {
        requestAnimationFrame(frame);
      } else {
        recorder.stop();
      }
    }
    requestAnimationFrame(frame);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardRightPanel({
  user,
  presentations,
  media,
  mediaLoading,
  onMediaRefresh,
  onClearLyricsSuccess,
}: DashboardRightPanelProps) {
  const [selectedLiveMedia, setSelectedLiveMedia] = useState<string | null>(null);
  const [settingMedia, setSettingMedia] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! Describe a motion background for your presentation and I\'ll generate a 5-second video for you. Try: "soft blue flowing light" or "golden particles for worship".',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  const [liveUrl, setLiveUrl] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLiveUrl(`${window.location.origin}/live`);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Live media ─────────────────────────────────────────────────────────────

  async function setLiveMedia(mediaId: string) {
    setSettingMedia(true);
    try {
      const res = await fetch('/api/live-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedLiveMedia(mediaId);
      toast.success('Media set for live display');
    } catch (e: any) {
      toast.error(e.message || 'Failed to set live media');
    } finally {
      setSettingMedia(false);
    }
  }

  async function clearImage() {
    setSettingMedia(true);
    try {
      const res = await fetch('/api/live-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: null }),
      });
      if (!res.ok) throw new Error('Failed to clear image');
      setSelectedLiveMedia(null);
      toast.success('Image cleared');
    } catch (e: any) {
      toast.error(e.message || 'Failed to clear image');
    } finally {
      setSettingMedia(false);
    }
  }

  async function clearLyrics() {
    try {
      const [sessionRes] = await Promise.all([
        fetch('/api/live-session', { method: 'PATCH' }),
        fetch('/api/bible-live', { method: 'DELETE' }),
      ]);
      if (!sessionRes.ok) throw new Error('Failed to clear live display');
      toast.success('Live display cleared');
      onClearLyricsSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'Failed to clear live display');
    }
  }

  // ─── Chat ────────────────────────────────────────────────────────────────────

  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const history = chatMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.message || 'Ready to generate!',
        params: data.params,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${e.message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  // ─── Video generation ────────────────────────────────────────────────────────

  const generateAndSave = useCallback(
    async (params: AnimationParams) => {
      if (!user?.id) {
        toast.error('You must be logged in');
        return;
      }
      setGeneratingVideo(true);
      setGenProgress(0);

      const progressInterval = setInterval(() => {
        setGenProgress((p) => Math.min(p + 2, 90));
      }, 100);

      try {
        const blob = await generateVideoBlob(params);
        clearInterval(progressInterval);
        setGenProgress(95);

        const ext = 'webm';
        const filename = `ai-bg-${Date.now()}.${ext}`;
        const path = `${user.id}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, blob, { contentType: 'video/webm' });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);

        const res = await fetch('/api/save-ai-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            name: `AI: ${params.description}`,
            url: urlData.publicUrl,
            fileSize: blob.size,
          }),
        });
        const saved = await res.json();
        if (!res.ok) throw new Error(saved.error);

        setGenProgress(100);
        toast.success('Motion background saved to media library!');
        onMediaRefresh?.();
      } catch (e: any) {
        clearInterval(progressInterval);
        toast.error(e.message || 'Failed to generate video');
      } finally {
        setGeneratingVideo(false);
        setGenProgress(0);
      }
    },
    [user, onMediaRefresh]
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      {/* Fixed header */}
      <div className="p-4 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Quick links ── */}
        <div className="px-4 pt-4 pb-4 border-b border-border space-y-2">
          <Link href="/media" className="block">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Upload className="w-4 h-4" />
              Upload Media
            </Button>
          </Link>
          <Link href="/settings" className="block">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Settings className="w-4 h-4" />
              Pengaturan
            </Button>
          </Link>
        </div>

        {/* ── Live controls ── */}
        <div className="px-4 py-4 border-b border-border">
          <p className="text-xs font-semibold text-foreground mb-3">Live Controls</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 text-xs"
              onClick={clearImage}
              disabled={settingMedia}
            >
              <ImageOff className="w-3.5 h-3.5" />
              Clear Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 text-xs"
              onClick={clearLyrics}
            >
              <MicOff className="w-3.5 h-3.5" />
              Clear Lyrics
            </Button>
          </div>
        </div>

        {/* ── QR code for mobile ── */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">Mobile Lyrics View</p>
          </div>
          {liveUrl ? (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeCanvas value={liveUrl} size={140} level="M" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan on your phone to view live lyrics
              </p>
              <p className="text-[10px] text-muted-foreground/60 text-center break-all">
                {liveUrl}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Loading QR code...</p>
          )}
        </div>

        {/* ── AI Background Chatbot ── */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">AI Motion Background</p>
          </div>

          {/* Chat messages */}
          <div className="space-y-2 max-h-52 overflow-y-auto mb-3 pr-1">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-3 py-2 text-xs max-w-[90%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.params && (
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <p className="text-[10px] text-muted-foreground mb-1">
                        Type: <span className="font-medium">{msg.params.animationType}</span>
                      </p>
                      <div className="flex gap-1 mb-2">
                        {[msg.params.primaryColor, msg.params.secondaryColor, msg.params.accentColor].map(
                          (c, ci) => (
                            <div
                              key={ci}
                              className="w-4 h-4 rounded-full border border-border/50"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          )
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full h-7 text-xs gap-1"
                        disabled={generatingVideo}
                        onClick={() => generateAndSave(msg.params!)}
                      >
                        {generatingVideo ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {genProgress}%
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3" />
                            Generate & Save (5s)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
              placeholder="Describe a background..."
              className="text-xs h-8"
              disabled={chatLoading || generatingVideo}
            />
            <Button
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={sendChat}
              disabled={chatLoading || generatingVideo || !chatInput.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ── Media gallery (Select for Live) ── */}
        <div className="px-4 py-4 border-b border-border flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">Select for Live</p>
            <div className="flex items-center gap-1">
              {onMediaRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={onMediaRefresh}
                  title="Refresh media"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
              {selectedLiveMedia && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={clearImage}
                  disabled={settingMedia}
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Grid layout picker */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[10px] text-muted-foreground mr-1">Grid:</span>
            {([2, 3, 4] as const).map((cols) => (
              <button
                key={cols}
                onClick={() => setGridCols(cols)}
                className={`h-5 w-7 rounded text-[10px] font-medium border transition-colors ${
                  gridCols === cols
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {cols}
              </button>
            ))}
          </div>

          {/* Scrollable grid */}
          <div className="overflow-y-auto max-h-64 pr-0.5">
            {mediaLoading ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : media.length === 0 ? (
              <p className="text-xs text-muted-foreground">No media files</p>
            ) : (
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
              >
                {media.map((item) => (
                  <Card
                    key={item.id}
                    className={`bg-muted border-2 overflow-hidden cursor-pointer transition-all ${
                      selectedLiveMedia === item.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setLiveMedia(item.id)}
                  >
                    <div className="aspect-video bg-muted-foreground/10 relative overflow-hidden">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                          <span className="text-lg">📁</span>
                        </div>
                      )}
                      {selectedLiveMedia === item.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Check className="w-5 h-5 text-primary drop-shadow" />
                        </div>
                      )}
                    </div>
                    {gridCols <= 3 && (
                      <div className="px-1.5 py-1">
                        <p className="text-[10px] font-medium text-foreground truncate">
                          {item.name || (item as any).title || 'Untitled'}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Statistics ── */}
        <div className="px-4 py-4 border-b border-border space-y-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Total Presentasi</p>
            <p className="text-2xl font-bold text-foreground">{presentations.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Media Files</p>
            <p className="text-2xl font-bold text-foreground">{media.length}</p>
          </div>
        </div>

        {/* ── Theme palette ── */}
        <div className="px-4 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground mb-3">Tema</p>
          <div className="grid grid-cols-5 gap-2">
            <button className="w-full aspect-square rounded-lg bg-linear-to-br from-blue-500 to-blue-600 hover:ring-2 ring-primary transition-all" title="Blue" />
            <button className="w-full aspect-square rounded-lg bg-linear-to-br from-purple-500 to-purple-600 hover:ring-2 ring-primary transition-all" title="Purple" />
            <button className="w-full aspect-square rounded-lg bg-linear-to-br from-green-500 to-green-600 hover:ring-2 ring-primary transition-all" title="Green" />
            <button className="w-full aspect-square rounded-lg bg-linear-to-br from-orange-500 to-orange-600 hover:ring-2 ring-primary transition-all" title="Orange" />
            <button className="w-full aspect-square rounded-lg bg-linear-to-br from-red-500 to-red-600 hover:ring-2 ring-primary transition-all" title="Red" />
          </div>
        </div>

        {/* ── Pro tip ── */}
        <div className="px-4 py-4">
          <Card className="bg-muted/50 border-border p-3">
            <p className="text-xs font-medium text-foreground mb-2">Pro Tip</p>
            <p className="text-xs text-muted-foreground">
              Use the QR code above to show live lyrics on any phone. Scan and keep it open on stage.
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
}
