import React from 'react';
import { Composition } from 'remotion';
import { CONTENT_FRAMES, INTRO_FRAMES, OVERLAP, Promo } from './Promo';
import { PreviewV3 } from './PreviewV3';
import { MotionPromo } from './motion/MotionPromo';

export const FPS = 60;

// A  = the animated video on its own (to be placed after the recorded intro, voice-over still to record)
// B  = the recorded intro + the animated video in one piece
export const Root: React.FC = () => (
  <>
    <Composition id="MotionES-1080" component={MotionPromo} durationInFrames={2250} fps={30} width={1920} height={1080} />
    <Composition id="MotionES-4K" component={MotionPromo} durationInFrames={4500} fps={60} width={3840} height={2160} />
    <Composition id="PreviewV3-es" component={PreviewV3} durationInFrames={4500} fps={60} width={1920} height={1080} />
    {(['es', 'en'] as const).map((lang) => (
      <React.Fragment key={lang}>
        <Composition id={`PromoA-${lang}`} component={Promo} durationInFrames={CONTENT_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ lang, intro: false }} />
        <Composition id={`PromoB-${lang}`} component={Promo} durationInFrames={INTRO_FRAMES - OVERLAP + CONTENT_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ lang, intro: true }} />
      </React.Fragment>
    ))}
  </>
);
