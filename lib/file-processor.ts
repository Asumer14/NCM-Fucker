// 文件处理器
import { NCMDecoder } from './ncm-decoder'

export interface ProcessResult {
  success: boolean
  filename: string
  originalFormat: string
  convertedFormat: string
  outputBlob?: Blob
  error?: string
  metadata?: any
  algorithm?: string
}

export class FileProcessor {
  // 处理单个文件
  static async processFile(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ProcessResult> {
    try {
      console.log(`开始处理文件: ${file.name}`)
      
      // 检查文件扩展名
      const fileExtension = file.name.toLowerCase().split('.').pop()
      
      if (fileExtension !== 'ncm') {
        return {
          success: false,
          filename: file.name,
          originalFormat: fileExtension || 'unknown',
          convertedFormat: 'none',
          error: '目前仅支持NCM格式文件'
        }
      }

      // 使用增强解码器处理NCM文件
      const result = await NCMDecoder.decode(file, onProgress)
      
      // 创建输出文件
      const outputBlob = new Blob([result.data], {
        type: result.format === 'flac' ? 'audio/flac' : 'audio/mpeg'
      })
      
      return {
        success: true,
        filename: file.name,
        originalFormat: 'ncm',
        convertedFormat: result.format,
        outputBlob,
        metadata: result.metadata,
        algorithm: result.algorithm
      }
      
    } catch (error) {
      console.error(`处理文件失败: ${file.name}`, error)
      
      return {
        success: false,
        filename: file.name,
        originalFormat: 'ncm',
        convertedFormat: 'none',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  // 批量处理文件
  static async processFiles(
    files: File[],
    onFileProgress?: (fileIndex: number, filename: string, progress: number) => void,
    onOverallProgress?: (completedFiles: number, totalFiles: number) => void
  ): Promise<ProcessResult[]> {
    const results: ProcessResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      const result = await this.processFile(file, (progress) => {
        onFileProgress?.(i, file.name, progress)
      })
      
      results.push(result)
      onOverallProgress?.(i + 1, files.length)
    }
    
    return results
  }

  // 生成下载文件名
  static generateOutputFilename(originalName: string, format: string): string {
    const baseName = originalName.replace(/\.ncm$/i, '')
    return `${baseName}.${format}`
  }
} 