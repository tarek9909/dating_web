const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'gifs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

const searches = {
  'invitation_pleading': 'cat-pleading',
  'angry_strike_3': 'angry-cat',
  'loc_skymate': 'fancy-cat',
  'loc_hawana': 'cool-cat-sunglasses',
  'loc_jia': 'beach-cat',
  'food_lebanese': 'cat-eating',
  'food_italian': 'cat-pasta',
  'food_sandwiches': 'hamster-sandwich',
  'when_tomorrow': 'cat-clock',
  'dress_casual': 'cat-hoodie',
  'final_date': 'happy-cat-dance'
};

async function run() {
  console.log('Searching and downloading GIFs...');
  for (const [key, term] of Object.entries(searches)) {
    try {
      const searchUrl = `https://tenor.com/search/${term}-gifs`;
      const html = await fetchText(searchUrl);
      const matches = html.match(/https:\/\/media[0-9]?\.tenor\.com\/[^"]+\.(gif|webp)/g) || [];
      const best = matches.find(m => m.includes('AAAAM') && m.endsWith('.gif')) ||
                   matches.find(m => m.endsWith('.gif')) ||
                   matches.find(m => m.includes('AAAAm') && m.endsWith('.webp')) ||
                   matches[0];

      if (best) {
        const ext = best.endsWith('.webp') ? '.webp' : '.gif';
        const dest = path.join(outDir, `${key}${ext}`);
        console.log(`Downloading ${key} from ${best}`);
        await downloadFile(best, dest);
        console.log(`Saved ${key}${ext}`);
      } else {
        console.log(`No GIF found for ${key}`);
      }
    } catch (err) {
      console.error(`Failed for ${key}:`, err.message);
    }
  }
  console.log('Done downloading GIFs!');
}

run();
