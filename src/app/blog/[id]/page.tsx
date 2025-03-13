import { blogPosts } from "../blogList";

export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = blogPosts.find((post) => post.id === params.id);

  if (!post) {
    return <div>ブログ記事が見つかりませんでした</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <time className="text-sm text-gray-500 mb-3 block">{post.date}</time>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <p className="text-gray-700 mb-4">{post.body}</p>
    </div>
  );
}
