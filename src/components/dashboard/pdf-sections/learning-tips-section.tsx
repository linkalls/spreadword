import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { ReportData } from "@/types/pdf-report";

interface LearningTipsSectionProps {
  tips?: ReportData["tips"];
}

const styles = StyleSheet.create<Record<string, Style>>({
  section: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: "#2563eb",
  },
  tipsContainer: {
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: "#64748b",
    borderStyle: "solid",
    marginTop: 10,
  },
  tip: {
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 8,
  },
  tipNumber: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  noTips: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});

export function LearningTipsSection({
  tips,
}: LearningTipsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>学習アドバイス</Text>
      <View style={styles.tipsContainer}>
        {!tips || tips.length === 0 ? (
          <Text style={styles.noTips}>
            このセッションのアドバイスはありません。
          </Text>
        ) : (
          tips.map((tip, index) => (
            <Text key={index} style={styles.tip}>
              <Text style={styles.tipNumber}>{index + 1}. </Text>
              {tip}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}
