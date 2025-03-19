"use client";

import { ReportData } from "@/types/pdf-report";
import {
  Document,
  Font,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { useEffect, useState } from "react";
import { IncorrectWordsSection } from "./pdf-sections/incorrect-words-section";
import { LearningTipsSection } from "./pdf-sections/learning-tips-section";
import { StatisticsSection } from "./pdf-sections/statistics-section";

interface PDFDownloadButtonProps {
  reportData: ReportData;
}

// フォントの登録
Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: "../../../fonts/NotoSansJP-Regular.ttf",
    },
    {
      src: "../../../fonts/NotoSansJP-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

// 基本的なスタイルの定義
const styles = StyleSheet.create<Record<string, Style>>({
  page: {
    fontFamily: "NotoSansJP",
    padding: 40,
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: "#64748b",
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
  datetime: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
});

// PDFドキュメントコンポーネント
const PDFDocument = ({ reportData }: { reportData: ReportData }) => {
  const dateTime = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{reportData.formattedDate}の学習記録</Text>
        <Text style={styles.datetime}>{dateTime}</Text>

        {/* 統計セクション */}
        <StatisticsSection statistics={reportData.statistics} />

        {/* 間違えた単語セクション */}
        <IncorrectWordsSection incorrectWords={reportData.incorrectWords} />

        {/* 学習アドバイスセクション */}
        <LearningTipsSection tips={reportData.tips} />

        {/* ページ番号 */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
};

export default function PDFDownloadButton({
  reportData,
}: PDFDownloadButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="mt-4 sm:mt-6">
      <PDFDownloadLink
        document={<PDFDocument reportData={reportData} />}
        fileName={`learning-report-${reportData.date}.pdf`}
        className="block w-full bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded hover:bg-blue-700 transition-colors text-center text-sm sm:text-base"
      >
        {({ loading }) => (loading ? "PDFを生成中..." : "PDFで出力")}
      </PDFDownloadLink>
    </div>
  );
}
