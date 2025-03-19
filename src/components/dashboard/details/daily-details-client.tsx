"use client";

import PDFDownloadButton from "@/components/dashboard/pdf-download-button";
import { ReportData } from "@/types/pdf-report";
// import { PDFTemplateDialog } from "@/components/dashboard/pdf-template-dialog";
import { MistakeWordsStory } from "@/components/dashboard/mistake-words-story";

interface DailyDetailsClientProps {
  reportData: ReportData;
  mistakeWords: Array<{
    word: string;
    meanings: string | string[];
    mistakeCount: number | null;
  }>;
  formattedDate: string;
}

// const defaultTemplate: ReportTemplate = {
//   layout: "detailed",
//   colorScheme: "light",
//   sections: [
//     { id: "header", title: "ヘッダー", enabled: true, order: 0 },
//     { id: "statistics", title: "学習統計", enabled: true, order: 1 },
//     { id: "incorrectWords", title: "間違えた単語", enabled: true, order: 2 },
//     { id: "learningTips", title: "学習アドバイス", enabled: true, order: 3 },
//   ],
// };
interface MistakeWord {
  word: string;
  meanings: string;
  mistakeCount: number | null;
}

export function DailyDetailsClient({
  reportData,
  mistakeWords,
  formattedDate,
}: DailyDetailsClientProps) {
  const formattedMistakeWords: MistakeWord[] = mistakeWords.map((word) => ({
    word: word.word,
    meanings: Array.isArray(word.meanings)
      ? word.meanings.join("、")
      : word.meanings,
    mistakeCount: word.mistakeCount,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{formattedDate} の学習記録</h1>
      <MistakeWordsStory words={formattedMistakeWords} />
      <div className="mt-8 space-y-4">
        {/* <PDFTemplateDialog template={template} onTemplateChange={setTemplate} /> */}
        <PDFDownloadButton reportData={reportData} />
      </div>
    </div>
  );
}
