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
import { WordList } from "@/db/schema";

interface WordListPDFProps {
  list: WordList;
  words: { english: string; japanese: string }[];
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
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: "#64748b",
  },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#e2e8f0",
  },
  english: {
    fontSize: 16,
    width: "45%",
  },
  japanese: {
    fontSize: 16,
    width: "45%",
    color: "red", // 赤シート用に赤色で表示
    textAlign: "right",
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
});

// PDFドキュメントコンポーネント
const WordListPDFDocument = ({ list, words }: WordListPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{list.name}</Text>
        
        {words.map((word, index) => (
          <View key={index} style={styles.wordContainer}>
            <Text style={styles.english}>{word.english}</Text>
            <Text style={styles.japanese}>{word.japanese}</Text>
          </View>
        ))}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
};

export default function WordListPDFButton({
  list,
  words,
}: WordListPDFProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <PDFDownloadLink
      document={<WordListPDFDocument list={list} words={words} />}
      fileName={`word-list-${list.name}.pdf`}
      className="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      {({ loading }) => (loading ? "PDFを生成中..." : "PDFで出力")}
    </PDFDownloadLink>
  );
}
