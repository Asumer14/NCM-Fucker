"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Music } from "lucide-react"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "首页", href: "/" },
    { name: "转换工具", href: "/convert" },
    { name: "联系我们", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-6 w-6 text-slate-900 dark:text-white" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">MusicConverter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-slate-900 dark:hover:text-white ${
                  pathname === item.href ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="outline">
              <Link href="/convert">开始转换</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors ${
                      pathname === item.href ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <span className="text-sm text-slate-600 dark:text-slate-400">切换主题</span>
                </div>
                <Button asChild className="mt-4">
                  <Link href="/convert" onClick={() => setIsOpen(false)}>
                    开始转换
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
