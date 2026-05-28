import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>E-postanızı kontrol edin</CardTitle>
          <CardDescription>
            Giriş linkiniz e-posta adresinize gönderildi. Linke tıklayarak giriş yapabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline">Ana sayfaya dön</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
