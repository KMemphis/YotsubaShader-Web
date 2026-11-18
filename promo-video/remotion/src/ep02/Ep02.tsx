import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Audio } from '@remotion/media';
import { Backdrop } from '../ep01/kit';
import { Captions } from '../ep01/Captions';
import { Lang, setLang } from '../ep01/data';
import { S01 } from './scenes/S01';
import { S02 } from './scenes/S02';
import { S03 } from './scenes/S03';
import { S04 } from './scenes/S04';
import { S05 } from './scenes/S05';
import { S05b } from './scenes/S05b';
import { S06 } from './scenes/S06';
import { S07 } from './scenes/S07';
import { S08 } from './scenes/S08';
import { S09 } from './scenes/S09';
import { S10 } from './scenes/S10';
import { S11 } from './scenes/S11';
import { S12 } from './scenes/S12';
import { S13 } from './scenes/S13';
import { S14 } from './scenes/S14';

/** Episode 2 · How a shader is built. Every visual is keyed to the narration (cue()). */
export const Ep02: React.FC<{ captions?: boolean; lang?: Lang }> = ({ captions = true, lang = 'en' }) => {
  setLang(lang, 'ep02'); // before the scenes render: they read the timing of this episode and language
  return (
    <Backdrop>
      <Audio src={staticFile(lang === 'en' ? 'ep02/voice.wav' : `ep02/voice.${lang}.wav`)} />
      <AbsoluteFill>
        <S01 /><S02 /><S03 /><S04 /><S05 /><S05b /><S06 /><S07 /><S08 /><S09 /><S10 /><S11 /><S12 /><S13 /><S14 />
      </AbsoluteFill>
      {captions ? <Captions /> : null}
    </Backdrop>
  );
};
