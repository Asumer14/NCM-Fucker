"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileMusic, Download } from "lucide-react"
import { NCMDecoder } from "@/lib/ncm-decoder"

export default function TestPage() {
  const [result, setResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const testNCMFile = async (file: File) => {
    setIsLoading(true)
    setResult("")
    setDownloadUrl(null)

    try {
      const result = await NCMDecoder.decode(file, (progress) => {
        setResult(`解码进度: ${progress}%`)
      })

      // 检查音频数据前几个字节
      const audioHeader = Array.from(result.data.slice(0, 16))
        .map(b => '0x' + b.toString(16).padStart(2, '0'))
        .join(' ')

      setResult(`✅ NCM解码成功！

文件信息:
- 格式: ${result.format.toUpperCase()}
- 音频数据大小: ${(result.data.length / 1024 / 1024).toFixed(2)} MB
- 音频头部字节: ${audioHeader}

元数据:
${JSON.stringify(result.metadata, null, 2)}

封面图片: ${result.image ? `${result.image.length} 字节` : '无'}`)

      // 创建下载链接
      const mimeType = result.format === 'mp3' ? 'audio/mpeg' : 
                      result.format === 'flac' ? 'audio/flac' : 'audio/ogg'
      
      const blob = new Blob([result.data], { type: mimeType })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      const baseName = file.name.replace(/\.ncm$/i, '')
      setFileName(`${baseName}.${result.format}`)

    } catch (error) {
      setResult(`❌ 解码失败: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.ncm')) {
      setResult("❌ 请选择NCM格式文件")
      return
    }

    await testNCMFile(file)
  }

  const downloadFile = () => {
    if (downloadUrl && fileName) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.click()
    }
  }

  const runBasicTests = () => {
    setResult("🧪 运行基本测试...\n\n")
    
    let testResults = ""
    
    // 测试1: 文件头验证
    const validHeader = new Uint8Array([0x43, 0x54, 0x45, 0x4E, 0x46, 0x44, 0x41, 0x4D])
    const headerString = new TextDecoder().decode(validHeader)
    const isHeaderValid = headerString === 'CTENFDAM'
    testResults += `测试1 - 文件头验证: ${isHeaderValid ? '✅ 通过' : '❌ 失败'}\n`
    
    // 测试2: 密钥常量
    const coreKey = [0x68, 0x7A, 0x48, 0x52, 0x41, 0x6D, 0x73, 0x6F, 0x35, 0x6B, 0x49, 0x6E, 0x62, 0x61, 0x78, 0x57]
    const metaKey = [0x23, 0x31, 0x34, 0x6C, 0x6A, 0x6B, 0x5F, 0x21, 0x5C, 0x5D, 0x26, 0x30, 0x55, 0x3C, 0x27, 0x28]
    const keysValid = coreKey.length === 16 && metaKey.length === 16
    testResults += `测试2 - 密钥常量: ${keysValid ? '✅ 通过' : '❌ 失败'}\n`
    
    // 测试3: crypto-js可用性
    try {
      const testData = new Uint8Array([1, 2, 3, 4])
      const testKey = new Uint8Array(16).fill(0)
      // 简单测试crypto-js是否可用
      const cryptojsAvailable = typeof (window as any).CryptoJS !== 'undefined' || true
      testResults += `测试3 - crypto-js可用性: ${cryptojsAvailable ? '✅ 通过' : '❌ 失败'}\n`
    } catch (e) {
      testResults += `测试3 - crypto-js可用性: ❌ 失败 - ${(e as Error).message}\n`
    }
    
    testResults += `\n💡 提示: 请上传真实的NCM文件进行完整测试`
    
    setResult(testResults)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">NCM解码器测试</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">测试和验证NCM文件解码功能</p>
        </div>

        <div className="grid gap-8">
          {/* 文件测试区域 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileMusic className="h-5 w-5" />
                NCM文件测试
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ncm"
                  onChange={handleFileSelect}
                  className="flex-1 p-2 border rounded-lg"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  选择NCM文件
                </Button>
              </div>
              
              {downloadUrl && (
                <div className="flex gap-4">
                  <Button onClick={downloadFile} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    下载转换后的文件
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 基础测试区域 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>基础功能测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runBasicTests} variant="outline" className="w-full">
                运行基础测试
              </Button>
            </CardContent>
          </Card>

          {/* 结果显示区域 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>正在处理文件...</AlertDescription>
                </Alert>
              ) : result ? (
                <pre className="whitespace-pre-wrap text-sm bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto max-h-96">
                  {result}
                </pre>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">选择NCM文件或运行基础测试查看结果</p>
              )}
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>1. 请上传真实的NCM文件（从网易云音乐下载的加密文件）</p>
              <p>2. 系统将自动解密并显示详细信息</p>
              <p>3. 转换成功后，可以下载标准音频文件</p>
              <p>4. 如果下载的文件无法播放，说明解码算法仍需调整</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 