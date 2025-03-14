"use client";

import { useState, useEffect } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(progress => progress < 100 ? progress + 5 : 100);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 z-50">
      {/* 中央の円形アニメーション */}
      <div className="relative w-28 h-28 mb-10">
        <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
        <div className="absolute inset-0 rounded-full border-t-4 border-white animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-r-4 border-white/50 animate-ping" style={{animationDuration: '1.5s'}}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">{progress}%</span>
        </div>
      </div>
      
      {/* プログレスバー */}
      <div className="w-72 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* テキストアニメーション */}
      <div className="mt-8 text-white font-medium text-lg tracking-widest animate-pulse">
       読み込み中
      </div>
      
      {/* 波打つドットのアニメーション */}
      <div className="mt-10 flex space-x-2">
        {[0, 1, 2, 3, 4].map((dot) => (
          <span 
            key={dot}
            className="inline-block w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ 
              animationDelay: `${dot * 0.15}s`,
              animationDuration: '0.8s'
            }}
          ></span>
        ))}
      </div>
      
      {/* 円形のフロートアニメーション (装飾) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}