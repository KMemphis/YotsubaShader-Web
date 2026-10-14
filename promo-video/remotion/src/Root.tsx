import React from 'react';
import { Composition } from 'remotion';
import { CONTENT_FRAMES, INTRO_FRAMES, OVERLAP, Promo } from './Promo';

export const FPS = 60;

// A  = the animated video on its own (to be placed after the recorded intro, voice-over still to record)
// B  = the recorded intro + the animated video in one piece
export const Root: React.FC = () => (
  <>
    {(['es', 'en'] as const).map((lang) => (
      <React.Fragment key={lang}>
        <Composition id={`PromoA-${lang}`} component={Promo} durationInFrames={CONTENT_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ lang, intro: false }} />
        <Composition id={`PromoB-${lang}`} component={Promo} durationInFrames={INTRO_FRAMES - OVERLAP + CONTENT_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ lang, intro: true }} />
      </React.Fragment>
    ))}
  </>
);
