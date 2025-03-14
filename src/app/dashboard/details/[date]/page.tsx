import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PDFDownloadButton from "@/components/dashboard/pdf-download-button";

interface IncorrectWord {
  english: string;
  japanese: string;
  timestamp: Date;
}

async function getIncorrectWords(date: string, userId: string): Promise<IncorrectWord[]> {
  const { getIncorrectWordsByDate } = await import("@/db/actions/dashboard");
  return getIncorrectWordsByDate(userId, date);
}

export default async function DetailsPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  // paramsを直接使用せず、分割代入した値を使用
  const incorrectWords = await getIncorrectWords(date, session.user.id);

  const formattedDate = new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        {formattedDate}の学習詳細
        <span className="text-lg text-gray-500">Learning Details</span>
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          間違えた単語
          <span className="text-sm text-gray-500">Incorrect Words</span>
        </h2>

        {incorrectWords.length > 0 ? (
          <>
            <div className="space-y-4">
              {incorrectWords.map((word, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{word.english}</p>
                    <p className="text-sm text-gray-500">{word.japanese}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(word.timestamp).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>

            <PDFDownloadButton
              incorrectWords={incorrectWords}
              formattedDate={formattedDate}
              date={date}
            />
          </>
        ) : (
          <p className="text-gray-500">間違えた単語はありません。</p>
        )}
      </div>
    </div>
  );
}
