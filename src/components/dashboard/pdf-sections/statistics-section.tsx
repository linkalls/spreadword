import type { LearningStatistics } from "@/types/pdf-report";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

interface StatisticsSectionProps {
  statistics: LearningStatistics;
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
  statsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "48%",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "bold",
  },
  statUnit: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  mistakesList: {
    marginTop: 10,
  },
  mistakeItem: {
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 8,
  },
});

export function StatisticsSection({
  statistics,
}: StatisticsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>学習統計</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>学習済み単語数</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.statValue}>{statistics.totalWordsLearned}</Text>
            <Text style={styles.statUnit}>単語</Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>正答率</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.statValue}>
              {(statistics.correctAnswerRate * 100).toFixed(1)}
            </Text>
            <Text style={styles.statUnit}>%</Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>連続学習日数</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.statValue}>{statistics.dailyStreak}</Text>
            <Text style={styles.statUnit}>日</Text>
          </View>
        </View>
      </View>

      {/* よく間違える単語リスト */}
      <View style={[styles.statBox, { width: "100%", marginTop: 10 }]}>
        <Text style={styles.statLabel}>よく間違える単語</Text>
        <View style={styles.mistakesList}>
          {statistics.mostMistakenWords.map((word, index) => (
            <Text key={index} style={styles.mistakeItem}>
              {word.word} ({word.meaning}) - {word.mistakeCount}回間違えています
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
