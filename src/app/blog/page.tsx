import Link from "next/link";
import { blogPosts } from "./blogList";

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Dev Blog</h1>
        <p className="text-xl text-gray-600">
          Thoughts, learnings, and discoveries about modern web development
        </p>
      </header>

      <div className="space-y-10">
        {blogPosts.map((post) => (
          <article key={post.id} className="border-b border-gray-200 pb-8">
            <Link
              href={`/blog/${post.id}`}
              className="block hover:opacity-80 transition-opacity"
            >
              <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            </Link>
            <time className="text-sm text-gray-500 mb-3 block">
              {post.date}
            </time>
            <p className="text-gray-700 mb-4">{post.description}</p>
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
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/blog/archive"
          className="inline-block bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          View All Posts
        </Link>
      </div>
    </div>
  );
}
