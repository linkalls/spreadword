"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function WordSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // 新しいURLSearchParamsを作成
    const params = new URLSearchParams(searchParams?.toString() || "");
   
   
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    // ソフトナビゲーション（replaceを使用）
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false
    });
  }, [debouncedSearch, router, searchParams, pathname]);

  return (
    <div className="relative flex-1 max-w-sm mb-6">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="単語を検索..."
        value={search}
        className="pl-8"
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
