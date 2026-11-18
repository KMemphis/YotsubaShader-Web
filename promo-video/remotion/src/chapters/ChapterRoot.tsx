import React from 'react';
import { Composition } from 'remotion';
import { Chapter, FPS, TAIL, LEAD, ChapterData } from './core';
import { scenes } from './whatIsAShader';
import dataEn from './data/en.what-is-a-shader.json';
import dataEs from './data/es.what-is-a-shader.json';
import { scenes as promoScenes } from './promoQueEs';
import dataPromo from './data/es.promo-que-es.json';

const mk = (id: string, d: ChapterData, audio: string) => (
  <Composition id={id} component={() => <Chapter data={d} scenes={scenes} audio={audio} />} durationInFrames={Math.ceil((d.duration + TAIL + LEAD) * FPS)} fps={FPS} width={1920} height={1080} />
);
export const ChapterCompositions: React.FC = () => (
  <>
    {mk('Chapter-what-is-a-shader-en', dataEn as unknown as ChapterData, 'chapters/en.what-is-a-shader.mp3')}
    <Composition id="Promo-que-es-es" component={() => <Chapter data={dataPromo as unknown as ChapterData} scenes={promoScenes} audio="chapters/es.promo-que-es.mp3" />} durationInFrames={Math.ceil(((dataPromo as any).duration + TAIL + LEAD) * FPS)} fps={FPS} width={1920} height={1080} />
    {mk('Chapter-what-is-a-shader-es', dataEs as unknown as ChapterData, 'chapters/es.what-is-a-shader.mp3')}
  </>
);
