// "use client";

// import { useSession } from "next-auth/react";

// export default function ProtectedPage() {
//   const { data, status, update } = useSession({
//     required: true, // SSRやCSRで有効
//     onUnauthenticated: () => {
//       // デフォルトではビルトインの`signIn`関数が呼ばれる
//       // またサイン後にこのページに戻ってくるようcallbackUrlの設定も行われる
//       // loggerやクライアントでの特別な処理をしたいときに有効
//     },
//   });

//   console.log(status, update);

//   // if (data?.user) return null;

//   return (
//     <div>
//       <p>{data?.user?.email}</p>
//       <p>use clientだよ</p>
//     </div>
//   );
// }

// interface User {
//   id: number;
//   name: string;
//   email: string;
// }
"use server";
import { db } from "@/db/dbclient";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Page() {
  // const user = await db.select({ id: userTable.id }).from(userTable);
  const user = await db.select().from(userTable).where(eq(userTable.id, 1));
  console.log(user);
  return <div></div>;
}
