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
import { ReportTemplate } from "@/types/pdf-report";
import { useState } from "react";

interface PDFTemplateDialogProps {
  template: ReportTemplate;
  onTemplateChange: (newTemplate: ReportTemplate) => void;
}

export function PDFTemplateDialog({
  template,
  onTemplateChange,
}: PDFTemplateDialogProps) {
  const [localTemplate, setLocalTemplate] = useState(template);
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

          <Button onClick={handleSave} className="w-full">
            設定を保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
