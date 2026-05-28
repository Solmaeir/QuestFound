"use client";

import Link from "next/link";
import { Bookmark, Menu, Moon, Sun, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-6 w-6 text-primary" />
          <span>QuestFound</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/">
            <Button variant="ghost" size="sm">Yarışmalar</Button>
          </Link>
          <Link href="/saved">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4 mr-1" />
              İzleme Listem
            </Button>
          </Link>
          <Link href="/submit">
            <Button variant="ghost" size="sm">Yarışma Ekle</Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Tema değiştir"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button className="hidden md:inline-flex" asChild size="sm">
            <Link href="/auth/signin">Giriş Yap</Link>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 flex flex-col gap-1">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Yarışmalar</Button>
          </Link>
          <Link href="/saved" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">İzleme Listem</Button>
          </Link>
          <Link href="/submit" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Yarışma Ekle</Button>
          </Link>
          <Link href="/auth/signin" onClick={() => setMenuOpen(false)}>
            <Button className="w-full">Giriş Yap</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
