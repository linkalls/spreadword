// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// interface User {
//   id: string;
//   name: string | null;
//   image: string | null;
// }

// interface GroupMember {
//   userId: string;
//   role: string;
//   user: User;
// }

// interface Group {
//   id: string;
//   name: string;
//   description: string;
//   level: string;
//   memberCount: number;
//   members: GroupMember[];
// }

// export function Groups() {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
//   const [newGroup, setNewGroup] = useState({
//     name: "",
//     description: "",
//     level: "beginner",
//   });
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

//   // グループ一覧を取得する際にメンバー情報を含める
//   const fetchGroups = async () => {
//     try {
//       const response = await fetch("/api/groups");
//       if (!response.ok) {
//         throw new Error("グループの取得に失敗しました");
//       }
//       const data = await response.json();
//       // グループデータをセット（メンバー情報が必ず配列になるようにする）
//       setGroups(data.map((group: Group) => ({
//         ...group,
//         members: group.members || [],
//       })));
//     } catch (error) {
//       console.error("Error fetching groups:", error);
//       toast.error("グループの取得に失敗しました");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     console.log("Fetching groups...");
//     fetchGroups();
//   }, [session?.user?.id]); // セッションが変更されたときにグループ一覧を再取得

//   const isGroupMember = (group: Group) => {
//     if (!session?.user?.id || !group.members?.length) return false;

//     // メンバーシップの詳細なチェック
//     const membership = group.members.find(member => member.userId === session.user?.id);
//     const isMember = Boolean(membership);

//     if (isMember) {
//       console.log(`User ${session.user.id} is a member of group ${group.id} with role: ${membership?.role}`);
//     }

//     return isMember;
//   };



//   const handleCreateGroup = async () => {
//     if (!session) {
//       toast.error("グループを作成するにはログインが必要です");
//       router.push("/auth/signin");
//       return;
//     }

//     try {
//       const response = await fetch("/api/groups", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newGroup),
//       });

//       if (!response.ok) {
//         throw new Error("グループの作成に失敗しました");
//       }

//       const { group, groups: updatedGroups } = await response.json();
//       // 更新されたグループ一覧をセット（メンバー情報が必ず配列になるようにする）
//       setGroups(updatedGroups.map((group: Group) => ({
//         ...group,
//         members: group.members || []
//       })));
//       setIsCreateDialogOpen(false);
//       setNewGroup({ name: "", description: "", level: "beginner" });
//       toast.success("グループを作成しました");
//       router.push(`/groups/${group.id}`);
//     } catch (error) {
//       console.error("Error creating group:", error);
//       toast.error("グループの作成に失敗しました");
//     }
//   };

//   const handleJoinGroup = async (groupId: string) => {
//     if (!session) {
//       toast.error("グループに参加するにはログインが必要です");
//       router.push("/auth/signin");
//       return;
//     }

//     if (joiningGroupId) return; // 既に参加処理中なら何もしない
    
//     setJoiningGroupId(groupId);
//     try {
//       // 既にメンバーかどうかを確認
//       const targetGroup = groups.find(g => g.id === groupId);
//       if (targetGroup && isGroupMember(targetGroup)) {
//         router.push(`/groups/${groupId}`);
//         return;
//       }

//       const response = await fetch(`/api/groups/${groupId}/join`, {
//         method: "POST",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "グループへの参加に失敗しました");
//       }

//       // APIから返された更新済みのグループ情報を使用して状態を更新
//       const updatedGroup = data.group;
//       console.log("Updated group data:", updatedGroup);
      
//       // グループの状態を更新
//       setGroups(prevGroups => {
//         const newGroups = prevGroups.map(group => 
//           group.id === groupId ? {
//             ...updatedGroup,
//             memberCount: updatedGroup.members.length,
//             members: updatedGroup.members || []  // メンバー配列を確実に設定
//           } : group
//         );
//         console.log("Updated groups state:", newGroups);
//         return newGroups;
//       });

//       toast.success("グループに参加しました");
//       router.push(`/groups/${groupId}`);
//     } catch (error) {
//       console.error("Error joining group:", error);
//       if (error instanceof Error) {
//         toast.error(error.message);
//       } else {
//         toast.error("グループへの参加に失敗しました");
//       }
//     } finally {
//       setJoiningGroupId(null);
//     }
//   };

//   const handleNavigateToGroup = (groupId: string) => {
//     router.push(`/groups/${groupId}`);
//   };

//   const filteredGroups = groups.filter((group) =>
//     group.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div className="flex justify-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//         </div>
//       </div>
//     );
//   }

//   const levelText = {
//     beginner: "初級",
//     intermediate: "中級",
//     advanced: "上級",
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//         <Input
//           type="search"
//           placeholder="グループを検索..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="max-w-md"
//         />
//         <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>新しいグループを作成</Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>新しいグループを作成</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="name">グループ名</Label>
//                 <Input
//                   id="name"
//                   value={newGroup.name}
//                   onChange={(e) =>
//                     setNewGroup({ ...newGroup, name: e.target.value })
//                   }
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">説明</Label>
//                 <Input
//                   id="description"
//                   value={newGroup.description}
//                   onChange={(e) =>
//                     setNewGroup({ ...newGroup, description: e.target.value })
//                   }
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="level">レベル</Label>
//                 <Select
//                   value={newGroup.level}
//                   onValueChange={(value) =>
//                     setNewGroup({ ...newGroup, level: value })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="レベルを選択" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="beginner">初級</SelectItem>
//                     <SelectItem value="intermediate">中級</SelectItem>
//                     <SelectItem value="advanced">上級</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <Button onClick={handleCreateGroup} className="w-full">
//                 作成
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {filteredGroups.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           グループが見つかりません
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredGroups.map((group) => (
//             <Card key={group.id}>
//               <CardHeader>
//                 <CardTitle>{group.name}</CardTitle>
//                 <CardDescription>
//                   レベル: {levelText[group.level as keyof typeof levelText]}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm text-gray-600 mb-4">
//                   {group.description}
//                 </p>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-500">
//                     メンバー: {group.memberCount}人
//                   </span>
//                   {isGroupMember(group) ? (
//                     <Button
//                       variant="outline"
//                       onClick={() => handleNavigateToGroup(group.id)}
//                     >
//                       グループページへ
//                     </Button>
//                   ) : (
//                     <Button
//                       variant="outline"
//                       onClick={() => handleJoinGroup(group.id)}
//                       disabled={joiningGroupId === group.id}
//                     >
//                       {joiningGroupId === group.id ? "参加中..." : "参加する"}
//                     </Button>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
