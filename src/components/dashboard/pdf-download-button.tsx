"use client";

import { ReportData, ReportTemplate } from "@/types/pdf-report";
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
  template?: ReportTemplate;
}

const defaultTemplate: ReportTemplate = {
  layout: "detailed",
  colorScheme: "light",
  sections: [
    { id: "header", title: "ヘッダー", enabled: true, order: 0 },
    { id: "statistics", title: "学習統計", enabled: true, order: 1 },
    { id: "incorrectWords", title: "間違えた単語", enabled: true, order: 2 },
    { id: "learningTips", title: "学習アドバイス", enabled: true, order: 3 },
  ],
};

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

type ColorSchemeStyles = {
  page: {
    backgroundColor: string;
    color: string;
  };
  primary: string;
  secondary: string;
};

const getColorSchemeStyles = (
  colorScheme: ReportTemplate["colorScheme"],
  customColors?: ReportTemplate["customColors"]
): ColorSchemeStyles => {
  switch (colorScheme) {
    case "dark":
      return {
        page: { backgroundColor: "#1a1a1a", color: "#ffffff" },
        primary: "#60a5fa",
        secondary: "#9ca3af",
      };
    case "custom":
      if (!customColors) {
        return getColorSchemeStyles("light");
      }
      return {
        page: {
          backgroundColor: customColors.background,
          color: customColors.text,
        },
        primary: customColors.primary,
        secondary: customColors.secondary,
      };
    default:
      return {
        page: { backgroundColor: "#ffffff", color: "#000000" },
        primary: "#2563eb",
        secondary: "#64748b",
      };
  }
};

const styles = StyleSheet.create<Record<string, Style>>({
  page: {
    fontFamily: "NotoSansJP",
    padding: 40,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
  },
});

// PDFドキュメントコンポーネント
const PDFDocument = ({
  reportData,
  template = defaultTemplate,
}: {
  reportData: ReportData;
  template?: ReportTemplate;
}) => {
  const colorScheme = getColorSchemeStyles(
    template.colorScheme,
    template.customColors
  );
  const pageStyles = {
    ...styles.page,
    ...colorScheme.page,
  };

  const enabledSections = template.sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <Document>
      <Page size="A4" style={pageStyles}>
        {enabledSections.map((section) => {
          switch (section.id) {
            case "header":
              return (
                <Text
                  key={section.id}
                  style={{
                    ...styles.header,
                    borderBottomColor: colorScheme.secondary,
                    color: colorScheme.page.color,
                  }}
                >
                  {reportData.formattedDate}の学習記録
                </Text>
              );
            case "statistics":
              return (
                <StatisticsSection
                  key={section.id}
                  statistics={reportData.statistics}
                />
              );
            case "incorrectWords":
              return (
                <IncorrectWordsSection
                  key={section.id}
                  incorrectWords={reportData.incorrectWords}
                />
              );
            case "learningTips":
              return (
                <LearningTipsSection key={section.id} tips={reportData.tips} />
              );
            default:
              return null;
          }
        })}
      </Page>
    </Document>
  );
};

export default function PDFDownloadButton({
  reportData,
  template = defaultTemplate,
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
        document={<PDFDocument reportData={reportData} template={template} />}
        fileName={`learning-report-${reportData.date}.pdf`}
        className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center"
      >
        {({ loading }) => (loading ? "PDFを生成中..." : "PDFで出力")}
      </PDFDownloadLink>
    </div>
  );
}
