'use client';

import { SlideLayer } from '@/types/database';
import { useState, useRef } from 'react';

interface LayerRendererProps {
  layer: SlideLayer;
  selected: boolean;
  onSelect: () => void;
}

export function LayerRenderer({ layer, selected, onSelect }: LayerRendererProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const transform = layer.transform || { x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, skewY: 0 };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    
    onSelect();
    setIsDragging(true);
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const parentRect = elementRef.current.parentElement?.getBoundingClientRect();
      
      if (parentRect) {
        setDragOffset({
          x: e.clientX - parentRect.left - (rect.left - parentRect.left),
          y: e.clientY - parentRect.top - (rect.top - parentRect.top)
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !elementRef.current) return;
    
    const parentRect = elementRef.current.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    const newX = e.clientX - parentRect.left - dragOffset.x;
    const newY = e.clientY - parentRect.top - dragOffset.y;

    elementRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderContent = () => {
    switch (layer.content.type) {
      case 'text':
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <p className="text-4xl font-bold text-center text-foreground">
              {layer.content.data.text || 'Double click to edit text'}
            </p>
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Image layer</span>
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <span className="text-muted-foreground">Video layer</span>
          </div>
        );

      case 'lyrics':
        return (
          <div className="w-full h-full bg-primary/5 flex items-center justify-center p-4">
            <p className="text-2xl text-center text-foreground">
              {layer.content.data.text || 'Lyrics...'}
            </p>
          </div>
        );

      case 'bible':
        return (
          <div className="w-full h-full bg-accent/5 flex items-center justify-center p-4">
            <p className="text-lg text-center text-foreground">
              {layer.content.data.verse || 'Scripture passage...'}
            </p>
          </div>
        );

      case 'graphic':
      case 'shape':
      default:
        return (
          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground">{layer.type} layer</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={elementRef}
      onClick={onSelect}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`absolute inset-0 cursor-move transition-shadow ${
        selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
      }`}
      style={{
        opacity: layer.opacity,
        mixBlendMode: layer.blend_mode as any,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg) skew(${transform.skewX}deg, ${transform.skewY}deg)`,
        zIndex: layer.order,
        visibility: layer.visible ? 'visible' : 'hidden'
      }}
    >
      <div className="w-full h-full">
        {renderContent()}
      </div>
    </div>
  );
}
