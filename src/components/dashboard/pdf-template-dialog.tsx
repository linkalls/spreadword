"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ReportTemplate } from "@/types/pdf-report";
import { useState } from "react";

interface PDFTemplateDialogProps {
  template: ReportTemplate;
  onTemplateChange: (newTemplate: ReportTemplate) => void;
}

const defaultFontSizes = {
  title: 24,
  heading: 18,
  subheading: 16,
  body: 14,
};

const defaultMargins = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

const defaultSpacing = {
  betweenSections: 20,
  betweenElements: 10,
  paragraphSpacing: 8,
};

const defaultChartStyle = {
  showLegend: true,
  showGrid: true,
  barColor: "#2563eb",
  lineColor: "#64748b",
  legendPosition: "bottom" as const,
};

const defaultHeaderFooter = {
  showHeader: true,
  showFooter: true,
  headerText: "",
  footerText: "",
  includePageNumber: true,
  includeDatetime: true,
};

export function PDFTemplateDialog({
  template,
  onTemplateChange,
}: PDFTemplateDialogProps) {
  const [localTemplate, setLocalTemplate] = useState({
    ...template,
    fontSizes: template.fontSizes || defaultFontSizes,
    margins: template.margins || defaultMargins,
    spacing: template.spacing || defaultSpacing,
    chartStyle: template.chartStyle || defaultChartStyle,
    headerFooter: template.headerFooter || defaultHeaderFooter,
  });
  const [open, setOpen] = useState(false);

  // セクションの並び替え
  const handleSectionOrderChange = (sectionId: string, newOrder: number) => {
    const updatedSections = localTemplate.sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, order: newOrder };
      }
      return section;
    });

    setLocalTemplate({
      ...localTemplate,
      sections: updatedSections.sort((a, b) => a.order - b.order),
    });
  };

  // セクションの表示/非表示切り替え
  const handleSectionToggle = (sectionId: string) => {
    const updatedSections = localTemplate.sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, enabled: !section.enabled };
      }
      return section;
    });

    setLocalTemplate({
      ...localTemplate,
      sections: updatedSections,
    });
  };

  // カラースキームの変更
  const handleColorSchemeChange = (scheme: ReportTemplate["colorScheme"]) => {
    setLocalTemplate({
      ...localTemplate,
      colorScheme: scheme,
    });
  };

  // カスタムカラーの変更
  const handleCustomColorChange = (
    colorType: keyof NonNullable<ReportTemplate["customColors"]>,
    value: string
  ) => {
    setLocalTemplate({
      ...localTemplate,
      customColors: {
        ...localTemplate.customColors!,
        [colorType]: value,
      },
    });
  };

  // 設定を保存
  const handleSave = () => {
    onTemplateChange(localTemplate);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mb-4">
          PDFテンプレートをカスタマイズ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>PDFレポートのカスタマイズ</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* セクション設定 */}
          <div className="space-y-4">
            <h3 className="font-semibold">セクションの設定</h3>
            {localTemplate.sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <Label>{section.title}</Label>
                </div>
                <Input
                  type="number"
                  value={section.order}
                  onChange={(e) =>
                    handleSectionOrderChange(section.id, parseInt(e.target.value))
                  }
                  min={0}
                  max={localTemplate.sections.length - 1}
                  className="w-20"
                />
              </div>
            ))}
          </div>

          {/* カラースキーム設定 */}
          <div className="space-y-4">
            <h3 className="font-semibold">カラースキーム</h3>
            <div className="flex space-x-4">
              <Button
                variant={localTemplate.colorScheme === "light" ? "default" : "outline"}
                onClick={() => handleColorSchemeChange("light")}
              >
                ライト
              </Button>
              <Button
                variant={localTemplate.colorScheme === "dark" ? "default" : "outline"}
                onClick={() => handleColorSchemeChange("dark")}
              >
                ダーク
              </Button>
              <Button
                variant={localTemplate.colorScheme === "custom" ? "default" : "outline"}
                onClick={() => handleColorSchemeChange("custom")}
              >
                カスタム
              </Button>
            </div>

            {/* カスタムカラー設定 */}
            {localTemplate.colorScheme === "custom" && (
              <div className="space-y-4">
                <div>
                  <Label>背景色</Label>
                  <Input
                    type="color"
                    value={localTemplate.customColors?.background ?? "#ffffff"}
                    onChange={(e) =>
                      handleCustomColorChange("background", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>テキスト色</Label>
                  <Input
                    type="color"
                    value={localTemplate.customColors?.text ?? "#000000"}
                    onChange={(e) =>
                      handleCustomColorChange("text", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>プライマリーカラー</Label>
                  <Input
                    type="color"
                    value={localTemplate.customColors?.primary ?? "#2563eb"}
                    onChange={(e) =>
                      handleCustomColorChange("primary", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>セカンダリーカラー</Label>
                  <Input
                    type="color"
                    value={localTemplate.customColors?.secondary ?? "#64748b"}
                    onChange={(e) =>
                      handleCustomColorChange("secondary", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* 追加設定セクション */}
          <Accordion type="single" collapsible className="w-full space-y-2">
            {/* フォントサイズ設定 */}
            <AccordionItem value="font-sizes">
              <AccordionTrigger>フォントサイズ設定</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>タイトル (px)</Label>
                      <Input
                        type="number"
                        value={localTemplate.fontSizes.title}
                        onChange={(e) =>
                          setLocalTemplate({
                            ...localTemplate,
                            fontSizes: {
                              ...localTemplate.fontSizes,
                              title: Number(e.target.value),
                            },
                          })
                        }
                        min={12}
                        max={48}
                      />
                    </div>
                    <div>
                      <Label>見出し (px)</Label>
                      <Input
                        type="number"
                        value={localTemplate.fontSizes.heading}
                        onChange={(e) =>
                          setLocalTemplate({
                            ...localTemplate,
                            fontSizes: {
                              ...localTemplate.fontSizes,
                              heading: Number(e.target.value),
                            },
                          })
                        }
                        min={12}
                        max={36}
                      />
                    </div>
                    <div>
                      <Label>小見出し (px)</Label>
                      <Input
                        type="number"
                        value={localTemplate.fontSizes.subheading}
                        onChange={(e) =>
                          setLocalTemplate({
                            ...localTemplate,
                            fontSizes: {
                              ...localTemplate.fontSizes,
                              subheading: Number(e.target.value),
                            },
                          })
                        }
                        min={10}
                        max={24}
                      />
                    </div>
                    <div>
                      <Label>本文 (px)</Label>
                      <Input
                        type="number"
                        value={localTemplate.fontSizes.body}
                        onChange={(e) =>
                          setLocalTemplate({
                            ...localTemplate,
                            fontSizes: {
                              ...localTemplate.fontSizes,
                              body: Number(e.target.value),
                            },
                          })
                        }
                        min={8}
                        max={20}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* マージン設定 */}
            <AccordionItem value="margins">
              <AccordionTrigger>マージン設定</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>上部マージン (mm)</Label>
                    <Input
                      type="number"
                      value={localTemplate.margins.top}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          margins: {
                            ...localTemplate.margins,
                            top: Number(e.target.value),
                          },
                        })
                      }
                      min={0}
                      max={50}
                    />
                  </div>
                  <div>
                    <Label>右マージン (mm)</Label>
                    <Input
                      type="number"
                      value={localTemplate.margins.right}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          margins: {
                            ...localTemplate.margins,
                            right: Number(e.target.value),
                          },
                        })
                      }
                      min={0}
                      max={50}
                    />
                  </div>
                  <div>
                    <Label>下部マージン (mm)</Label>
                    <Input
                      type="number"
                      value={localTemplate.margins.bottom}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          margins: {
                            ...localTemplate.margins,
                            bottom: Number(e.target.value),
                          },
                        })
                      }
                      min={0}
                      max={50}
                    />
                  </div>
                  <div>
                    <Label>左マージン (mm)</Label>
                    <Input
                      type="number"
                      value={localTemplate.margins.left}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          margins: {
                            ...localTemplate.margins,
                            left: Number(e.target.value),
                          },
                        })
                      }
                      min={0}
                      max={50}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* グラフスタイル設定 */}
            <AccordionItem value="chart-style">
              <AccordionTrigger>グラフスタイル設定</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={localTemplate.chartStyle.showLegend}
                      onCheckedChange={(checked) =>
                        setLocalTemplate({
                          ...localTemplate,
                          chartStyle: {
                            ...localTemplate.chartStyle,
                            showLegend: checked,
                          },
                        })
                      }
                    />
                    <Label>凡例を表示</Label>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={localTemplate.chartStyle.showGrid}
                      onCheckedChange={(checked) =>
                        setLocalTemplate({
                          ...localTemplate,
                          chartStyle: {
                            ...localTemplate.chartStyle,
                            showGrid: checked,
                          },
                        })
                      }
                    />
                    <Label>グリッドを表示</Label>
                  </div>
                  <div>
                    <Label>棒グラフの色</Label>
                    <Input
                      type="color"
                      value={localTemplate.chartStyle.barColor}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          chartStyle: {
                            ...localTemplate.chartStyle,
                            barColor: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>線グラフの色</Label>
                    <Input
                      type="color"
                      value={localTemplate.chartStyle.lineColor}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          chartStyle: {
                            ...localTemplate.chartStyle,
                            lineColor: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>凡例の位置</Label>
                    <Select
                      value={localTemplate.chartStyle.legendPosition}
                      onValueChange={(value: "top" | "bottom" | "left" | "right") =>
                        setLocalTemplate({
                          ...localTemplate,
                          chartStyle: {
                            ...localTemplate.chartStyle,
                            legendPosition: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">上部</SelectItem>
                        <SelectItem value="bottom">下部</SelectItem>
                        <SelectItem value="left">左側</SelectItem>
                        <SelectItem value="right">右側</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* スペーシング設定 */}
            <AccordionItem value="spacing">
              <AccordionTrigger>スペーシング設定</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <Label>セクション間のスペース (mm)</Label>
                    <Input
                      type="number"
                      value={localTemplate.spacing.betweenSections}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          spacing: {
                            ...localTemplate.spacing,
                            betweenSections: Number(e.target.value),
                          },
                        })
                      }
                      min={0}
                      max={50}
                    />
                  </div>
                  <div>
                    <Label>要素間のスペース (mm)</Label>
                    <Input
                      type="number"
                      value={localTemplate.spacing.betweenElements}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          spacing: {
                            ...localTemplate.spacing,
                            betweenElements: Number(e.target.value),
                          },
                        })
                      }
                      min={0}
                      max={30}
                    />
                  </div>
                  <div>
                    <Label>段落間のスペース (mm)</Label>
                    <Input
                      type="number"
                      value={localTemplate.spacing.paragraphSpacing}
                      onChange={(e) =>
                        setLocalTemplate({
                          ...localTemplate,
                          spacing: {
                            ...localTemplate.spacing,
                            paragraphSpacing: Number(e.target.value),
                          },
                        })
                      }
                      min={0}
                      max={20}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ヘッダー・フッター設定 */}
            <AccordionItem value="header-footer">
              <AccordionTrigger>ヘッダー・フッター設定</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={localTemplate.headerFooter.showHeader}
                      onCheckedChange={(checked) =>
                        setLocalTemplate({
                          ...localTemplate,
                          headerFooter: {
                            ...localTemplate.headerFooter,
                            showHeader: checked,
                          },
                        })
                      }
                    />
                    <Label>ヘッダーを表示</Label>
                  </div>
                  {localTemplate.headerFooter.showHeader && (
                    <div>
                      <Label>ヘッダーテキスト</Label>
                      <Input
                        value={localTemplate.headerFooter.headerText}
                        onChange={(e) =>
                          setLocalTemplate({
                            ...localTemplate,
                            headerFooter: {
                              ...localTemplate.headerFooter,
                              headerText: e.target.value,
                            },
                          })
                        }
                        placeholder="ヘッダーテキストを入力"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={localTemplate.headerFooter.showFooter}
                      onCheckedChange={(checked) =>
                        setLocalTemplate({
                          ...localTemplate,
                          headerFooter: {
                            ...localTemplate.headerFooter,
                            showFooter: checked,
                          },
                        })
                      }
                    />
                    <Label>フッターを表示</Label>
                  </div>
                  {localTemplate.headerFooter.showFooter && (
                    <div>
                      <Label>フッターテキスト</Label>
                      <Input
                        value={localTemplate.headerFooter.footerText}
                        onChange={(e) =>
                          setLocalTemplate({
                            ...localTemplate,
                            headerFooter: {
                              ...localTemplate.headerFooter,
                              footerText: e.target.value,
                            },
                          })
                        }
                        placeholder="フッターテキストを入力"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={localTemplate.headerFooter.includePageNumber}
                      onCheckedChange={(checked) =>
                        setLocalTemplate({
                          ...localTemplate,
                          headerFooter: {
                            ...localTemplate.headerFooter,
                            includePageNumber: checked,
                          },
                        })
                      }
                    />
                    <Label>ページ番号を表示</Label>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={localTemplate.headerFooter.includeDatetime}
                      onCheckedChange={(checked) =>
                        setLocalTemplate({
                          ...localTemplate,
                          headerFooter: {
                            ...localTemplate.headerFooter,
                            includeDatetime: checked,
                          },
                        })
                      }
                    />
                    <Label>日時を表示</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button onClick={handleSave} className="w-full mt-6">
            設定を保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
