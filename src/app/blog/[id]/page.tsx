import { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "../blogList";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// 動的メタデータを生成するための関数
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find((post) => post.id === params.id);

  if (!post) {
    return {
      title: "記事が見つかりません",
    };
  }

  return {
    title: post.title,
    description: post.body.substring(0, 160),
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((post) => post.id === params.id);

  if (!post) {
    notFound();
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
