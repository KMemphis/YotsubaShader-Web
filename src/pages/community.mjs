import { icon, code, table, note, cardLink } from '../components.mjs';
import { SITE } from '../site.mjs';

const community = {
  path: '/community/',
  section: 'community',
  title: 'Community',
  description: 'Join the Yotsuba Shader community: contribute shaders, attributes and backends.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Community</h1>
    <p class="lead">Yotsuba Shader is developed in the open. Contributions are welcome, from a motivating shader to a new backend.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${SITE.repo}" rel="noopener">${icon('github')} GitHub repository</a>
      <a class="btn btn-secondary" href="/community/contributing/">How to contribute</a>
    </div>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container">
    <div class="grid grid-3">
      ${cardLink({ href: '/community/contributing/', icon: 'users', title: 'Contributing', body: 'Open an issue with your problem, proposal and a motivating shader or backend example.' })}
      ${cardLink({ href: '/community/licensing/', icon: 'scale', title: 'Licensing', body: 'Free and open source under the MIT License. Use it in any project, commercial or not.' })}
      ${cardLink({ href: '/donations/', icon: 'heart', title: 'Support the project', body: 'Sponsorship funds development and keeps the project maintained.' })}
    </div>
    <h2 class="h-md" style="margin-top:72px">Ways to help</h2>
    <div class="grid grid-2 mt-24">
      <div class="panel"><h3 class="h-md" style="font-size:20px;margin-bottom:10px">Write shaders</h3><p class="card-body" style="margin:0">Real shaders reveal missing built-ins and awkward attribute names. Share the ones that do not compile.</p></div>
      <div class="panel"><h3 class="h-md" style="font-size:20px;margin-bottom:10px">Review attribute equivalence</h3><p class="card-body" style="margin:0">Each style should mean the same thing as its source language. Spotting a mismatch is a valuable contribution.</p></div>
      <div class="panel"><h3 class="h-md" style="font-size:20px;margin-bottom:10px">Build backends</h3><p class="card-body" style="margin:0">Add or improve the Direct3D, Metal, WebGPU, OpenGL and WebGL backends. The IR is the contract to build against.</p></div>
      <div class="panel"><h3 class="h-md" style="font-size:20px;margin-bottom:10px">Improve tests and docs</h3><p class="card-body" style="margin:0">Add frontend tests, SPIR-V validation checks and documentation for the pieces you use.</p></div>
    </div>
  </div>
</section>`,
};

const contributing = {
  path: '/community/contributing/',
  section: 'community',
  title: 'Contributing',
  description: 'How to propose changes to Yotsuba Shader.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Contributing</h1>
    <p class="lead">Contributions are welcome. Design changes start as an issue.</p>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container container--narrow prose">
    <h2>Design changes</h2>
    <p>For design changes, open an issue describing:</p>
    <ul>
      <li>the problem you want to solve,</li>
      <li>your proposal, and</li>
      <li>a motivating shader or backend example.</li>
    </ul>
    <h2>Attribute changes</h2>
    <p>Attribute changes should explain their <strong>semantic equivalence</strong> with the language they are inspired by, and include tests where appropriate. An attribute in one style must mean the same thing as its counterparts in the other four.</p>
    <h2>Before you open a pull request</h2>
    ${code('bash', `dotnet build YotsubaShader.sln
dotnet test YotsubaShader.Frontend.Tests`)}
    <h2>Licensing of contributions</h2>
    <p>Yotsuba Shader is released under the MIT License, and contributions are accepted under the same license. See <a href="/community/licensing/">Licensing</a>.</p>
    <p><a class="btn btn-primary" href="${SITE.repo}" rel="noopener">${icon('github')} Open the repository</a></p>
  </div>
</section>`,
};

const licensing = {
  path: '/community/licensing/',
  section: 'community',
  title: 'Licensing',
  description: 'Yotsuba Shader is released under the MIT License: free for any project, commercial or not.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Licensing</h1>
    <p class="lead">Yotsuba Shader is released under the MIT License. Use it in any project, commercial or not.</p>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container container--narrow prose">
    <h2>The MIT License</h2>
    <p>You can use, copy, modify, merge, publish, distribute, sublicense and sell Yotsuba Shader. That includes using it inside a proprietary game engine, framework, editor or game, with no fee and without publishing your own source code.</p>
    <p>The only condition is to keep the copyright notice and the license text in copies or substantial portions of the software.</p>
    <h2>Your shaders and their binaries</h2>
    <p>The shaders you write and the binaries Yotsuba Shader generates from them belong to you. Nothing in them is subject to a copyleft requirement.</p>
    <h2>Third-party components</h2>
    <p>Yotsuba Shader builds on other open-source work, each under its own license: Roslyn (<code>Microsoft.CodeAnalysis</code>, MIT) and the SPIR-V grammar published by the Khronos Group (MIT). Their notices are kept in the repository.</p>
    <h2>Name and logo</h2>
    <p>The MIT License covers the code. The name Yotsuba Shader and its logo are not part of it: please do not present a modified version as the official project.</p>
    <p><a class="link-more" href="${SITE.repo}" rel="noopener">Read the license in the repository ${icon('chevron-right')}</a></p>
  </div>
</section>`,
};

/* ---------------------------------------------------------------- donations */
const donations = {
  path: '/donations/',
  section: 'donations',
  title: 'Donations',
  description: 'Support the development of Yotsuba Shader, a free and open-source shader framework for C#.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <p style="font-size:44px;margin:0 0 6px;color:#ff3b30">${icon('heart')}</p>
    <h1 class="h-xl">Support Yotsuba Shader</h1>
    <p class="lead">Yotsuba Shader is free and open source. Sponsors keep it maintained and growing.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${SITE.sponsors}" rel="noopener">${icon('heart')} Sponsor on GitHub</a>
      <a class="btn btn-secondary" href="/donations/sponsors/">Our sponsors</a>
    </div>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container">
    <div class="grid grid-2">
      <div class="panel">
        <h2 class="h-md">Individuals and teams</h2>
        <p class="card-body mt-24">Use Yotsuba Shader for free under the MIT License. If it helps you ship, consider <a href="${SITE.sponsors}" rel="noopener">sponsoring its development on GitHub</a>.</p>
      </div>
      <div class="panel">
        <h2 class="h-md">Engines, frameworks and tools</h2>
        <p class="card-body mt-24">If your engine, framework or studio relies on Yotsuba Shader, <a href="${SITE.sponsors}" rel="noopener">sponsoring it on GitHub</a> helps keep it maintained, and you are welcome to <a href="${SITE.repo}" rel="noopener">get in touch</a> about integration.</p>
      </div>
    </div>
    <div class="sponsor-panel">
      <img class="sp-mark" src="/img/yotsuba-shader.webp" alt="" loading="lazy">
      <div class="sp-copy">
        <h2 class="card-title">Sponsor Yotsuba Shader</h2>
        <p class="card-body">Your sponsorship funds its development and keeps it free for everyone.</p>
        <div class="sp-actions">
          <a class="btn btn-primary" href="${SITE.sponsors}" rel="noopener">${icon('heart')} Sponsor on GitHub</a>
          <a class="link-more" href="/donations/sponsors/">Our sponsors ${icon('chevron-right')}</a>
        </div>
        <p class="sp-note">Sponsorships are handled by GitHub Sponsors. This site does not collect payments.</p>
      </div>
    </div>
  </div>
</section>`,
};

const sponsors = {
  path: '/donations/sponsors/',
  section: 'donations',
  title: 'Sponsors',
  description: 'The people and organizations that support the development of Yotsuba Shader.',
  body: `
<section class="hero hero--compact">
  <div class="container">
    <h1 class="h-xl">Sponsors</h1>
    <p class="lead">Thank you to the people and organizations that support Yotsuba Shader.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${SITE.sponsors}" rel="noopener">${icon('heart')} Become a sponsor</a>
    </div>
  </div>
  <hr class="hero-rule">
</section>
<section class="section">
  <div class="container container--narrow prose">
    <p>Sponsors who want to be listed appear here. Their support pays for the time that goes into maintaining and improving Yotsuba Shader.</p>
    <p class="muted">No sponsors are listed yet. You could be the first.</p>
  </div>
</section>`,
};

export default [community, contributing, licensing, donations, sponsors];
