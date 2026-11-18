import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { Backdrop } from './kit';
import { Lang, setLang } from './data';
import { Captions } from './Captions';
import { S01 } from './scenes/S01';
import { S02 } from './scenes/S02';
import { S03 } from './scenes/S03';
import { S04 } from './scenes/S04';
import { S05 } from './scenes/S05';
import { S06 } from './scenes/S06';
import { S07 } from './scenes/S07';
import { S08 } from './scenes/S08';
import { S09 } from './scenes/S09';
import { S10 } from './scenes/S10';

/** Episode 1 · What is a shader? Every visual is keyed to the narration timing (data.ts / cue()). */
export const Ep01: React.FC<{ captions?: boolean; lang?: Lang }> = ({ captions = true, lang = 'en' }) => {
  setLang(lang); // before the scenes render: they read the timing of this language
  return (
  <Backdrop>
    <Audio src={staticFile(lang === 'en' ? 'ep01/voice.wav' : `ep01/voice.${lang}.wav`)} />
    <AbsoluteFill>
      <S01 /><S02 /><S03 /><S04 /><S05 /><S06 /><S07 /><S08 /><S09 /><S10 />
    </AbsoluteFill>
    {captions ? <Captions /> : null}
  </Backdrop>
  );
};
