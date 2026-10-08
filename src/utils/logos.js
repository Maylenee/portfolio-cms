// Tempel banyak logo sekaligus. Tiap baris/koma = satu logo. Format yang diterima:
//   https://…/logo.svg          (URL langsung)
//   Laravel=https://…/x.svg     (gaya .env, NAMA=URL; nama diabaikan)
//   laravel, flutter, vscode    (nama saja, dicarikan otomatis)
//   # baris komentar            (dilewati)
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
const SIMPLE = 'https://cdn.simpleicons.org';

const dev = (name, variant = 'original') => `${DEVICON}/${name}/${name}-${variant}.svg`;

// Nama populer -> URL Devicon (berwarna). Nama lain jatuh ke Simple Icons.
const ALIAS = {
  vscode: dev('vscode'),
  visualstudiocode: dev('vscode'),
  figma: dev('figma'),
  laravel: dev('laravel'),
  flutter: dev('flutter'),
  dart: dev('dart'),
  mysql: dev('mysql'),
  mariadb: dev('mariadb'),
  postgresql: dev('postgresql'),
  fastapi: dev('fastapi'),
  python: dev('python'),
  arduino: dev('arduino'),
  postman: dev('postman'),
  androidstudio: dev('androidstudio'),
  selenium: dev('selenium'),
  react: dev('react'),
  reactnative: dev('react'),
  nextjs: dev('nextjs'),
  nodejs: dev('nodejs'),
  javascript: dev('javascript'),
  typescript: dev('typescript'),
  php: dev('php'),
  cpp: dev('cplusplus'),
  cplusplus: dev('cplusplus'),
  firebase: dev('firebase'),
  github: dev('github'),
  git: dev('git'),
  docker: dev('docker'),
  tailwindcss: dev('tailwindcss'),
  html: dev('html5'),
  css: dev('css3'),
  drawio: `${SIMPLE}/diagramsdotnet`,
  diagramsnet: `${SIMPLE}/diagramsdotnet`,
  googledocs: `${SIMPLE}/googledocs`,
  googlemaps: `${SIMPLE}/googlemaps`,
};

const isUrl = (s) => /^(https?:\/\/|data:image\/)/i.test(s);
const slug = (s) => s.toLowerCase().replace(/[\s._+\-]/g, '');

/**
 * @returns {{ urls: string[], invalid: string[], duplicates: number }}
 * `existing` = URL yang sudah ada, supaya tidak ditambahkan dua kali.
 */
export function parseLogos(raw, existing = []) {
  const seen = new Set(existing.filter(Boolean));
  const urls = [];
  const invalid = [];
  let duplicates = 0;

  String(raw || '')
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('#'))
    .forEach((token) => {
      let url;
      if (isUrl(token)) {
        url = token;
      } else if (token.includes('=')) {
        url = token.slice(token.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
      } else {
        const key = slug(token);
        url = /^[a-z0-9]+$/.test(key) ? ALIAS[key] || `${SIMPLE}/${key}` : '';
      }
      if (!isUrl(url || '')) return invalid.push(token);
      if (seen.has(url)) {
        duplicates += 1;
        return;
      }
      seen.add(url);
      urls.push(url);
    });

  return { urls, invalid, duplicates };
}
