import React from 'react';
import { Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { NetworkButton } from './NetworkButton';

interface NetworkControlsProps {
  onAddNode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}

export function NetworkControls({ onAddNode, onZoomIn, onZoomOut, onFitView }: NetworkControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <NetworkButton onClick={onAddNode} icon={Plus} label="Add Node" />
      <NetworkButton onClick={onZoomIn} icon={ZoomIn} label="Zoom In" />
      <NetworkButton onClick={onZoomOut} icon={ZoomOut} label="Zoom Out" />
      <NetworkButton onClick={onFitView} icon={Maximize} label="Fit View" />
    </div>
  );
}