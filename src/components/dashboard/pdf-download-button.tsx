"use client";

import {
  Document,
  Font,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { useEffect, useState } from "react";

interface IncorrectWord {
  english: string;
  japanese: string;
  timestamp: Date;
}

interface PDFDownloadButtonProps {
  incorrectWords: IncorrectWord[];
  formattedDate: string;
  date: string;
}

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

// スタイルの定義
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
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#666666",
    borderBottomStyle: "solid",
  },
  tableContainer: {
    marginTop: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: "#ffffff",
    padding: 12,
    fontSize: 14,
    width: "50%",
    borderRightWidth: 1,
    borderRightColor: "#1e40af",
    borderRightStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  tableCell: {
    padding: 12,
    fontSize: 12,
    width: "50%",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    borderRightStyle: "solid",
  },
  japaneseText: {
    color: "#dc2626",
  },
  evenRow: {
    backgroundColor: "#f8fafc",
  },
  lastCell: {
    borderRightWidth: 0,
  },
});

// PDFドキュメントコンポーネント
const PDFDocument = ({
  incorrectWords,
  formattedDate,
}: {
  incorrectWords: IncorrectWord[];
  formattedDate: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{formattedDate}の学習記録</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <View style={styles.tableHeaderCell}>
            <Text>English</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.lastCell]}>
            <Text>日本語訳</Text>
          </View>
        </View>
        {incorrectWords.map((word, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index === incorrectWords.length - 1
                ? { borderBottomWidth: 0 }
                : {},
            ]}
          >
            <View style={styles.tableCell}>
              <Text>{word.english}</Text>
            </View>
            <View style={[styles.tableCell, styles.lastCell]}>
              <Text style={styles.japaneseText}>{word.japanese}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function PDFDownloadButton({
  incorrectWords,
  formattedDate,
  date,
}: PDFDownloadButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="mt-6">
      <PDFDownloadLink
        document={
          <PDFDocument
            incorrectWords={incorrectWords}
            formattedDate={formattedDate}
          />
        }
        fileName={`incorrect-words-${date}.pdf`}
        className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center"
      >
        {({ loading }) => (loading ? "PDFを生成中..." : "PDFで出力")}
      </PDFDownloadLink>
    </div>
  );
}
