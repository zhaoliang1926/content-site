import fs from 'fs';
import path from 'path';

export async function getStaticPaths() {
  const postsDir = path.join(process.cwd(), 'posts');
  const files = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter(f => f.endsWith('.json')) : [];
  return {
    paths: files.map(f => ({ params: { slug: f.replace('.json', '') } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'posts', `${params.slug}.json`), 'utf8'));
  return { props: { post: raw } };
}

export default function Post({ post }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <a href="/" style={{ color: '#666', fontSize: 14 }}>← 返回</a>
      <h1 style={{ fontSize: 28, marginTop: 20 }}>{post.title}</h1>
      <p style={{ color: '#999', fontSize: 13 }}>{post.date} · {post.tags?.join(', ')}</p>
      <div style={{ lineHeight: 1.9, fontSize: 16, color: '#333', marginTop: 30 }}
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
    </div>
  );
}
