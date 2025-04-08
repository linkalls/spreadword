"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const submitFormSchema = z.object({
  word: z.string().min(1, "単語を入力してください"),
  meanings: z.string().min(1, "意味を入力してください"),
  part_of_speech: z.string().optional(),
  ex: z.string().optional(),
  choices: z.array(z.string()).optional(),
});

type SubmitFormValues = z.infer<typeof submitFormSchema>;

interface SubmitWordFormProps {
  onSuccess?: () => void;
}

export function SubmitWordForm({ onSuccess }: SubmitWordFormProps) {
  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(submitFormSchema),
    defaultValues: {
      word: "",
      meanings: "",
      part_of_speech: "",
      ex: "",
      choices: [],
    },
  });

  async function onSubmit(data: SubmitFormValues) {
    try {
      const response = await fetch("/api/words/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "単語の投稿に失敗しました");
      }

      toast.success("単語を投稿しました。承認までしばらくお待ちください。");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "単語の投稿に失敗しました"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button
            type="button"
            variant="outline"
            disabled={!form.getValues("word")}
            onClick={async () => {
              try {
                const word = form.getValues("word");
                if (!word) {
                  toast.error("単語を入力してください");
                  return;
                }

                const response = await fetch("/api/words/generate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ word }),
                });
                
                if (!response.ok) throw new Error("単語の生成に失敗しました");
                
                const { word: generatedWord } = await response.json();
                form.setValue("word", generatedWord.word);
                form.setValue("meanings", generatedWord.meanings);
                form.setValue("part_of_speech", generatedWord.part_of_speech || "");
                form.setValue("ex", generatedWord.ex || "");
                form.setValue("choices", generatedWord.choices || []);
                
                toast.success("単語を生成しました");
              } catch {
                toast.error("単語の生成に失敗しました");
              }
            }}
          >
            AIで意味を生成
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="word"
          render={({ field }) => (
            <FormItem>
              <FormLabel>単語 *</FormLabel>
              <FormControl>
                <Input placeholder="例: example" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meanings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>意味 *</FormLabel>
              <FormControl>
                <Textarea placeholder="例: 例、見本、実例" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="part_of_speech"
          render={({ field }) => (
            <FormItem>
              <FormLabel>品詞</FormLabel>
              <FormControl>
                <Input placeholder="例: 名詞" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>例文</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="例: This is an example sentence."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          投稿する
        </Button>
      </form>
    </Form>
  );
}
