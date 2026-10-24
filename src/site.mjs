// Site-wide configuration: navigation, sections and sub-navigation.
// Every entry below is a separate URL (no in-page "scroll to section" links).

export const SITE = {
  name: 'Yotsuba Shader',
  tagline: 'Write shaders in C#. Compile for the backend you choose.',
  repo: 'https://github.com/KMemphis/YotsubaShader',
  sponsors: 'https://github.com/sponsors/KMemphis',
  email: 'hello@yotsubashader.com',
  sponsorsEmail: 'sponsors@yotsubashader.com',
  legalEmail: 'legal@yotsubashader.com',
  newsEmail: 'news@yotsubashader.com',
  /** Public endpoint of the contact list (static-site form, no key). Only https://yotsubashader.com may call it. */
  subscribeEndpoint: 'https://flexocablemarketing.net/api/v1/public/companies/b066f9fc-7deb-4d3c-b8f1-0adc2871e139/contacts',
  feedReleases: 'https://github.com/KMemphis/YotsubaShader/releases.atom',
  feedCommits: 'https://github.com/KMemphis/YotsubaShader/commits/main.atom',
  year: 2026,
  /** Public address of the site (no trailing slash), e.g. SITE_URL=https://example.com. Empty until there is a domain. */
  url: (process.env.SITE_URL || '').replace(/\/+$/, ''),
};

/** Global navigation bar (left → right). */
export const NAV = [
  { id: 'get-started', label: 'Get Started', href: '/get-started/' },
  { id: 'syntaxes', label: 'Syntaxes', href: '/syntaxes/' },
  { id: 'playground', label: 'Playground', href: '/playground/' },
  { id: 'community', label: 'Community', href: '/community/' },
  { id: 'documentation', label: 'Documentation', href: '/documentation/' },
];

export const DONATIONS = { id: 'donations', label: 'Donations', href: '/donations/' };

/**
 * Sections with a sub-navigation bar (the "Metal  |  Overview  What's New  Resources" strip).
 * `sub` links are real pages.
 */
export const SECTIONS = {
  home: {
    title: 'Shader Framework',
    standard: true,
    href: '/',
    sub: [
      ['Overview', '/'],
      ["What's New", '/whats-new/'],
      ['Resources', '/resources/'],
    ],
  },
  'get-started': {
    title: 'Get Started',
    href: '/get-started/',
    sub: [
      ['Overview', '/get-started/'],
      ['Your First Shader', '/get-started/first-shader/'],
      ['Build from Source', '/get-started/build-from-source/'],
    ],
  },
  syntaxes: {
    title: 'Syntaxes',
    href: '/syntaxes/',
    sub: [
      ['Overview', '/syntaxes/'],
      ['HLSL', '/syntaxes/hlsl/'],
      ['GLSL', '/syntaxes/glsl/'],
      ['MSL', '/syntaxes/msl/'],
      ['SPIR-V', '/syntaxes/spirv/'],
      ['WGSL', '/syntaxes/wgsl/'],
    ],
  },
  technologies: {
    title: 'Technologies',
    href: '/technologies/',
    sub: [
      ['Overview', '/technologies/'],
      ['Language', '/technologies/language/'],
      ['Compiler', '/technologies/compiler/'],
      ['Compilation process', '/technologies/compilation/'],
      ['IR', '/technologies/intermediate-representation/'],
      ['SPIR-V', '/technologies/spir-v/'],
    ],
  },
  community: {
    title: 'Community',
    href: '/community/',
    sub: [
      ['Overview', '/community/'],
      ['Contributing', '/community/contributing/'],
      ['Licensing', '/community/licensing/'],
      ['Contact', '/community/contact/'],
    ],
  },
  donations: {
    title: 'Donations',
    href: '/donations/',
    sub: [
      ['Overview', '/donations/'],
      ['Sponsors', '/donations/sponsors/'],
    ],
  },
};

