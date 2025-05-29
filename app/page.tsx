import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Upload, Download, Zap, Shield, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                  音乐格式
                  <span className="block text-slate-600 dark:text-slate-300">无损转换</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg">
                  专业的NCM音乐格式转换工具，支持转换为MP3和FLAC格式，保持音质完美，操作简单快捷。
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Link href="/convert">
                    开始转换 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/contact">了解更多</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10,000+ 用户信赖</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>100% 安全</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Upload className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    <span className="text-slate-700 dark:text-slate-200">music.ncm</span>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300">MP3</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-700 dark:text-blue-300">FLAC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">为什么选择我们？</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              专业的技术团队，为您提供最优质的音乐格式转换服务
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">极速转换</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  采用先进的转换算法，几秒钟内完成格式转换，节省您的宝贵时间。
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">隐私保护</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  所有文件处理均在本地完成，不会上传到服务器，确保您的音乐文件安全。
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">无损质量</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  支持FLAC无损格式输出，保持原始音质，让您享受最佳的音乐体验。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">使用步骤</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">三步完成音乐格式转换</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">上传文件</h3>
              <p className="text-slate-600 dark:text-slate-400">选择您需要转换的NCM格式音乐文件</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">选择格式</h3>
              <p className="text-slate-600 dark:text-slate-400">选择您需要的输出格式：MP3或FLAC</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">下载结果</h3>
              <p className="text-slate-600 dark:text-slate-400">转换完成后立即下载您的音乐文件</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">准备开始转换您的音乐文件？</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              立即体验我们的专业音乐格式转换服务，快速、安全、高质量。
            </p>
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
              <Link href="/convert">
                立即开始转换 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
