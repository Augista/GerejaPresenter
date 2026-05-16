// =====================================================
// PRESENTATIONS
// =====================================================

export interface Presentation {
  id: string;

  user_id: string;

  title: string;

  description: string;

  thumbnail_url?: string;

  is_active?: boolean;

  slides?: Slide[];

  created_at: string;

  updated_at: string;
}

// =====================================================
// SLIDES
// =====================================================

export interface Slide {
  id: string;

  presentation_id: string;

  order_index: number;

  duration?: number;

  transition_type?: string;

  transition_duration?: number;

  layers?: SlideLayer[];

  created_at: string;

  updated_at: string;
}

// =====================================================
// SLIDE LAYERS
// =====================================================

export interface SlideLayer {
  id: string;

  slide_id: string;

  type:
    | 'background'
    | 'content'
    | 'overlay'
    | 'mask';

  order_index: number;

  is_visible: boolean;

  opacity: number;

  blend_mode: string;

  content: LayerContent;

  created_at: string;

  updated_at: string;
}

export interface LayerContent {
  type:
    | 'text'
    | 'image'
    | 'video'
    | 'shape'
    | 'bible'
    | 'lyrics'
    | 'graphic';

  data: Record<string, any>;
}

// =====================================================
// TRANSFORM
// =====================================================

export interface TransformData {
  x: number;

  y: number;

  scale: number;

  rotation: number;

  skewX: number;

  skewY: number;
}

// =====================================================
// TRANSITIONS
// =====================================================

export interface TransitionSettings {
  type:
    | 'fade'
    | 'slide'
    | 'wipe'
    | 'dissolve'
    | 'none';

  duration: number;

  direction?:
    | 'up'
    | 'down'
    | 'left'
    | 'right';

  easing?: string;
}

// =====================================================
// MEDIA
// =====================================================

export interface Media {
  id: string;

  user_id: string;

  name: string;

  type:
    | 'image'
    | 'video'
    | 'audio';

  url: string;

  file_size?: number;

  duration?: number;

  thumbnail_url?: string;

  tags?: string[];

  created_at: string;

  updated_at: string;
}

// =====================================================
// MEDIA BINS
// =====================================================

export interface MediaBin {
  id: string;

  user_id: string;

  name: string;

  created_at: string;

  updated_at: string;
}

export interface MediaBinItem {
  id: string;

  bin_id: string;

  media_id: string;

  added_at: string;
}

// =====================================================
// MEDIA SETTINGS
// =====================================================

export interface MediaSettings {
  loop: boolean;

  trim_start?: number;

  trim_end?: number;

  cue_points?: CuePoint[];

  auto_play: boolean;
}

export interface CuePoint {
  time: number;

  label: string;
}

// =====================================================
// SONGS
// =====================================================

export interface Song {
  id: string;

  user_id: string;

  title: string;

  artist?: string;

  key?: string;

  bpm?: number;

  lyrics?: string;

  tags?: string[];

  lyric_sections?: LyricSection[];

  created_at: string;

  updated_at: string;
}

// =====================================================
// LYRIC SECTIONS
// =====================================================

export interface LyricSection {
  id: string;

  song_id: string;

  type:
    | 'verse'
    | 'chorus'
    | 'bridge'
    | 'intro'
    | 'outro';

  content: string;

  order_index: number;

  created_at: string;
}

// =====================================================
// SONG METADATA
// =====================================================

export interface SongMetadata {
  bpm?: number;

  key?: string;

  duration?: number;

  theme?: string[];
}

// =====================================================
// LYRIC ANIMATIONS
// =====================================================

export interface LyricAnimation {
  id: string;

  lyric_section_id: string;

  animation_type:
    | 'fade'
    | 'slide'
    | 'scale';

  word_animation: boolean;

  duration: number;

  delay: number;

  stagger: number;

  created_at: string;
}

// =====================================================
// PLAYLIST
// =====================================================

export interface Playlist {
  id: string;

  presentation_id: string;

  title: string;

  order: number;

  songs: string[];

  created_at: string;
}

// =====================================================
// BIBLE
// =====================================================

export interface BibleVerse {
  id: string;

  book: string;

  chapter: number;

  verse: number;

  translation: string;

  text: string;

  cached_at: string;
}

// =====================================================
// THEMES
// =====================================================

export interface Theme {
  id: string;

  user_id: string;

  name: string;

  colors: {
    primary: string;

    secondary: string;

    accent: string;

    background: string;

    text: string;
  };

  fonts: {
    heading: string;

    body: string;
  };

  templates: SlideTemplate[];

  created_at: string;

  updated_at: string;
}

// =====================================================
// SLIDE TEMPLATE
// =====================================================

export interface SlideTemplate {
  id: string;

  theme_id: string;

  name: string;

  layout: TemplateLayout;

  layers: Omit<
    SlideLayer,
    | 'id'
    | 'slide_id'
    | 'created_at'
    | 'updated_at'
  >[];
}

// =====================================================
// TEMPLATE LAYOUT
// =====================================================

export interface TemplateLayout {
  width: number;

  height: number;

  grid?: GridLayout;
}

export interface GridLayout {
  columns: number;

  rows: number;

  gaps: number;
}

// =====================================================
// GRAPHICS
// =====================================================

export interface Graphic {
  id: string;

  user_id: string;

  type:
    | 'lower_third'
    | 'title'
    | 'custom';

  template: GraphicTemplate;

  created_at: string;

  updated_at: string;
}

export interface GraphicTemplate {
  name: string;

  layers: SlideLayer[];

  variables: GraphicVariable[];
}

export interface GraphicVariable {
  key: string;

  label: string;

  type:
    | 'text'
    | 'image'
    | 'color';

  default?: string;
}

// =====================================================
// STAGE DISPLAY
// =====================================================

export interface StageDisplayConfig {
  id: string;

  presentation_id: string;

  show_current_slide: boolean;

  show_next_slide: boolean;

  show_timer: boolean;

  show_notes: boolean;

  show_clock: boolean;

  countdown_duration?: number;

  created_at: string;

  updated_at: string;
}

// =====================================================
// BEAT DETECTION
// =====================================================

export interface BeatDetection {
  id: string;

  slide_id: string;

  audio_path: string;

  bpm: number;

  beats: number[];

  confidence: number;

  analyzed_at: string;
}

// =====================================================
// YOUTUBE CAPTIONS
// =====================================================

export interface YouTubeCaption {
  id: string;

  user_id: string;

  youtube_stream_id: string;

  content: string;

  timestamp: number;

  language:
    | 'id'
    | 'en';

  generated_at: string;
}

export interface CaptionSession {
  id: string;

  user_id: string;

  youtube_url: string;

  language:
    | 'id'
    | 'en';

  status:
    | 'active'
    | 'paused'
    | 'completed';

  captions: YouTubeCaption[];

  started_at: string;

  ended_at?: string;
}

// =====================================================
// TRANSLATION
// =====================================================

export interface TranslationSettings {
  user_id: string;

  primary_language:
    | 'id'
    | 'en';

  secondary_language?:
    | 'id'
    | 'en';

  auto_translate: boolean;

  updated_at: string;
}

// =====================================================
// DISPLAY OUTPUT
// =====================================================

export interface DisplayOutput {
  id: string;

  presentation_id: string;

  name: string;

  type:
    | 'stage'
    | 'audience'
    | 'presenter'
    | 'confidence_monitor';

  resolution: Resolution;

  scaling: number;

  created_at: string;

  updated_at: string;
}

export interface Resolution {
  width: number;

  height: number;

  refresh_rate?: number;
}

// =====================================================
// WINDOW STATE
// =====================================================

export interface WindowState {
  id: string;

  display_output_id: string;

  x: number;

  y: number;

  width: number;

  height: number;

  is_fullscreen: boolean;

  updated_at: string;
}