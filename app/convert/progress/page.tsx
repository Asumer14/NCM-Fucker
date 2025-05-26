"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileMusic, Download, CheckCircle, XCircle, AlertCircle, Package, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NCMDecoder } from "@/lib/ncm-decoder"

interface ConvertFile {
  id: string
  name: string
  size: number
  file?: File
  progress?: number
  status?: "pending" | "converting" | "completed" | "failed"
  error?: string
  resultData?: ArrayBuffer
  resultFilename?: string
  resultFormat?: string
}

export default function ProgressPage() {
  const [files, setFiles] = useState<ConvertFile[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [isConverting, setIsConverting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasErrors, setHasErrors] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [failureCount, setFailureCount] = useState(0)
  const router = useRouter()
  const hasStarted = useRef(false)

  // 从localStorage获取文件信息并从IndexedDB读取File对象
  useEffect(() => {
    const loadFiles = async () => {
      const storedFiles = localStorage.getItem('convertFiles')
      if (storedFiles) {
        try {
          const parsedFiles = JSON.parse(storedFiles)
          console.log('读取到存储的文件信息:', parsedFiles.length, '个文件')
          
          // 从IndexedDB读取File对象
          const filesWithData = await loadFilesFromIndexedDB(parsedFiles)
          
          setFiles(filesWithData)
          console.log('文件加载完成:', filesWithData.length, '个文件')
        } catch (error) {
          console.error('加载文件失败:', error)
          router.push('/convert')
        }
      } else {
        console.log('未找到存储的文件数据，返回转换页面')
        router.push('/convert')
      }
    }
    
    loadFiles()
  }, [router])

  // 从IndexedDB加载文件
  const loadFilesFromIndexedDB = async (fileInfos: any[]): Promise<ConvertFile[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NCMConverter', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['files'], 'readonly')
        const store = transaction.objectStore('files')
        
        const results: ConvertFile[] = []
        let completed = 0
        
        fileInfos.forEach(fileInfo => {
          const getRequest = store.get(fileInfo.id)
          
          getRequest.onsuccess = () => {
            const result = getRequest.result
            if (result && result.file) {
              results.push({
                id: fileInfo.id,
                name: fileInfo.name,
                size: fileInfo.size,
                file: result.file,
                status: 'pending',
                progress: 0
              })
            }
            
            completed++
            if (completed === fileInfos.length) {
              resolve(results)
            }
          }
          
          getRequest.onerror = () => {
            completed++
            if (completed === fileInfos.length) {
              resolve(results)
            }
          }
        })
        
        if (fileInfos.length === 0) {
          resolve([])
        }
      }
    })
  }

  // 单个文件转换函数
  const convertSingleFile = useCallback(async (fileInfo: ConvertFile, actualFile: File) => {
    console.log(`开始转换文件: ${fileInfo.name}`)
    
    try {
      // 更新状态为转换中
      setFiles(prev => prev.map(f => 
        f.id === fileInfo.id 
          ? { ...f, status: 'converting', progress: 10, error: undefined }
          : f
      ))

      // 使用NCMDecoder解码
      console.log(`正在解码 ${fileInfo.name}...`)
      const result = await NCMDecoder.decode(actualFile)
      
      console.log(`解码成功: ${fileInfo.name}, 格式: ${result.format}, 数据大小: ${result.data.length}`)

      // 生成输出文件名
      const baseName = fileInfo.name.replace(/\.ncm$/i, '')
      const outputFilename = `${baseName}.${result.format}`

      // 更新为完成状态
      setFiles(prev => prev.map(f => 
        f.id === fileInfo.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              resultData: result.data.buffer as ArrayBuffer,
              resultFilename: outputFilename,
              resultFormat: result.format,
              error: undefined
            }
          : f
      ))

      console.log(`文件转换完成: ${outputFilename}`)
      return true

    } catch (error) {
      console.error(`转换文件 ${fileInfo.name} 失败:`, error)
      
      // 更新为失败状态
      setFiles(prev => prev.map(f => 
        f.id === fileInfo.id 
          ? { 
              ...f, 
              status: 'failed', 
              progress: 0,
              error: error instanceof Error ? error.message : '未知错误'
            }
          : f
      ))
      
      return false
    }
  }, [])

  // 开始转换所有文件
  const startConversion = useCallback(async () => {
    if (hasStarted.current || files.length === 0) return
    
    hasStarted.current = true
    setIsConverting(true)
    setIsCompleted(false)
    setHasErrors(false)
    
    console.log(`开始转换 ${files.length} 个文件`)

    let successfulCount = 0
    let failedCount = 0

    // 逐个处理文件
    for (const fileInfo of files) {
      if (!fileInfo.file) {
        console.error(`文件 ${fileInfo.name} 没有File对象`)
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id 
            ? { ...f, status: 'failed', error: '文件对象丢失' }
            : f
        ))
        failedCount++
        continue
      }

      const success = await convertSingleFile(fileInfo, fileInfo.file)
      if (success) {
        successfulCount++
      } else {
        failedCount++
      }
    }

    // 转换完成
    setIsConverting(false)
    setIsCompleted(true)
    setSuccessCount(successfulCount)
    setFailureCount(failedCount)
    setHasErrors(failedCount > 0)
    
    console.log(`转换完成: 成功 ${successfulCount} 个, 失败 ${failedCount} 个`)
  }, [files, convertSingleFile])

  // 计算总体进度
  useEffect(() => {
    if (files.length === 0) return

    const completedFiles = files.filter(f => f.status === 'completed')
    const failedFiles = files.filter(f => f.status === 'failed')
    const processingFiles = files.filter(f => f.status === 'converting' || f.status === 'pending')

    // 计算进度 - 只有成功的文件才计入100%进度
    const totalProgress = files.reduce((acc, file) => {
      if (file.status === 'completed') return acc + 100
      if (file.status === 'failed') return acc + 0 // 失败的文件不计入进度
      return acc + (file.progress || 0)
    }, 0)
    
    const averageProgress = Math.round(totalProgress / files.length)
    setOverallProgress(averageProgress)

    // 只有当所有文件都处理完成且至少有一个成功时才显示完成状态
    const allProcessed = processingFiles.length === 0
    const hasSuccessful = completedFiles.length > 0
    
    if (allProcessed && hasSuccessful && !isCompleted) {
      setIsCompleted(true)
      setIsConverting(false)
      setSuccessCount(completedFiles.length)
      setFailureCount(failedFiles.length)
      setHasErrors(failedFiles.length > 0)
    }
  }, [files, isCompleted])

  // 自动开始转换
  useEffect(() => {
    if (files.length > 0 && !hasStarted.current) {
      // 延迟一点开始，让用户看到界面
      const timer = setTimeout(() => {
        startConversion()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [files, startConversion])

  // 下载单个文件
  const downloadFile = useCallback((file: ConvertFile) => {
    if (!file.resultData || !file.resultFilename) return

    try {
      const blob = new Blob([file.resultData], { 
        type: file.resultFormat === 'flac' ? 'audio/flac' : 'audio/mpeg' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.resultFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log(`下载文件: ${file.resultFilename}`)
    } catch (error) {
      console.error('下载文件失败:', error)
    }
  }, [])

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'converting':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  // 获取状态文本
  const getStatusText = (file: ConvertFile) => {
    switch (file.status) {
      case 'completed':
        return '转换完成'
      case 'failed':
        return `转换失败: ${file.error || '未知错误'}`
      case 'converting':
        return '转换中...'
      default:
        return '等待转换'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/convert">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </Link>
      </div>

      {/* 总体进度卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            转换进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>总体进度</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            {isCompleted && (
              <Alert className={hasErrors ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
                <AlertCircle className={`h-4 w-4 ${hasErrors ? "text-yellow-600" : "text-green-600"}`} />
                <AlertDescription className={hasErrors ? "text-yellow-800" : "text-green-800"}>
                  {hasErrors 
                    ? `转换完成！成功 ${successCount} 个文件，失败 ${failureCount} 个文件。`
                    : `所有文件转换完成！成功转换 ${successCount} 个文件。`
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 文件列表 */}
      <div className="space-y-4">
        {files.map((file) => (
          <Card key={file.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <FileMusic className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{file.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(file.status || 'pending')}
                        <span>{getStatusText(file)}</span>
                      </div>
                    </div>
                    {file.status === 'converting' && (
                      <div className="mt-2">
                        <Progress value={file.progress || 0} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
                
                {file.status === 'completed' && file.resultData && (
                  <Button
                    onClick={() => downloadFile(file)}
                    size="sm"
                    className="ml-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 底部操作 */}
      {isCompleted && (
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/convert">
            <Button variant="outline">
              转换更多文件
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
