import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {scenes} from './constants';
import {MotionScene} from './MotionScene';
export const MotionPromo: React.FC = () => { const {fps,width}=useVideoConfig(); return <AbsoluteFill style={{background:'#070c12'}}><div style={{width:1920,height:1080,scale:width/1920,transformOrigin:'top left',position:'absolute'}}>{scenes.map((s,i)=><Sequence key={i} from={s.start*fps} durationInFrames={(s.end-s.start)*fps}><MotionScene index={i} duration={s.end-s.start}/><Audio src={staticFile(`v3-voice-${i}.wav`)}/></Sequence>)}</div><Audio src={staticFile('music.wav')} volume={0.035}/></AbsoluteFill>};
