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
// Estimator defaults. The page renders them without JavaScript; donate.js recalculates when the numbers change.
const EST = { developers: 5, hours: 4, rate: 50, share: 2 };
const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
const estValue = EST.developers * EST.hours * EST.rate;
const estAmount = (estValue * EST.share) / 100;

const donations = {
  path: '/donations/',
  section: 'donations',
  title: 'Donations',
  description: 'Support the development of Yotsuba Shader, a free and open-source shader framework for C#.',
  scripts: ['/js/donate.js'],
  body: `
<section class="hero hero--compact">
  <div class="container">
    <p style="font-size:44px;margin:0 0 6px;color:#ff3b30">${icon('heart')}</p>
    <h1 class="h-xl">Keep Yotsuba Shader going.</h1>
    <p class="lead">Yotsuba Shader is free under the MIT License, and it stays that way. Sponsors pay for the time it takes to keep it working.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${SITE.sponsors}" rel="noopener">${icon('heart')} Sponsor on GitHub</a>
      <a class="btn btn-secondary" href="#estimate">Plan your sponsorship</a>
    </div>
    <p class="don-note">Payments are handled by GitHub Sponsors. This site does not collect payments.</p>
  </div>
  <hr class="hero-rule">
</section>

<section class="section">
  <div class="container">
    <div class="center" style="margin-bottom:40px">
      <h2 class="h-lg">What sponsoring changes</h2>
    </div>
    <div class="grid grid-3">
      <div class="card">
        <div class="card-icon">${icon('scale')}</div>
        <h3 class="card-title card-title--left">Free stays free</h3>
        <p class="card-body">The code is MIT. Sponsoring does not unlock features or change the license. Everyone gets the same code.</p>
      </div>
      <div class="card">
        <div class="card-icon">${icon('cpu')}</div>
        <h3 class="card-title card-title--left">Maintenance is real work</h3>
        <p class="card-body">One compiler, five shader vocabularies and six output formats. Each one needs testing, fixes and updates.</p>
      </div>
      <div class="card">
        <div class="card-icon">${icon('users')}</div>
        <h3 class="card-title card-title--left">It goes to the maintainer</h3>
        <p class="card-body">You sponsor through GitHub Sponsors, once or every month, and you can stop at any time.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <div class="center" style="margin-bottom:40px">
      <h2 class="h-lg">What your sponsorship pays for</h2>
      <p class="lead">Time. This is where that time goes.</p>
    </div>
    <div class="grid grid-2">
      <a class="card card--link" href="/technologies/">
        <span class="card-icon">${icon('layers')}</span>
        <span class="card-title">The compiler and its backends</span>
        <span class="card-body">Keeping the output correct for SPIR-V, HLSL, MSL, WGSL, GLSL and GLSL ES as the tools and drivers around it change.</span>
        <span class="card-more">See the technologies ${icon('external')}</span>
      </a>
      <a class="card card--link" href="/documentation/">
        <span class="card-icon">${icon('book')}</span>
        <span class="card-title">Documentation that teaches</span>
        <span class="card-body">Tutorials with C# examples, in English and Spanish, kept in step with the code.</span>
        <span class="card-more">Read the documentation ${icon('external')}</span>
      </a>
      <a class="card card--link" href="${SITE.repo}" rel="noopener">
        <span class="card-icon">${icon('flask')}</span>
        <span class="card-title">Testing on real platforms</span>
        <span class="card-body">Checking the compiler on real devices and operating systems, not only on one machine.</span>
        <span class="card-more">See the repository ${icon('external')}</span>
      </a>
      <a class="card card--link" href="/community/contributing/">
        <span class="card-icon">${icon('users')}</span>
        <span class="card-title">The community around it</span>
        <span class="card-body">Answering issues, reviewing contributions and publishing releases.</span>
        <span class="card-more">How to contribute ${icon('external')}</span>
      </a>
    </div>
  </div>
</section>

<section class="section section--rule" id="estimate" data-sponsors="${SITE.sponsors}">
  <div class="container">
    <div class="center" style="margin-bottom:40px">
      <h2 class="h-lg">Plan your sponsorship</h2>
      <p class="lead">Use your own numbers to see what fits your team. This is a guide, not a price.</p>
    </div>
    <div class="calc">
      <div class="calc-fields">
        <div class="calc-field">
          <label for="est-devs">Developers who use it</label>
          <input id="est-devs" type="number" inputmode="numeric" min="1" max="10000" step="1" value="${EST.developers}">
        </div>
        <div class="calc-field">
          <label for="est-hours">Hours it saves each developer per month</label>
          <input id="est-hours" type="number" inputmode="decimal" min="0" max="1000" step="0.5" value="${EST.hours}">
        </div>
        <div class="calc-field">
          <label for="est-rate">Cost of one hour of work (USD)</label>
          <input id="est-rate" type="number" inputmode="decimal" min="0" max="10000" step="5" value="${EST.rate}">
        </div>
        <div class="calc-field">
          <label for="est-share">Share of that value you give back: <b id="est-share-out">${EST.share}%</b></label>
          <input id="est-share" type="range" min="1" max="10" step="1" value="${EST.share}">
        </div>
        <p class="don-note">These numbers stay in your browser.</p>
      </div>
      <div class="calc-out" aria-live="polite">
        <div class="calc-row"><span>Hours saved per month</span><b id="est-hours-total">${EST.developers * EST.hours} h</b></div>
        <div class="calc-row"><span>Value of that time</span><b id="est-value">${usd(estValue)}</b></div>
        <div class="calc-result">
          <span class="calc-label">Suggested sponsorship</span>
          <span class="calc-amount"><b id="est-amount">${usd(estAmount)}</b> <small>/ month</small></span>
          <span class="calc-year" id="est-year">${usd(estAmount * 12)} a year</span>
        </div>
        <div class="calc-actions">
          <a class="btn btn-primary" href="${SITE.sponsors}" rel="noopener">${icon('heart')} Sponsor on GitHub</a>
          <button class="calc-copy" type="button" id="est-copy" hidden>${icon('copy')}<span>Copy a request for your team</span></button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <div class="center" style="margin-bottom:40px">
      <h2 class="h-lg">Who sponsors, and how</h2>
    </div>
    <div class="grid grid-3">
      <div class="panel">
        <h3 class="h-md">On your own</h3>
        <p class="card-body mt-24">Use it for free. If it saves you time, a small monthly amount helps keep it maintained.</p>
      </div>
      <div class="panel">
        <h3 class="h-md">A studio</h3>
        <p class="card-body mt-24">If your games ship with Yotsuba Shader, a monthly sponsorship costs little next to the time it saves your team.</p>
      </div>
      <div class="panel">
        <h3 class="h-md">An engine or framework</h3>
        <p class="card-body mt-24">If your engine builds on Yotsuba Shader, sponsoring keeps what you depend on maintained. You are welcome to <a href="${SITE.repo}" rel="noopener">get in touch</a> about integration.</p>
      </div>
    </div>
    <p class="center mt-24 muted">Sponsors who want to be listed appear on the <a href="/donations/sponsors/">Sponsors page</a>.</p>
  </div>
</section>

<section class="section section--rule">
  <div class="container">
    <div class="center" style="margin-bottom:40px">
      <h2 class="h-lg">Cannot sponsor? You can still help.</h2>
    </div>
    <div class="grid grid-3">
      <a class="card card--link" href="${SITE.repo}" rel="noopener">
        <span class="card-icon">${icon('code')}</span>
        <span class="card-title">Star the repository</span>
        <span class="card-body">It helps other developers find the project.</span>
      </a>
      <a class="card card--link" href="/community/contributing/">
        <span class="card-icon">${icon('flask')}</span>
        <span class="card-title">Report a problem</span>
        <span class="card-body">A clear bug report is a real contribution.</span>
      </a>
      <a class="card card--link" href="/community/contributing/">
        <span class="card-icon">${icon('globe')}</span>
        <span class="card-title">Improve the docs and translations</span>
        <span class="card-body">Fix a sentence, add an example or translate a page.</span>
      </a>
    </div>
  </div>
</section>

<section class="section section--rule">
  <div class="container container--narrow">
    <div class="center" style="margin-bottom:32px">
      <h2 class="h-lg">Questions</h2>
    </div>
    <div class="faq">
      <details>
        <summary>Is Yotsuba Shader still free?</summary>
        <p>Yes. It is released under the MIT License. Sponsoring is optional and gives no extra rights.</p>
      </details>
      <details>
        <summary>Do sponsors get a different license or extra features?</summary>
        <p>No. Everyone uses the same code under the same license.</p>
      </details>
      <details>
        <summary>Where is the payment processed?</summary>
        <p>On GitHub Sponsors. This site never sees your payment details.</p>
      </details>
      <details>
        <summary>Can I sponsor once, or every month?</summary>
        <p>Both. GitHub Sponsors supports a one-time and a monthly sponsorship.</p>
      </details>
      <details>
        <summary>Can I be listed as a sponsor?</summary>
        <p>Yes, if you want to be. Listed sponsors appear on the <a href="/donations/sponsors/">Sponsors page</a>.</p>
      </details>
    </div>
    <div class="sponsor-panel">
      <img class="sp-mark" src="/img/yotsuba-shader.webp" alt="" loading="lazy">
      <div class="sp-copy">
        <h2 class="card-title">Sponsor Yotsuba Shader</h2>
        <p class="card-body">Your sponsorship pays for the time that keeps it maintained, and it stays free for everyone.</p>
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
