import "next-auth";
import type { DefaultSession } from "next-auth";

// ユーザーロールの列挙型
export const UserRoles = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

// next-authのセッション型を拡張
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
  role: UserRole;
}

export interface AuthButtonsProps {
  user: SessionUser | null;
}

// APIルートのハンドラー型
export type ApiHandler = (
  params: { params: { [key: string]: string } },
  session: SessionUser | null
) => Promise<Response>;

// withAuth用の型
export type AuthMiddleware = (
  handler: ApiHandler,
  requiredRole?: UserRole
) => (params: { params: { [key: string]: string } }) => Promise<Response>;
