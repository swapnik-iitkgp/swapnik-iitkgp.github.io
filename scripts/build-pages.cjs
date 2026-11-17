const fs = require('node:fs');
const path = require('node:path');

// GitHub Pages needs an actual index file for direct visits and refreshes.
const buildDirectory = path.resolve(process.env.BUILD_PATH || 'build');
const pageDirectory = path.join(buildDirectory, 'explorations');
const html = fs.readFileSync(path.join(buildDirectory, 'index.html'), 'utf8')
  .replace(/<title>[^<]*<\/title>/, '<title>Explorations | Swapnik Varala</title>')
  .replace(/(<link[^>]*rel="canonical"[^>]*href=")[^"]*(")/, '$1https://swapnik-iitkgp.github.io/explorations/$2')
  .replace(/(<meta[^>]*property="og:url"[^>]*content=")[^"]*(")/, '$1https://swapnik-iitkgp.github.io/explorations/$2')
  .replace(/(<meta[^>]*property="og:title"[^>]*content=")[^"]*(")/, '$1Explorations | Swapnik Varala$2')
  .replace(/(<meta[^>]*(?:name="description"|property="og:description")[^>]*content=")[^"]*(")/g, '$1Tutorials, ideas, animations, and writing by Swapnik Varala. Explore interactive demos and experiments.$2');

fs.mkdirSync(pageDirectory, { recursive: true });
fs.writeFileSync(path.join(pageDirectory, 'index.html'), html);
console.log('Created /explorations/index.html');
