"use client";

import { SubmissionCard } from "@/components/word-submission/submission-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSubmittedWord } from "@/db/schema";

interface SubmissionsClientProps {
  initialSubmissions: UserSubmittedWord[];
}

type ActionType = {
  id: number;
  action: "approve" | "reject";
};

export function SubmissionsClient({ initialSubmissions }: SubmissionsClientProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    if (!selectedAction) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/words/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedAction.id,
          action: selectedAction.action,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("処理に失敗しました");
      }

      // 成功した場合、リストを更新
      setSubmissions((prev) =>
        prev.filter((submission) => submission.id !== selectedAction.id)
      );
      toast.success(
        selectedAction.action === "approve" ? "承認しました" : "却下しました"
      );
      setSelectedAction(null);
      setFeedback("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "処理に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">承認待ち</TabsTrigger>
          <TabsTrigger value="approved">承認済み</TabsTrigger>
          <TabsTrigger value="rejected">却下</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {submissions
            .filter((s) => s.status === "pending")
            .map((submission) => (
              <div key={submission.id} className="flex gap-4">
                <div className="flex-1">
                  <SubmissionCard submission={submission} />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() =>
                      setSelectedAction({ id: submission.id, action: "approve" })
                    }
                    variant="default"
                  >
                    承認
                  </Button>
                  <Button
                    onClick={() =>
                      setSelectedAction({ id: submission.id, action: "reject" })
                    }
                    variant="destructive"
                  >
                    却下
                  </Button>
                </div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {submissions
            .filter((s) => s.status === "approved")
            .map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {submissions
            .filter((s) => s.status === "rejected")
            .map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedAction}
        onOpenChange={() => {
          setSelectedAction(null);
          setFeedback("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction?.action === "approve" ? "単語の承認" : "単語の却下"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="フィードバックを入力（任意）"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAction(null)}>
              キャンセル
            </Button>
            <Button onClick={handleAction} disabled={isLoading}>
              {isLoading ? "処理中..." : "確定"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}