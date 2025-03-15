'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-lg opacity-90">
        {/* エラーアイコン */}
        <div className="mx-auto w-24 h-24 mb-8">
          <svg
            className="w-full h-full text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* エラーメッセージ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error.message || 'アプリケーションで予期せぬエラーが発生しました。'}
          </p>
        </div>

        {/* ホームに戻るボタン */}
        <div>
          <Link href="/" passHref>
            <Button 
              size="lg"
              className="group"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
