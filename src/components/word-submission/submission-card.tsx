import { UserSubmittedWord } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { SubmissionStatus } from "./submission-status";

interface SubmissionCardProps {
  submission: UserSubmittedWord;
  showFeedback?: boolean;
}

export function SubmissionCard({ submission, showFeedback = true }: SubmissionCardProps) {
  return (
    <Card className="p-4 space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{submission.word}</h3>
        <SubmissionStatus status={submission.status} />
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-600">意味:</p>
        <p>{submission.meanings}</p>
      </div>

      {submission.part_of_speech && (
        <div className="space-y-1">
          <p className="text-sm text-gray-600">品詞:</p>
          <p>{submission.part_of_speech}</p>
        </div>
      )}

      {submission.ex && (
        <div className="space-y-1">
          <p className="text-sm text-gray-600">例文:</p>
          <p>{submission.ex}</p>
        </div>
      )}

      {showFeedback && submission.admin_feedback && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">管理者からのフィードバック:</p>
          <p className="text-sm mt-1">{submission.admin_feedback}</p>
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        投稿日時: {new Date(submission.submitted_at).toLocaleString("ja-JP")}
      </div>
    </Card>
  );
}