import React from 'react';
import { AnimatedBlock } from './AnimatedBlock';

interface BadgeProps {
  svgId: string;
  gId: string;
  pathId: string;
  viewBox: string;
  d: string;
  fillColor: string;
  opacity?: number;
}

export function Badge({ svgId, gId, pathId, viewBox, d, fillColor, opacity = 1.0 }: BadgeProps) {
  return (
    <svg id={svgId} viewBox={viewBox} preserveAspectRatio="none" style={{ width: "100%", height: "100%", opacity, overflow: "hidden", position: "absolute", top: "0%", left: "0%", background: "url(https://kromaticdesignstudio.my.canva.site/couples-therapist/&)" }}>
      <g id={gId} style={{ transform: "scale(1, 1)" }}>
        <path id={pathId} d={d} style={{ fill: fillColor, opacity: 1.0 }}></path>
      </g>
    </svg>
  );
}
