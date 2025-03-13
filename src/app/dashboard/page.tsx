"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>{status}</p>
      <p> {session!.user!.name}</p>
    </div>
  );
}
