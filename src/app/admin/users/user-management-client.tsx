"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";

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
    return <div>Loading...</div>;
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
                <div className="space-x-2">
                  {user.roles.length === 0 || user.roles[0].role === "user" ? (
                    <Button
                      variant="outline"
                      onClick={() => updateUserRole(user.id, "admin")}
                    >
                      管理者に昇格
                    </Button>
                  ) : user.roles[0].role === "admin" ? (
                    <Button
                      variant="outline"
                      onClick={() => updateUserRole(user.id, "user")}
                    >
                      一般ユーザーに降格
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
