import React from 'react';
import { Composition } from 'remotion';
import { CONTENT_FRAMES, INTRO_FRAMES, OVERLAP, Promo } from './Promo';
import { PreviewV3 } from './PreviewV3';
import { MotionPromo } from './motion/MotionPromo';
import { Ep01 } from './ep01/Ep01';
import { framesFor } from './ep01/data';
import { Home, homeFrames } from './Home';
import { Ep02 } from './ep02/Ep02';
import { ChapterCompositions } from './chapters/ChapterRoot';

export const FPS = 60;

// A  = the animated video on its own (to be placed after the recorded intro, voice-over still to record)
// B  = the recorded intro + the animated video in one piece
export const Root: React.FC = () => (
  <>
    <ChapterCompositions />
    <Composition id="Home-en" component={Home} durationInFrames={homeFrames('en')} fps={60} width={1920} height={1080} defaultProps={{ lang: 'en' as const }} />
    <Composition id="Home-es" component={Home} durationInFrames={homeFrames('es')} fps={60} width={1920} height={1080} defaultProps={{ lang: 'es' as const }} />
    <Composition id="MotionES-1080" component={MotionPromo} durationInFrames={2250} fps={30} width={1920} height={1080} />
    <Composition id="MotionES-4K" component={MotionPromo} durationInFrames={4500} fps={60} width={3840} height={2160} />
    <Composition id="Ep01-en" component={Ep01} durationInFrames={framesFor('en')} fps={60} width={1920} height={1080} defaultProps={{ lang: 'en' }} />
    <Composition id="Ep01-es" component={Ep01} durationInFrames={framesFor('es')} fps={60} width={1920} height={1080} defaultProps={{ lang: 'es' }} />
    <Composition id="Ep02-en" component={Ep02} durationInFrames={framesFor('en', 'ep02')} fps={60} width={1920} height={1080} defaultProps={{ lang: 'en' }} />
    <Composition id="Ep02-es" component={Ep02} durationInFrames={framesFor('es', 'ep02')} fps={60} width={1920} height={1080} defaultProps={{ lang: 'es' }} />
    <Composition id="PreviewV3-es" component={PreviewV3} durationInFrames={4500} fps={60} width={1920} height={1080} />
    {(['es', 'en'] as const).map((lang) => (
      <React.Fragment key={lang}>
        <Composition id={`PromoA-${lang}`} component={Promo} durationInFrames={CONTENT_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ lang, intro: false }} />
        <Composition id={`PromoB-${lang}`} component={Promo} durationInFrames={INTRO_FRAMES - OVERLAP + CONTENT_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ lang, intro: true }} />
      </React.Fragment>
    ))}
  </>
);
