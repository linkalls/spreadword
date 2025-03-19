"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  search?: string;
}

export function Pagination({ currentPage, totalPages, search }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    console.log("[Pagination] Page change requested:", page);
    
    // 現在のクエリパラメータを新しいURLSearchParamsオブジェクトにコピー
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    // ページ番号を更新
    params.set("page", page.toString());
    
    // 検索パラメータがある場合は保持
    if (search) {
      params.set("search", search);
    }

    // 新しいURLを構築
    const newUrl = `${pathname}?${params.toString()}`;
    console.log("[Pagination] Navigating to:", newUrl);
    
    // ソフトナビゲーション（replaceを使用）
    router.replace(newUrl, { scroll: false });
  };

  console.log("[Pagination] Rendering with:", { currentPage, totalPages, search });

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {currentPage > 1 && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          前へ
        </button>
      )}
      <span className="text-gray-600">
        {currentPage} / {totalPages} ページ
      </span>
      {currentPage < totalPages && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          次へ
        </button>
      )}
    </div>
  );
}
