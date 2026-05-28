"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/use-toast";
import { CheckCircle } from "lucide-react";

const CATEGORIES = [
  { value: "TUBITAK", label: "TÜBİTAK" },
  { value: "HACKATHON", label: "Hackathon" },
  { value: "STARTUP", label: "Startup" },
  { value: "AI_ML", label: "Yapay Zeka / ML" },
  { value: "DESIGN", label: "Tasarım" },
  { value: "OTHER", label: "Diğer" },
];

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          organization: data.organization,
          description: data.description,
          category: data.category,
          reward: data.reward || null,
          currency: data.currency || "TRY",
          deadline: data.deadline ? new Date(data.deadline as string).toISOString() : null,
          applicationUrl: data.applicationUrl || null,
          sourceUrl: data.sourceUrl,
          country: data.country || "International",
          tags: [],
        }),
      });

      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      toast({ title: "Hata", description: "Form gönderilemedi, tekrar deneyin.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Teşekkürler!</h1>
        <p className="text-muted-foreground">
          Yarışma bilgileriniz alındı. Ekibimiz inceledikten sonra platforma eklenecektir.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">Yeni Ekle</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yarışma Ekle</h1>
        <p className="text-muted-foreground mt-1">
          Bildiğiniz bir yarışma veya hibe programını topluluğumuzla paylaşın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yarışma Bilgileri</CardTitle>
          <CardDescription>Gönderilen yarışmalar admin onayından sonra yayınlanır.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Yarışma Adı *</label>
              <Input name="title" required placeholder="ör. TÜBİTAK 2209-A" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Organizasyon *</label>
              <Input name="organization" required placeholder="ör. TÜBİTAK" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori *</label>
              <select name="category" required className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Açıklama *</label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Yarışma hakkında kısa bir açıklama..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ödül Miktarı</label>
                <Input name="reward" placeholder="ör. 50.000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Para Birimi</label>
                <select name="currency" className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Son Başvuru Tarihi</label>
              <Input name="deadline" type="date" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Başvuru Linki</label>
              <Input name="applicationUrl" type="url" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kaynak Link *</label>
              <Input name="sourceUrl" type="url" required placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ülke</label>
              <Input name="country" placeholder="ör. Turkey" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Yarışmayı Gönder"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
