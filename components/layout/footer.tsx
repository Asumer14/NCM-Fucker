import Link from "next/link"
import { Music, Mail, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Music className="h-6 w-6" />
              <span className="text-xl font-bold">MusicConverter</span>
            </Link>
            <p className="text-slate-400 text-sm">专业的音乐格式转换工具，让音乐格式转换变得简单高效。</p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">产品</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/convert" className="hover:text-white transition-colors">
                  在线转换
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  API服务
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  企业版
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">支持</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  使用帮助
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  常见问题
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">法律</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  服务条款
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  版权声明
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} MusicConverter. 保留所有权利。</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
              <Mail className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
