"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface GroupMember {
  userId: string;
  role: string;
  user: User;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  level: string;
  members: GroupMember[];
}

interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: User;
}

interface GroupDetailsProps {
  group: Group;
  userId: string;
}

export function GroupDetails({ group, userId }: GroupDetailsProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期ロード時にメッセージを取得
  useEffect(() => {
    // メッセージをフェッチする関数
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/groups/${group.id}/chat`);
        if (!response.ok) {
          throw new Error("メッセージの取得に失敗しました");
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("メッセージの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();

    // 定期的な更新（30秒ごと）
    const interval = setInterval(fetchMessages, 30000);

    return () => clearInterval(interval);
  }, [group.id]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        throw new Error("メッセージの送信に失敗しました");
      }

      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setMessage("");
    } catch (error) {
      console.log(error);
      toast.error("メッセージの送信に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin =
    group.members.find((member) => member.userId === userId)?.role === "admin";

  const roleText = {
    admin: "管理者",
    moderator: "モデレーター",
    member: "メンバー",
  };

  const levelText = {
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
        <p className="text-gray-600 mb-4">
          レベル: {levelText[group.level as keyof typeof levelText]}
        </p>
        {group.description && (
          <p className="text-gray-600">{group.description}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chat">チャット</TabsTrigger>
          <TabsTrigger value="members">メンバー</TabsTrigger>
          {isAdmin && <TabsTrigger value="settings">設定</TabsTrigger>}
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow min-h-[400px] flex flex-col">
            <div className="space-y-4 mb-4 overflow-y-auto max-h-[500px] flex-1">
              {isLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  メッセージはありません
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      msg.userId === userId ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      {msg.user.name?.[0] || "U"}
                    </Avatar>
                    <div
                      className={`${
                        msg.userId === userId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      } p-3 rounded-lg max-w-[70%]`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {msg.user.name || "Unknown"}
                      </p>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="メッセージを入力..."
                className="min-h-[80px]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
              >
                送信
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="space-y-4">
              {group.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      {member.user.image ? (
                        <AvatarImage
                          src={member.user.image}
                          alt={member.user.name || "ユーザー"}
                        />
                      ) : (
                        <AvatarFallback>
                          {member.user.name?.[0] || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {roleText[member.role as keyof typeof roleText]}
                      </p>
                    </div>
                  </div>
                  {isAdmin && member.userId !== userId && (
                    <Button variant="outline" size="sm">
                      権限変更
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings">
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
              <h2 className="text-xl font-semibold mb-4">グループ設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    グループ名
                  </label>
                  <Input defaultValue={group.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <Textarea defaultValue={group.description || ""} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    レベル
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    defaultValue={group.level}
                  >
                    <option value="beginner">初級</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">上級</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">キャンセル</Button>
                  <Button>保存</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
