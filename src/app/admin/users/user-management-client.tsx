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
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

interface UserWithRole {
  id: string;
  name: string | null;
  email: string | null;
  roles: {
    role: string;
  }[];
}

export function UserManagementClient() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, role: string) => {
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

      // 更新後にユーザー一覧を再取得
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>権限</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
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
                        toast.promise(updateUserRole(user.id, "admin"), {
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
                        toast.promise(updateUserRole(user.id, "user"), {
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
