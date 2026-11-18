import React from 'react';
import { Img, staticFile } from 'remotion';
import { Big, ChapterData, Code, Ctx, FONT, Fade, Item, Kicker, MONO, P, SceneDef, lin, mix, ramp, useT } from './core';

/**
 * Builds the scenes of a chapter from its blocks, so every chapter gets a video without hand-placing anything.
 * The rule is the page itself: a heading opens a section card, a paragraph run gets a typographic scene, and every
 * code block, table and image gets its own scene during the narration that describes it.
 */
const ACCENTS = [P.pink, P.mint, P.violet];
const rel = (c: Ctx, n: number) => c.bs(n) - c.t0;
const Pad: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', left: 150, right: 150, top: 120, bottom: 190, ...style }}>{children}</div>
);

/** Flat shapes, composed like a poster. The seed picks one of several compositions; the accent is the section colour. */
const Art: React.FC<{ seed: number; accent: string }> = ({ seed, accent }) => {
  const others = ACCENTS.filter((c) => c !== accent);
  const a = accent, b = others[seed % 2], d = others[(seed + 1) % 2];
  const box: React.CSSProperties = { position: 'absolute', right: 0, top: 0, width: 760, height: 900, overflow: 'hidden' };
  const v = seed % 4;
  if (v === 0) return (<div style={box}><div style={{ position: 'absolute', left: 120, top: 150, width: 540, height: 540, borderRadius: '50%', background: a }} /><div style={{ position: 'absolute', left: 280, top: 430, width: 380, height: 380, background: b }} /><div style={{ position: 'absolute', left: 30, top: 470, width: 500, height: 250, borderRadius: '250px 250px 0 0', background: d }} /></div>);
  if (v === 1) return (<div style={box}><div style={{ position: 'absolute', left: 60, top: 120, width: 420, height: 700, background: a }} /><div style={{ position: 'absolute', left: 330, top: 220, width: 360, height: 360, borderRadius: '50%', background: b }} /><div style={{ position: 'absolute', left: 330, top: 580, width: 360, height: 240, background: d, borderRadius: '0 0 180px 180px' }} /></div>);
  if (v === 2) return (<div style={box}><div style={{ position: 'absolute', left: 100, top: 100, width: 600, height: 300, borderRadius: '300px 300px 0 0', background: a }} /><div style={{ position: 'absolute', left: 100, top: 400, width: 300, height: 300, background: b }} /><div style={{ position: 'absolute', left: 400, top: 400, width: 300, height: 300, borderRadius: '50%', background: d }} /></div>);
  return (<div style={box}><div style={{ position: 'absolute', left: 180, top: 120, width: 460, height: 460, borderRadius: '50%', background: a }} /><div style={{ position: 'absolute', left: 90, top: 460, width: 300, height: 300, background: d }} /><div style={{ position: 'absolute', left: 390, top: 520, width: 260, height: 260, borderRadius: '130px 0 130px 0', background: b }} /></div>);
};

const Section = (from: number, color: string, label: string, title: string, number?: string): SceneDef => ({
  from, to: from, lead: 0.6, tail: 1.4, field: true,
  render: () => (
    <div style={{ position: 'absolute', inset: 0, background: color }}>
      <Pad style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {label ? <Fade at={0.5}><Kicker color={P.bg} style={{ opacity: 0.7, fontSize: 34 }}>{label}</Kicker></Fade> : null}
        <Fade at={0.7}><Big color={P.bg} size={title.length > 46 ? 88 : title.length > 30 ? 104 : 132} style={{ marginTop: 20, maxWidth: 1450 }}>{title}</Big></Fade>
      </Pad>
      {number ? <div style={{ position: 'absolute', right: 150, bottom: 200, fontSize: 420, fontWeight: 700, letterSpacing: '-0.06em', color: P.bg, opacity: 0.12, lineHeight: 0.8 }}>{number}</div> : null}
    </div>
  ),
});

const firstSentence = (it: Item, max = 120) => {
  const s = (it.sentences?.[0]?.text ?? it.text ?? '').replace(/\s+/g, ' ');
  return s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s;
};

const clip = (code: string, n: number) => code.split('\n').slice(0, n).join('\n');
const fit = (code: string, width: number, height: number) => {
  const lines = code.split('\n');
  const longest = Math.max(...lines.map((l) => l.length), 10);
  const byW = (width - 56) / (0.6 * longest);
  const byH = (height - 90) / (1.55 * lines.length);
  return Math.max(15, Math.min(32, Math.floor(Math.min(byW, byH))));
};

const Tag: React.FC<{ x: number; y: number; children: React.ReactNode; color?: string }> = ({ x, y, children, color = P.dim }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontSize: 24, fontWeight: 700, letterSpacing: '0.04em', color }}>{children}</div>
);

export function buildScenes(data: ChapterData): SceneDef[] {
  const items = data.items;
  const spoken = items.filter((i) => i.block != null && i.start != null);
  const scenes: SceneDef[] = [];
  const used = new Set<number>();
  const next = (k: number) => { for (let q = k + 1; q < items.length; q++) if (items[q].block != null && items[q].start != null) return items[q]; return undefined; };
  const prev = (k: number) => { for (let q = k - 1; q >= 0; q--) if (items[q].block != null && items[q].start != null) return items[q]; return undefined; };

  // title: the first spoken block (the summary line)
  const first = spoken[0];
  if (first) {
    used.add(first.block as number);
    scenes.push({
      from: first.block as number, to: (spoken[1]?.block as number) ?? (first.block as number), lead: 0.8, tail: 0.8,
      render: () => (
        <>
          <Art seed={0} accent={P.pink} />
          <Pad style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', right: 800 }}>
            <Fade at={0.8}><Kicker color={P.pink}>Get started</Kicker></Fade>
            <Fade at={1.0}><Big size={data.title.length > 24 ? 118 : 150} style={{ marginTop: 24 }}>{data.title}</Big></Fade>
          </Pad>
          <div style={{ position: 'absolute', left: 150, top: 70, fontSize: 30, fontWeight: 600, letterSpacing: '-0.01em' }}><span>Yotsuba</span> <span style={{ color: P.dim }}>Shader</span></div>
        </>
      ),
    });
    if (spoken[1]) used.add(spoken[1].block as number);
  }

  let accent = ACCENTS[0], sec = 0, secTitle = '', seed = 1;
  const visualScenes: { k: number; from: number; to: number }[] = [];

  items.forEach((it, k) => {
    if (it.kind === 'h2' || it.kind === 'h3') {
      if (it.block == null) return;
      used.add(it.block);
      if (it.kind === 'h2') { sec++; accent = ACCENTS[sec % ACCENTS.length]; secTitle = it.text ?? ''; }
      const m = /^(\d+)\.\s+(.*)$/.exec(it.text ?? '');
      scenes.push(Section(it.block, it.kind === 'h2' ? accent : mix(accent, P.bg, 0.0), it.kind === 'h2' ? (m ? `Part ${m[1]}` : 'Section') : '', m ? m[2] : it.text ?? '', m ? m[1] : undefined));
      return;
    }
    const visual = it.kind === 'img' || it.kind === 'table' || it.kind === 'code' || it.kind === 'styles' || it.kind === 'tabs';
    if (!visual) return;
    const nx = next(k), pv = prev(k);
    if (!nx) return;
    // the narration of a visual is the SAY block that follows it; otherwise the lead-in sentence before it or the next paragraph
    let from = nx.block as number, to = nx.block as number;
    if (nx.kind !== 'say' && pv && pv.kind === 'p' && /[:：]\s*$/.test(pv.text ?? '') && !used.has(pv.block as number)) from = pv.block as number;
    else if (nx.kind === 'say' && pv && pv.kind === 'p' && /[:：]\s*$/.test(pv.text ?? '') && !used.has(pv.block as number)) from = pv.block as number;
    for (let b = from; b <= to; b++) used.add(b);
    visualScenes.push({ k, from, to });
    const seedHere = seed++;
    const acc = accent;
    scenes.push({
      from, to, light: it.kind === 'img', lead: 0.5, tail: 0.5,
      render: (c) => {
        const t = useT();
        const say = c.sent(to);
        const span = Math.max(1, c.be(to) - c.bs(from));
        const prog = lin(t, rel(c, from), rel(c, to) + (c.be(to) - c.bs(to)));
        if (it.kind === 'img') {
          const src = it.src ?? '';
          return (
            <div style={{ position: 'absolute', inset: 0, background: P.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 190 }}>
              <Img src={staticFile('chapters' + src)} style={{ width: 1620, height: 760, objectFit: 'contain', transform: `scale(${1 + 0.04 * prog})`, opacity: ramp(t, 0.3, 1.1) }} />
            </div>
          );
        }
        if (it.kind === 'table') {
          const rows = it.rows ?? [];
          const head = rows[0] ?? [], body = rows.slice(1);
          const cols = head.length;
          const grid = `repeat(${cols}, 1fr)`;
          const fs = cols > 4 ? 26 : cols > 3 ? 30 : 36;
          const rh = Math.min(150, Math.floor(620 / Math.max(1, body.length)));
          const at = (n: number) => (say[n + 1]?.start ?? c.bs(to) + (n / Math.max(1, body.length)) * span * 0.8) - c.t0 - 0.15;
          return (
            <Pad style={{ top: 130 }}>
              <Fade at={0.4} style={{ display: 'grid', gridTemplateColumns: grid, gap: 28, fontSize: 24, fontWeight: 600, color: P.dim, paddingBottom: 18, borderBottom: `2px solid ${P.line}` }}>{head.map((h, i) => <div key={i}>{h}</div>)}</Fade>
              {body.map((r, i) => (
                <Fade key={i} at={Math.max(0.8, Math.min(at(i), rel(c, to) + span * (0.15 + 0.7 * i / Math.max(1, body.length))))} style={{ display: 'grid', gridTemplateColumns: grid, gap: 28, alignItems: 'center', minHeight: rh, borderBottom: `2px solid ${P.line}` }}>
                  {r.map((cell, j) => <div key={j} style={{ fontSize: fs, fontWeight: j === 0 ? 700 : 500, color: j === 0 ? acc : j === 1 ? P.ink : P.dim, lineHeight: 1.25, fontFamily: /^[\[`]|\(\)|^\w+\(/.test(cell) ? MONO : FONT }}>{cell}</div>)}
                </Fade>
              ))}
            </Pad>
          );
        }
        if (it.kind === 'styles') {
          const gl = it.styles?.find((s) => s.style === 'glsl')?.code ?? it.styles?.[0]?.code ?? '';
          const hl = it.styles?.find((s) => s.style === 'hlsl')?.code ?? gl;
          const lines = Math.max(gl.split('\n').length, hl.split('\n').length);
          const shown = Math.min(lines, 26);
          const fs = fit(clip(gl.split('\n').length >= hl.split('\n').length ? gl : hl, shown), 840, 760);
          const sweep = Math.floor(lin(t, rel(c, to), rel(c, to) + (c.be(to) - c.bs(to))) * shown);
          const hlOn = t > rel(c, to) ? [{ from: Math.min(sweep, shown - 1), to: Math.min(sweep, shown - 1) }] : [];
          return (
            <>
              <Code code={clip(gl, shown)} title="GLSL" x={110} y={110} w={840} fs={fs} chars={ramp(t, 0.4, 2.8) * 4000} hl={hlOn} />
              <Code code={clip(hl, shown)} title="HLSL" x={970} y={110} w={840} fs={fs} chars={ramp(t, 0.6, 3.0) * 4000} hl={hlOn} />
            </>
          );
        }
        if (it.kind === 'tabs') {
          const tabs = it.tabs ?? [];
          const n = Math.max(1, tabs.length);
          const idx = Math.min(n - 1, Math.floor(lin(t, rel(c, to) - 0.2, rel(c, to) + (c.be(to) - c.bs(to))) * n));
          const code = clip(tabs[idx]?.code ?? '', 22);
          const fs = Math.min(28, fit(code, 1620, 700));
          return (
            <>
              <div style={{ position: 'absolute', left: 150, top: 96, display: 'flex', gap: 34 }}>
                {tabs.map((tb, i) => <div key={i} style={{ fontSize: 30, fontWeight: 700, color: i === idx ? acc : P.dim, borderBottom: `4px solid ${i === idx ? acc : 'transparent'}`, paddingBottom: 8 }}>{tb.label}</div>)}
              </div>
              <Code code={code} title={tabs[idx]?.label ?? ''} x={150} y={170} w={1620} fs={fs} />
            </>
          );
        }
        // single code
        const code = it.code ?? '';
        const lines = Math.min(code.split('\n').length, 24);
        const fs = Math.min(36, fit(clip(code, lines), 1500, 720));
        const sweep = Math.floor(lin(t, rel(c, to), rel(c, to) + (c.be(to) - c.bs(to))) * lines);
        return <Code code={clip(code, lines)} title={it.title || 'C#'} x={210} y={130} w={1500} fs={fs} chars={ramp(t, 0.4, 2.4) * 6000} hl={t > rel(c, to) ? [{ from: Math.min(sweep, lines - 1), to: Math.min(sweep, lines - 1) }] : []} />;
        void seedHere;
      },
    });
  });

  // text runs: the spoken blocks nobody else used, grouped by proximity and length
  let run: Item[] = [];
  const flush = () => {
    if (!run.length) return;
    const blocks = run.map((r) => r.block as number);
    const lead = run[0];
    const isList = run.every((r) => r.kind === 'li');
    const sv = seed++;
    const tsec = secTitle;
    const acc = ACCENTS[(sv + 1) % ACCENTS.length];
    scenes.push({
      from: blocks[0], to: blocks[blocks.length - 1], lead: 0.5, tail: 0.5,
      render: (c) => {
        if (isList) {
          return (
            <Pad style={{ top: 140 }}>
              <Fade at={0.3}><Kicker>{tsec}</Kicker></Fade>
              <div style={{ marginTop: 36 }}>
                {run.map((r, i) => (
                  <Fade key={i} at={rel(c, r.block as number) - 0.1} style={{ display: 'flex', alignItems: 'center', gap: 34, minHeight: 130, borderBottom: `2px solid ${P.line}` }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: ACCENTS[(i + sv) % ACCENTS.length], flex: 'none' }} />
                    <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{firstSentence(r, 140)}</div>
                  </Fade>
                ))}
              </div>
            </Pad>
          );
        }
        const quote = firstSentence(lead, 96);
        return (
          <>
            <Art seed={sv} accent={acc} />
            <Pad style={{ right: 860, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Fade at={0.4}><Kicker color={acc}>{tsec}</Kicker></Fade>
              <Fade at={0.6}><Big size={quote.length > 70 ? 62 : 76} style={{ marginTop: 22, lineHeight: 1.12 }}>{quote}</Big></Fade>
            </Pad>
          </>
        );
      },
    });
    run = [];
  };
  const pending = spoken.filter((s) => !used.has(s.block as number) && !['h2', 'h3'].includes(s.kind));
  let startT = 0;
  for (const s of pending) {
    const last = run[run.length - 1];
    const gap = last && (s.block as number) - (last.block as number) > 1;
    const li = s.kind === 'li';
    const lastLi = last?.kind === 'li';
    if (run.length && (gap || li !== lastLi || (s.end as number) - startT > 34 || run.length >= 5)) flush();
    if (!run.length) startT = s.start as number;
    run.push(s);
  }
  flush();

  // order by the time of the first block so crossfades stack the way the narration goes
  return scenes.sort((a, b) => a.from - b.from || (a.to - b.to));
}
