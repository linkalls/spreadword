"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { ChevronDown, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";

interface UserWithRole {
  id: string;
  name: string | null;
  email: string | null;
  roles: {
    role: string;
  }[];
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// メモ化されたユーザー行コンポーネント
const UserRow = memo(({ 
  user, 
  onUpdateRole 
}: { 
  user: UserWithRole;
  onUpdateRole: (userId: string, role: string) => Promise<void>;
}) => {
  return (
    <TableRow key={user.id}>
      <TableCell>{user.name || "未設定"}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {user.roles.length > 0 ? user.roles[0].role : "user"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[120px]">
              権限変更
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                toast.promise(onUpdateRole(user.id, "admin"), {
                  loading: "権限を更新中...",
                  success: "管理者権限に更新しました",
                  error: "権限の更新に失敗しました",
                });
              }}
              disabled={user.roles[0]?.role === "admin"}
            >
              管理者に昇格
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.promise(onUpdateRole(user.id, "user"), {
                  loading: "権限を更新中...",
                  success: "一般ユーザー権限に更新しました",
                  error: "権限の更新に失敗しました",
                });
              }}
              disabled={!user.roles[0] || user.roles[0]?.role === "user"}
            >
              一般ユーザーに降格
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

UserRow.displayName = "UserRow";

// ページネーションコンポーネント
const Pagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        前へ
      </Button>
      <div className="flex items-center gap-1">
        <span className="text-sm">
          {currentPage} / {totalPages}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        次へ
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});

Pagination.displayName = "Pagination";

export function UserManagementClient() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/users?page=${currentPage}&search=${encodeURIComponent(debouncedSearch)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPaginationInfo(data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("ユーザー情報の取得に失敗しました");
      toast.error("ユーザー情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error; // toastのエラーハンドリングのために再スロー
    }
  }, [fetchUsers]);

  // メモ化されたユーザーリスト
  const userList = useMemo(
    () => users.map(user => (
      <UserRow
        key={user.id}
        user={user}
        onUpdateRole={updateUserRole}
      />
    )),
    [users, updateUserRole]
  );

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchUsers}>再試行</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="ユーザーを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-[200px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>権限</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{userList}</TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={paginationInfo.totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
