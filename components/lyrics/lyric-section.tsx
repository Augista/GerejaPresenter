'use client';

import { Lyric } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LyricSectionProps {
  lyric: Lyric;
  index: number;
  sectionTypes: Lyric['section_type'][];
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<Lyric>) => void;
  onDelete: () => void;
}

export function LyricSection({
  lyric,
  index,
  sectionTypes,
  isEditing,
  onEdit,
  onUpdate,
  onDelete
}: LyricSectionProps) {
  const [expanded, setExpanded] = useState(isEditing);

  return (
    <Card className={`overflow-hidden transition-all ${isEditing ? 'ring-2 ring-primary' : ''}`}>
      <div
        className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
        onClick={() => {
          setExpanded(!expanded);
          onEdit();
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground capitalize">
              {lyric.section_type} {index + 1}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {lyric.content || 'Empty section'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </Button>
      </div>

      {expanded && (
        <div className="p-4 border-t border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Type</label>
            <select
              value={lyric.section_type}
              onChange={(e) => onUpdate({ section_type: e.target.value as Lyric['section_type'] })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sectionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Lyrics</label>
            <textarea
              value={lyric.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Enter lyrics..."
              className="w-full min-h-32 p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {lyric.content.split(' ').length} words
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
            <input
              type="text"
              defaultValue={(lyric.tags || []).join(', ')}
              onBlur={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(t => t.trim())
                  .filter(t => t);
                onUpdate({ tags });
              }}
              placeholder="e.g., key: D, emotion: joyful"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
