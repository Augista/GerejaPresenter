import WaveSurfer from 'wavesurfer.js';

export interface BeatAnalysis {
  bpm: number;
  beats: number[];
  confidence: number;
}

/**
 * Analyze audio file for beat detection
 * Uses energy-based beat detection algorithm
 */
export async function analyzeAudioBeats(
  audioUrl: string,
  onProgress?: (progress: number) => void
): Promise<BeatAnalysis> {
  return new Promise((resolve, reject) => {
    const wavesurfer = WaveSurfer.create({
      container: document.createElement('div'),
      waveColor: 'transparent',
      progressColor: 'transparent',
    });

    wavesurfer.on('ready', () => {
      try {
        const audioContext = wavesurfer.getMediaElement().parentElement?.ownerDocument.defaultView?.AudioContext ||
                           (wavesurfer as any).backend.ac;

        if (!audioContext) {
          throw new Error('AudioContext not available');
        }

        // Get the audio buffer
        const buffer = (wavesurfer as any).backend.buffer;
        
        if (!buffer) {
          throw new Error('Could not get audio buffer');
        }

        const analysis = performBeatDetection(buffer, audioContext.sampleRate);
        
        wavesurfer.destroy();
        resolve(analysis);
      } catch (error) {
        wavesurfer.destroy();
        reject(error);
      }
    });

    wavesurfer.on('error', (error) => {
      wavesurfer.destroy();
      reject(error);
    });

    wavesurfer.load(audioUrl);
  });
}

/**
 * Perform beat detection on audio buffer
 * Uses energy-based algorithm with onset detection
 */
function performBeatDetection(buffer: AudioBuffer, sampleRate: number): BeatAnalysis {
  const data = buffer.getChannelData(0);
  
  // Parameters for beat detection
  const hopSize = 512;
  const windowSize = 2048;
  const minBPM = 80;
  const maxBPM = 200;
  
  // Calculate energy frames
  const frames: number[] = [];
  for (let i = 0; i < data.length; i += hopSize) {
    const frameEnd = Math.min(i + windowSize, data.length);
    let energy = 0;
    
    for (let j = i; j < frameEnd; j++) {
      energy += data[j] * data[j];
    }
    
    frames.push(energy / (frameEnd - i));
  }
  
  // Normalize energy
  const maxEnergy = Math.max(...frames);
  const normalizedFrames = frames.map(e => e / maxEnergy);
  
  // Detect onsets using energy flux
  const onsets: number[] = [];
  const threshold = 0.3;
  
  for (let i = 1; i < normalizedFrames.length; i++) {
    const diff = normalizedFrames[i] - normalizedFrames[i - 1];
    if (diff > threshold) {
      onsets.push(i * hopSize / sampleRate); // Convert to time in seconds
    }
  }
  
  // Estimate BPM from onset intervals
  const { bpm, confidence } = estimateBPM(onsets, minBPM, maxBPM);
  
  // Find beats at detected BPM
  const beats = findBeatsAtTempo(onsets, bpm, sampleRate);
  
  return {
    bpm: Math.round(bpm),
    beats: beats.map(b => Math.round(b * 1000)), // Convert to milliseconds
    confidence
  };
}

/**
 * Estimate BPM from inter-onset intervals
 */
function estimateBPM(
  onsets: number[],
  minBPM: number,
  maxBPM: number
): { bpm: number; confidence: number } {
  if (onsets.length < 2) {
    return { bpm: 120, confidence: 0 };
  }
  
  // Calculate inter-onset intervals
  const intervals: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    intervals.push(onsets[i] - onsets[i - 1]);
  }
  
  // Test BPM candidates
  let bestBPM = 120;
  let bestScore = 0;
  
  for (let bpm = minBPM; bpm <= maxBPM; bpm += 1) {
    const beatInterval = 60 / bpm; // seconds
    let score = 0;
    
    // Count onsets that align with beats
    for (const interval of intervals) {
      // Check if interval is close to a multiple of beat interval
      const ratio = interval / beatInterval;
      const closestInteger = Math.round(ratio);
      
      if (closestInteger > 0) {
        const error = Math.abs(ratio - closestInteger) / closestInteger;
        if (error < 0.2) {
          score += 1 - error;
        }
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestBPM = bpm;
    }
  }
  
  const confidence = Math.min(bestScore / intervals.length, 1);
  
  return { bpm: bestBPM, confidence };
}

/**
 * Find beats at detected tempo
 */
function findBeatsAtTempo(
  onsets: number[],
  bpm: number,
  sampleRate: number
): number[] {
  const beatInterval = 60 / bpm; // seconds
  const beats: number[] = [];
  
  if (onsets.length === 0) {
    return beats;
  }
  
  // Start from first onset
  let currentBeat = onsets[0];
  const maxTime = onsets[onsets.length - 1] + beatInterval * 2;
  
  while (currentBeat < maxTime) {
    // Find closest onset to current beat
    let closest = onsets[0];
    let closestDist = Math.abs(onsets[0] - currentBeat);
    
    for (const onset of onsets) {
      const dist = Math.abs(onset - currentBeat);
      if (dist < closestDist) {
        closest = onset;
        closestDist = dist;
      }
    }
    
    // Use onset if close enough, otherwise use predicted beat
    if (closestDist < beatInterval * 0.2) {
      beats.push(closest);
      currentBeat = closest + beatInterval;
    } else {
      currentBeat += beatInterval;
    }
  }
  
  return beats;
}

/**
 * Detect if audio contains strong beats (for UI feedback)
 */
export function hasStrongBeats(analysis: BeatAnalysis): boolean {
  return analysis.confidence > 0.5 && analysis.beats.length > 4;
}
