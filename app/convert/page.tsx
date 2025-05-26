"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Upload, FileMusic, AlertCircle, Plus, X, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface FileWithId extends File {
  id: string
}

export default function ConvertPage() {
  const router = useRouter()
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileWithId[]>([])
  const [outputFormat, setOutputFormat] = useState("mp3")
  const [error, setError] = useState<string | null>(null)

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return

    const newFiles: FileWithId[] = []
    let hasError = false

    Array.from(files).forEach((file) => {
      // 检查文件扩展名
      if (file.name.toLowerCase().endsWith(".ncm")) {
        const fileWithId = Object.assign(file, {
          id: crypto.randomUUID(),
        }) as FileWithId
        newFiles.push(fileWithId)
      } else {
        hasError = true
      }
    })

    if (hasError) {
      setError("只能选择NCM格式的音乐文件")
    } else {
      setError(null)
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(event.target.files)
      // 清空input的value，以便同一文件可以再次选择
      if (inputFileRef.current) {
        inputFileRef.current.value = ""
      }
    },
    [addFiles],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      addFiles(event.dataTransfer.files)
    },
    [addFiles],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const removeFile = useCallback((id: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== id))
  }, [])

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([])
  }, [])

  const handleAddMoreFiles = useCallback(() => {
    inputFileRef.current?.click()
  }, [])

  const handleConvert = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError("请至少选择一个文件进行转换")
      return
    }

    try {
      // 只存储文件的基本信息，不存储二进制数据
      const fileInfos = selectedFiles.map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }))

      // 存储文件基本信息到localStorage
      localStorage.setItem("convertFiles", JSON.stringify(fileInfos))
      localStorage.setItem("outputFormat", outputFormat)

      // 将File对象存储到IndexedDB
      await storeFilesToIndexedDB(selectedFiles)

      console.log(`准备转换 ${selectedFiles.length} 个文件`)
      
      // 导航到转换进度页面
      router.push("/convert/progress")
    } catch (error) {
      console.error("准备文件数据失败:", error)
      setError("文件处理失败，请重试")
    }
  }, [selectedFiles, outputFormat, router])

  // 将文件存储到IndexedDB
  const storeFilesToIndexedDB = async (files: FileWithId[]) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('NCMConverter', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['files'], 'readwrite')
        const store = transaction.objectStore('files')
        
        // 清空之前的文件
        store.clear()
        
        // 存储新文件
        files.forEach(file => {
          store.put({
            id: file.id,
            file: file
          })
        })
        
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' })
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">音乐格式转换</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">上传您的NCM文件，选择输出格式，开始转换</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                上传文件
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={`border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer ${
                  selectedFiles.length > 0 ? "h-64 overflow-y-auto" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => selectedFiles.length === 0 && inputFileRef.current?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".ncm"
                  onChange={handleFileSelect}
                  className="hidden"
                  ref={inputFileRef}
                  multiple
                />

                {selectedFiles.length === 0 ? (
                  <>
                    <FileMusic className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 mb-2">点击选择文件或拖拽文件到此处</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">仅支持NCM格式文件（.ncm）</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {selectedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      >
                        <FileMusic className="h-5 w-5 text-slate-600 dark:text-slate-300 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200 flex-1 text-left truncate">
                          {file.name}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(file.id)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={handleAddMoreFiles} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    添加更多文件
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFiles}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    清空所有文件
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Settings Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>转换设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">输出格式</Label>
                <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="mp3" id="mp3" />
                    <Label htmlFor="mp3" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">MP3</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">通用格式，文件较小，兼容性好</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="flac" id="flac" />
                    <Label htmlFor="flac" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">FLAC</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">无损格式，音质最佳，文件较大</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">已选择文件</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{selectedFiles.length} 个文件</span>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      总大小：{(selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">格式：{outputFormat.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                size="lg"
              >
                开始转换
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle>使用提示</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">文件要求</h4>
                <ul className="space-y-1">
                  <li>• 仅支持网易云音乐NCM格式文件</li>
                  <li>• 文件扩展名必须为.ncm</li>
                  <li>• 支持批量选择多个文件</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">注意事项</h4>
                <ul className="space-y-1">
                  <li>• 所有处理均在本地完成</li>
                  <li>• 不会上传文件到服务器</li>
                  <li>• 转换速度取决于文件大小和数量</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
