import fs from 'fs';
import path from 'path';

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), 'posts');
  const files = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter(f => f.endsWith('.json')) : [];
  const posts = files.map(f => {
    const raw = JSON.parse(fs.readFileSync(path.join(postsDir, f), 'utf8'));
    return {
      slug: f.replace('.json', ''),
      title: raw.title,
      date: raw.date,
      excerpt: raw.content.substring(0, 150) + '...',
      tags: raw.tags || [],
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  return { props: { posts } };
}

export default function Home({ posts }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>AI创作工坊</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>AI工具 · 个人IP打造 · 内容创业 | 全自动日更</p>
      {posts.map(post => (
        <article key={post.slug} style={{ marginBottom: 32, padding: '20px 0', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>
            <a href={`/post/${post.slug}`} style={{ color: '#000', textDecoration: 'none' }}>{post.title}</a>
          </h2>
          <p style={{ color: '#888', fontSize: 13 }}>{post.date}</p>
          <p style={{ color: '#444', lineHeight: 1.7 }}>{post.excerpt}</p>
          <div>{post.tags.map(t => <span key={t} style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 10, fontSize: 12, marginRight: 6 }}>{t}</span>)}</div>
        </article>
      ))}
      {posts.length === 0 && <p style={{ color: '#999' }}>Content being generated... check back soon.</p>}
    </div>
  );
}
