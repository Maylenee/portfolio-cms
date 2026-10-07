import PostCard from '../components/PostCard';
import Empty from '../components/Empty';

export default function HomeScreen({ content }) {
  const posts = content.posts
    .filter((p) => p.published !== false)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  if (posts.length === 0) return <Empty>Belum ada kegiatan yang diterbitkan.</Empty>;
  return posts.map((post) => <PostCard key={post.id} post={post} profile={content.profile} />);
}
