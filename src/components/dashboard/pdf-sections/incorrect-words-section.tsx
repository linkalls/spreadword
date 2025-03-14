import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { ReportData } from "@/types/pdf-report";

interface IncorrectWordsSectionProps {
  incorrectWords: ReportData["incorrectWords"];
}

const styles = StyleSheet.create<Record<string, Style>>({
  section: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: "#1e40af",
  },
  tableContainer: {
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
    width: "33.33%",
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
    width: "33.33%",
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
  emptyState: {
    padding: 20,
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },
});

export function IncorrectWordsSection({ incorrectWords }: IncorrectWordsSectionProps) {
  if (incorrectWords.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>間違えた単語</Text>
        <View style={styles.tableContainer}>
          <Text style={styles.emptyState}>
            このセッションでは間違えた単語はありませんでした。
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>間違えた単語</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <View style={styles.tableHeaderCell}>
            <Text>English</Text>
          </View>
          <View style={styles.tableHeaderCell}>
            <Text>日本語訳</Text>
          </View>
          <View style={[styles.tableHeaderCell, styles.lastCell]}>
            <Text>時刻</Text>
          </View>
        </View>
        {incorrectWords.map((word, index) => (
          <View
            key={index}
            style={{
              ...styles.tableRow,
              ...(index % 2 === 1 ? styles.evenRow : {}),
              ...(index === incorrectWords.length - 1 ? { borderBottomWidth: 0 } : {}),
            }}
          >
            <View style={styles.tableCell}>
              <Text>{word.english}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.japaneseText}>{word.japanese}</Text>
            </View>
            <View style={[styles.tableCell, styles.lastCell]}>
              <Text>
                {word.timestamp.toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
