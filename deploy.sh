#!/bin/bash
# Sync factory output, rebuild, and deploy to GitHub Pages
set -e
SITE_DIR="/Users/zhaoliang/Workspace/content-site"
FACTORY_OUT="/Users/zhaoliang/Workspace/content-factory/output"

cd "$SITE_DIR"

# Step 1: Sync new articles from factory
echo "[deploy] Syncing factory output..."
node -e "
const fs = require('fs');
const path = require('path');
const outputDir = '$FACTORY_OUT';
const postsDir = path.join('$SITE_DIR', 'posts');
fs.mkdirSync(postsDir, { recursive: true });
const articles = fs.readdirSync(outputDir).filter(f => f.startsWith('article_') || f.startsWith('seed_'));
let synced = 0;
for (const article of articles) {
  const content = fs.readFileSync(path.join(outputDir, article), 'utf8');
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';
  if (!title || title.match(/^[^a-zA-Z0-9一-鿿]+$/)) continue;
  const slug = title.replace(/[^a-zA-Z0-9一-鿿]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
  if (!slug || slug.length < 1) continue;
  const postPath = path.join(postsDir, slug + '.json');
  if (fs.existsSync(postPath)) continue;
  const body = content.replace(/^# .+\n/m, '').replace(/^> .+\n/gm, '').trim();
  const post = { title, date: new Date().toISOString().split('T')[0], content: body, tags: ['AI工具', '自媒体', '内容创作', '效率提升'], source: 'content-factory' };
  fs.writeFileSync(postPath, JSON.stringify(post, null, 2));
  console.log('Synced: ' + slug);
  synced++;
}
console.log('Total synced: ' + synced);
"

# Step 2: Rebuild the static site
echo "[deploy] Building..."
npx next build 2>&1 | tail -3

# Step 3: Deploy to GitHub Pages
echo "[deploy] Deploying to GitHub Pages..."
DEPLOY_DIR="$SITE_DIR/out"
TMPDIR=$(mktemp -d)
git clone --depth 1 https://github.com/zhaoliang1926/zhaoliang1926.github.io.git "$TMPDIR" 2>&1
rm -rf "$TMPDIR"/* "$TMPDIR"/.git
cp -r "$DEPLOY_DIR"/* "$TMPDIR/"
cd "$TMPDIR"
touch .nojekyll
git init
git add -A
git commit -m "Deploy $(date +%Y-%m-%d_%H:%M:%S)" --quiet
git remote add origin https://github.com/zhaoliang1926/zhaoliang1926.github.io.git
git push -f origin main --quiet 2>&1
rm -rf "$TMPDIR"
echo "[deploy] Done! https://zhaoliang1926.github.io/"
