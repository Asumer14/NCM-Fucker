// NCM文件解码器 - 修复版（基于最新unlock-music权威实现）

// NCM文件格式常量
const NCM_HEADER = 'CTENFDAM'
const CORE_KEY = new Uint8Array([0x68, 0x7A, 0x48, 0x52, 0x41, 0x6D, 0x73, 0x6F, 0x35, 0x6B, 0x49, 0x6E, 0x62, 0x61, 0x78, 0x57])
const META_KEY = new Uint8Array([0x23, 0x31, 0x34, 0x6C, 0x6A, 0x6B, 0x5F, 0x21, 0x5C, 0x5D, 0x26, 0x30, 0x55, 0x3C, 0x27, 0x28])

export interface NCMMetadata {
  musicId?: number
  musicName?: string
  artist?: Array<[string, number]>
  album?: string
  format?: string
  duration?: number
  bitrate?: number
}

export interface NCMResult {
  format: string
  data: Uint8Array
  metadata: NCMMetadata
  image?: Uint8Array
  algorithm?: string
}

export class NCMDecoder {
  
  // AES-128-ECB解密（使用CryptoJS）
  private static aesDecrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
    try {
      // 创建WordArray
      const words: number[] = []
      for (let i = 0; i < data.length; i += 4) {
        let word = 0
        for (let j = 0; j < 4 && i + j < data.length; j++) {
          word = (word << 8) | data[i + j]
        }
        words.push(word)
      }
      const dataWords = { words, sigBytes: data.length }
      
      const keyWords: number[] = []
      for (let i = 0; i < key.length; i += 4) {
        let word = 0
        for (let j = 0; j < 4 && i + j < key.length; j++) {
          word = (word << 8) | key[i + j]
        }
        keyWords.push(word)
      }
      const keyWordArray = { words: keyWords, sigBytes: key.length }
      
      // AES解密
      const decrypted = (CryptoJS.AES.decrypt as any)(
        (CryptoJS.lib.CipherParams as any).create({ ciphertext: dataWords }),
        keyWordArray,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        }
      )
      
      // 转换回Uint8Array
      const decryptedBytes: number[] = []
      for (let i = 0; i < decrypted.sigBytes; i++) {
        const wordIndex = Math.floor(i / 4)
        const byteIndex = i % 4
        const byte = (decrypted.words[wordIndex] >>> (24 - byteIndex * 8)) & 0xFF
        decryptedBytes.push(byte)
      }
      
      return new Uint8Array(decryptedBytes)
    } catch (error) {
      console.error('❌ AES解密失败:', error)
      throw new Error(`AES解密失败: ${error}`)
    }
  }

  // 获取解密后的密钥数据
  private static getKeyData(buffer: Uint8Array, offset: number): { keyData: Uint8Array, newOffset: number } {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    const keyLen = view.getUint32(offset, true)
    const newOffset = offset + 4
    
    console.log(`密钥长度: ${keyLen}`)
    
    const cipherText = buffer.slice(newOffset, newOffset + keyLen)
    const xorKey = new Uint8Array(keyLen)
    for (let i = 0; i < keyLen; i++) {
      xorKey[i] = cipherText[i] ^ 0x64
    }
    
    console.log(`AES解密输入数据长度: ${xorKey.length}`)
    const decryptedData = this.aesDecrypt(xorKey, CORE_KEY)
    console.log(`AES解密输出数据长度: ${decryptedData.length}`)
    
    const decryptedStr = new TextDecoder('utf-8', { fatal: false }).decode(decryptedData)
    if (!decryptedStr.includes('neteasecloudmusic')) {
      throw new Error('密钥解密失败：未找到网易云音乐标识')
    }
    
    const keyData = decryptedData.slice(17) // 跳过 "neteasecloudmusic:" 前缀
    console.log(`✅ 密钥解密成功，密钥数据长度: ${keyData.length}`)
    
    return { keyData, newOffset: newOffset + keyLen }
  }

  // 标准unlock-music keyBox解密算法
  private static decryptAudio(audioData: Uint8Array, keyData: Uint8Array): Uint8Array {
    console.log('开始生成密钥盒...')
    
    // 1. 初始化RC4 S盒
    const S = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      S[i] = i
    }
    
    // 2. RC4密钥调度算法 (KSA)
    const keyDataLen = keyData.length
    let j = 0
    for (let i = 0; i < 256; i++) {
      j = (j + S[i] + keyData[i % keyDataLen]) & 0xFF
      // 交换S[i]和S[j]
      const temp = S[i]
      S[i] = S[j]
      S[j] = temp
    }
    
    console.log(`RC4 S盒生成完成，前16字节: ${Array.from(S.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`)
    
    // 3. 生成keyBox（unlock-music核心算法）
    const keyBox = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      const idx = (i + 1) & 0xFF
      const si = S[idx]
      const sj = S[(idx + si) & 0xFF]
      keyBox[i] = S[(si + sj) & 0xFF]
    }
    
    console.log(`✅ 密钥盒生成完成，前16字节: ${Array.from(keyBox.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`)
    
    // 4. 解密音频数据
    console.log('开始音频解密，数据大小:', audioData.length, '字节')
    
    const result = new Uint8Array(audioData.length)
    
    // 显示前几个字节的解密过程（调试用）
    for (let cur = 0; cur < Math.min(16, audioData.length); cur++) {
      const keyByte = keyBox[cur & 0xFF]
      result[cur] = audioData[cur] ^ keyByte
      console.log(`位置${cur}: 原始=0x${audioData[cur].toString(16)}, keyBox[${cur}]=0x${keyByte.toString(16)}, 解密=0x${result[cur].toString(16)}`)
    }
    
    // 解密剩余数据
    for (let cur = 16; cur < audioData.length; cur++) {
      result[cur] = audioData[cur] ^ keyBox[cur & 0xFF]
    }
    
    console.log('✅ 音频解密完成！')
    return result
  }

  // 验证和检测音频格式
  private static detectAudioFormat(data: Uint8Array): { format: string | null; confidence: number } {
    if (data.length < 16) {
      return { format: null, confidence: 0 }
    }
    
    // 打印前16字节用于调试
    const header16 = Array.from(data.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ')
    console.log('解密后文件头16字节:', header16)
    
    // 音频格式检测规则
    const formatTests = [
      // FLAC格式：66 4C 61 43 (fLaC)
      {
        format: 'flac',
        test: () => data[0] === 0x66 && data[1] === 0x4C && data[2] === 0x61 && data[3] === 0x43,
        confidence: 1.0
      },
      // MP3格式：FF FB/FA/F3/F2
      {
        format: 'mp3',
        test: () => data[0] === 0xFF && (data[1] === 0xFB || data[1] === 0xFA || data[1] === 0xF3 || data[1] === 0xF2),
        confidence: 0.95
      },
      // MP3 ID3标签：49 44 33 (ID3)
      {
        format: 'mp3',
        test: () => data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33,
        confidence: 0.9
      },
      // OGG格式：4F 67 67 53 (OggS)
      {
        format: 'ogg',
        test: () => data[0] === 0x4F && data[1] === 0x67 && data[2] === 0x67 && data[3] === 0x53,
        confidence: 0.95
      },
      // M4A格式：检查ftyp box
      {
        format: 'm4a',
        test: () => data[4] === 0x66 && data[5] === 0x74 && data[6] === 0x79 && data[7] === 0x70,
        confidence: 0.9
      }
    ]
    
    // 测试所有格式
    for (const test of formatTests) {
      if (test.test()) {
        console.log(`✅ 检测到格式: ${test.format} (置信度: ${test.confidence})`)
        return { format: test.format, confidence: test.confidence }
      }
    }
    
    // 计算数据质量评分
    const uniqueBytes = new Set(data.slice(0, Math.min(256, data.length))).size
    const quality = uniqueBytes / 256
    
    console.log(`未识别的格式，数据质量评分: ${quality.toFixed(3)} (唯一字节数: ${uniqueBytes})`)
    
    return { format: null, confidence: quality }
  }

  // 读取32位小端整数
  private static readUint32LE(buffer: Uint8Array, offset: number): number {
    return buffer[offset] | 
           (buffer[offset + 1] << 8) | 
           (buffer[offset + 2] << 16) | 
           (buffer[offset + 3] << 24)
  }

  // 主解码函数
  static async decode(file: File, progressCallback?: (progress: number) => void): Promise<NCMResult> {
    console.log('=== NCM 解码开始 (基于unlock-music权威实现) ===')
    console.log('文件名:', file.name)
    console.log('文件大小:', file.size, 'bytes')
    
    const buffer = new Uint8Array(await file.arrayBuffer())
    let offset = 0
    
    progressCallback?.(10)
    
    // 1. 验证文件头
    const header = new TextDecoder().decode(buffer.slice(0, 8))
    if (header !== NCM_HEADER) {
      throw new Error(`无效的NCM文件头: ${header}`)
    }
    offset = 10 // 跳过文件头和2字节间隔
    console.log('✅ 文件头验证通过')
    
    progressCallback?.(20)
    
    // 2. 获取密钥数据
    const { keyData, newOffset } = this.getKeyData(buffer, offset)
    offset = newOffset
    
    progressCallback?.(30)
    
    // 3. 读取元数据
    const metaLength = this.readUint32LE(buffer, offset)
    offset += 4
    console.log('元数据长度:', metaLength)
    
    let metadata: NCMMetadata = {}
    
    if (metaLength > 0) {
      try {
        const encryptedMeta = buffer.slice(offset, offset + metaLength)
        offset += metaLength
        
        // 跳过 "163 key(Don't modify):" 前缀（22字节）
        const xorMeta = new Uint8Array(encryptedMeta.length - 22)
        for (let i = 22; i < encryptedMeta.length; i++) {
          xorMeta[i - 22] = encryptedMeta[i] ^ 0x63
        }
        
        // Base64解码
        const base64Meta = new TextDecoder().decode(xorMeta)
        const metaJson = atob(base64Meta)
        const metaBuffer = new Uint8Array(Array.from(metaJson, c => c.charCodeAt(0)))
        
        // AES解密元数据
        const decryptedMetaData = this.aesDecrypt(metaBuffer, META_KEY)
        const jsonStr = new TextDecoder('utf-8', { fatal: false }).decode(decryptedMetaData.slice(6)) // 跳过 "music:" 前缀
        metadata = JSON.parse(jsonStr)
        console.log('✅ 元数据解析成功:', metadata)
      } catch (error) {
        console.warn('⚠️ 元数据解析失败:', error)
      }
    }
    
    progressCallback?.(50)
    
    // 4. 跳过CRC32和间隔
    offset += 4 // CRC32
    offset += 5 // 间隔
    
    // 5. 读取专辑图片
    const imageLength = this.readUint32LE(buffer, offset)
    offset += 4
    
    let image: Uint8Array | undefined
    if (imageLength > 0) {
      image = buffer.slice(offset, offset + imageLength)
      offset += imageLength
      console.log('✅ 读取专辑图片，大小:', imageLength, 'bytes')
    }
    
    progressCallback?.(70)
    
    // 6. 解密音频数据
    console.log('=== 开始音频数据解密 ===')
    const audioData = buffer.slice(offset)
    console.log('音频数据大小:', audioData.length, 'bytes')
    
    if (audioData.length === 0) {
      throw new Error('没有音频数据')
    }
    
    // 显示加密音频数据的前32字节
    const encryptedHeader = Array.from(audioData.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(' ')
    console.log('加密音频数据前32字节:', encryptedHeader)
    
    progressCallback?.(80)
    
    // 解密音频数据
    const decryptedAudio = this.decryptAudio(audioData, keyData)
    
    progressCallback?.(90)
    
    // 7. 验证解密结果
    console.log('=== 验证解密结果 ===')
    const detection = this.detectAudioFormat(decryptedAudio)
    
    if (!detection.format) {
      const headerHex = Array.from(decryptedAudio.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ')
      console.log('❌ 解密失败：无法识别为有效的音频格式')
      console.log('解密后文件头:', headerHex)
      console.log('数据质量评分:', `${detection.confidence.toFixed(3)}/1.000`)
      
      throw new Error(`NCM文件解密失败：生成的数据不是有效的音频格式。

解密后文件头: ${headerHex}
数据质量评分: ${detection.confidence.toFixed(3)}/1.000

这通常表明：
1. 文件使用了不支持的NCM加密版本或变体
2. 文件可能已损坏或来源不标准
3. 需要使用其他专门的NCM解码工具

注意：当前实现基于unlock-music项目的权威算法。`)
    }
    
    let format = detection.format
    
    // 如果元数据中有格式信息，优先使用
    if (metadata.format && (metadata.format === 'mp3' || metadata.format === 'flac')) {
      format = metadata.format
    }
    
    progressCallback?.(100)
    
    console.log('=== NCM解码成功完成！===')
    console.log('✅ 检测到音频格式:', format)
    console.log('✅ 输出大小:', decryptedAudio.length, 'bytes')
    console.log('✅ 解密置信度:', detection.confidence.toFixed(3))
    
    return {
      format,
      data: decryptedAudio,
      metadata,
      image,
      algorithm: 'unlock-music-keybox'
    }
  }
} 