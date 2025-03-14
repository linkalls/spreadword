'use client';

export function QuizLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* カード形状のスケルトン */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          {/* タイトルのスケルトン */}
          <div className="h-7 bg-gray-200 rounded animate-pulse mb-8 w-3/4"></div>
          
          {/* 選択肢のスケルトン */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative overflow-hidden">
                <div className="h-14 bg-gray-100 rounded-lg border border-gray-200 animate-pulse">
                  {/* グラデーションアニメーション */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    style={{
                      animation: `shimmer 2s infinite`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* 下部のヒントテキスト */}
          <div className="mt-6 text-center text-gray-500">
            <div className="inline-block animate-bounce">
              <span className="mr-2">問題を準備しています</span>
              <span className="inline-flex">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className="mx-0.5 animate-bounce"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                    }}
                  >
                    ●
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* アニメーション用のスタイル */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
