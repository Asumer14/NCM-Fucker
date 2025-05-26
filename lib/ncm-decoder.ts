// NCM文件解码器 - 基于taurusxin/ncmdump-go v1.7.4最新实现
import CryptoJS from 'crypto-js'

// NCM文件格式常量
const NCM_HEADER = 'CTENFDAM'
const CORE_KEY = new Uint8Array([0x68, 0x7A, 0x48, 0x52, 0x41, 0x6D, 0x73, 0x6F, 0x35, 0x6B, 0x49, 0x6E, 0x62, 0x61, 0x78, 0x57])
const META_KEY = new Uint8Array([0x23, 0x31, 0x34, 0x6C, 0x6A, 0x6B, 0x5F, 0x21, 0x5C, 0x5D, 0x26, 0x30, 0x55, 0x3C, 0x27, 0x28])

// 分块处理大小（1MB）
const CHUNK_SIZE = 1024 * 1024

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
}

export class NCMDecoder {
  // 将Uint8Array转换为CryptoJS WordArray
  private static uint8ArrayToWordArray(uint8Array: Uint8Array): CryptoJS.lib.WordArray {
    const words: number[] = []
    for (let i = 0; i < uint8Array.length; i += 4) {
      let word = 0
      for (let j = 0; j < 4 && i + j < uint8Array.length; j++) {
        word |= uint8Array[i + j] << (24 - j * 8)
      }
      words.push(word)
    }
    return CryptoJS.lib.WordArray.create(words, uint8Array.length)
  }

  // 将CryptoJS WordArray转换为Uint8Array
  private static wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const words = wordArray.words
    const sigBytes = wordArray.sigBytes
    const result = new Uint8Array(sigBytes)
    
    for (let i = 0; i < sigBytes; i++) {
      const wordIndex = Math.floor(i / 4)
      const byteIndex = i % 4
      result[i] = (words[wordIndex] >>> (24 - byteIndex * 8)) & 0xFF
    }
    
    return result
  }

  // AES-128-ECB解密
  private static aesDecrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
    try {
      console.log('AES解密输入数据长度:', data.length)
      
      // 转换为CryptoJS格式
      const keyWordArray = this.uint8ArrayToWordArray(key)
      const dataWordArray = this.uint8ArrayToWordArray(data)
      
      // 使用AES-128-ECB解密
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: dataWordArray } as any,
        keyWordArray,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        }
      )
      
      // 转换回Uint8Array
      const result = this.wordArrayToUint8Array(decrypted)
      console.log('AES解密输出数据长度:', result.length)
      
      return result
    } catch (error) {
      console.error('AES解密失败:', error)
      throw new Error(`AES解密失败: ${error}`)
    }
  }

  // 移除PKCS7填充
  private static removePKCS7Padding(data: Uint8Array): Uint8Array {
    if (data.length === 0) return data
    
    const paddingLength = data[data.length - 1]
    if (paddingLength > 16 || paddingLength > data.length) {
      console.warn('无效的填充长度:', paddingLength)
      return data
    }
    
    // 验证填充是否正确
    for (let i = data.length - paddingLength; i < data.length; i++) {
      if (data[i] !== paddingLength) {
        console.warn('填充验证失败')
        return data
      }
    }
    
    return data.slice(0, data.length - paddingLength)
  }

  // RC4密钥调度算法 - 基于taurusxin实现
  private static rc4KeySchedule(key: Uint8Array): Uint8Array {
    const sbox = new Uint8Array(256)
    
    // 初始化S盒
    for (let i = 0; i < 256; i++) {
      sbox[i] = i
    }
    
    // 密钥调度
    let j = 0
    for (let i = 0; i < 256; i++) {
      j = (j + sbox[i] + key[i % key.length]) & 0xFF
      // 交换
      const temp = sbox[i]
      sbox[i] = sbox[j]
      sbox[j] = temp
    }
    
    return sbox
  }

  // NCM RC4解密算法 - 基于taurusxin/ncmdump-go v1.7.4实现
  private static ncmRC4Decrypt(data: Uint8Array, sbox: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length)
    
    console.log(`开始NCM RC4解密，数据大小: ${data.length} 字节`)
    
    // NCM的特殊RC4算法
    for (let i = 0; i < data.length; i++) {
      const j = (i + 1) & 0xFF
      const k = (sbox[j] + sbox[(sbox[j] + j) & 0xFF]) & 0xFF
      result[i] = data[i] ^ sbox[k]
    }
    
    console.log('NCM RC4解密完成')
    return result
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
    console.log('开始解码NCM文件:', file.name, '大小:', file.size)
    
    const buffer = new Uint8Array(await file.arrayBuffer())
    let offset = 0
    
    // 1. 验证文件头
    const header = new TextDecoder().decode(buffer.slice(0, 8))
    if (header !== NCM_HEADER) {
      throw new Error(`无效的NCM文件头: ${header}`)
    }
    offset += 10 // 跳过文件头和2字节间隔
    
    console.log('文件头验证通过')
    
    // 2. 读取密钥数据长度
    const keyLength = this.readUint32LE(buffer, offset)
    offset += 4
    
    console.log('密钥数据长度:', keyLength)
    
    if (keyLength <= 0 || offset + keyLength > buffer.length) {
      throw new Error(`无效的密钥长度: ${keyLength}`)
    }
    
    // 3. 解密密钥数据
    const encryptedKey = buffer.slice(offset, offset + keyLength)
    offset += keyLength
    
    console.log('开始解密密钥数据...')
    
    // 对密钥数据进行异或操作
    const xorKey = new Uint8Array(encryptedKey.length)
    for (let i = 0; i < encryptedKey.length; i++) {
      xorKey[i] = encryptedKey[i] ^ 0x64
    }
    
    // AES解密
    const decryptedKeyData = this.aesDecrypt(xorKey, CORE_KEY)
    
    // 移除PKCS7填充
    const unpaddedKeyData = this.removePKCS7Padding(decryptedKeyData)
    
    // 验证解密结果
    const keyDataStr = new TextDecoder().decode(unpaddedKeyData)
    console.log('解密后的密钥数据前100字符:', keyDataStr.substring(0, 100))
    
    if (!keyDataStr.includes('neteasecloudmusic')) {
      throw new Error('密钥解密失败：未找到网易云音乐标识')
    }
    
    console.log('密钥解密成功！')
    
    // 提取实际的RC4密钥（跳过"neteasecloudmusic"前缀）
    const neteasePrefixLength = 17 // "neteasecloudmusic".length
    const actualKey = unpaddedKeyData.slice(neteasePrefixLength)
    
    // 找到实际密钥的结束位置（遇到0字节停止）
    let keyEndIndex = actualKey.length
    for (let i = 0; i < actualKey.length; i++) {
      if (actualKey[i] === 0) {
        keyEndIndex = i
        break
      }
    }
    const finalKey = actualKey.slice(0, keyEndIndex)
    
    console.log('RC4密钥长度:', finalKey.length)
    console.log('RC4密钥前16字节:', Array.from(finalKey.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' '))
    
    // 4. 读取元数据长度
    const metaLength = this.readUint32LE(buffer, offset)
    offset += 4
    
    console.log('元数据长度:', metaLength)
    
    let metadata: NCMMetadata = {}
    
    if (metaLength > 0) {
      // 解密元数据
      const encryptedMeta = buffer.slice(offset, offset + metaLength)
      offset += metaLength
      
      // 对元数据进行异或操作
      const xorMeta = new Uint8Array(encryptedMeta.length)
      for (let i = 0; i < encryptedMeta.length; i++) {
        xorMeta[i] = encryptedMeta[i] ^ 0x63
      }
      
      // 跳过前缀并Base64解码
      const prefixLength = 22 // "163 key(Don't modify):".length
      const base64Meta = new TextDecoder().decode(xorMeta.slice(prefixLength))
      
      try {
        const metaJson = atob(base64Meta)
        const decryptedMetaData = this.aesDecrypt(
          new Uint8Array(Array.from(metaJson, c => c.charCodeAt(0))), 
          META_KEY
        )
        const unpaddedMetaData = this.removePKCS7Padding(decryptedMetaData)
        
        // 跳过前6个字节的前缀
        const jsonStr = new TextDecoder().decode(unpaddedMetaData.slice(6))
        metadata = JSON.parse(jsonStr)
        console.log('元数据解析成功:', metadata)
      } catch (error) {
        console.warn('元数据解析失败:', error)
      }
    }
    
    // 5. 跳过CRC32和间隔
    offset += 4 // CRC32
    offset += 5 // 间隔
    
    // 6. 读取专辑图片
    const imageLength = this.readUint32LE(buffer, offset)
    offset += 4
    
    let image: Uint8Array | undefined
    if (imageLength > 0) {
      image = buffer.slice(offset, offset + imageLength)
      offset += imageLength
      console.log('读取专辑图片，大小:', imageLength)
    }
    
    // 7. 解密音频数据
    console.log('开始解密音频数据...')
    const audioData = buffer.slice(offset)
    console.log('音频数据大小:', audioData.length)
    
    // 生成RC4 S盒
    const sbox = this.rc4KeySchedule(finalKey)
    
    // 使用正确的NCM RC4解密算法
    const decryptedAudio = this.ncmRC4Decrypt(audioData, sbox)
    
    // 检测音频格式 - 默认为FLAC（与你的项目一致）
    let format = 'flac' // 默认格式，与你的项目一致
    if (metadata.format) {
      format = metadata.format
    } else {
      // 通过文件头检测格式
      const audioHeader = decryptedAudio.slice(0, 4)
      if (audioHeader[0] === 0x66 && audioHeader[1] === 0x4C && 
          audioHeader[2] === 0x61 && audioHeader[3] === 0x43) {
        format = 'flac'
      } else if (audioHeader[0] === 0xFF && (audioHeader[1] & 0xE0) === 0xE0) {
        format = 'mp3'
      }
    }
    
    console.log(`音频解密完成，格式: ${format}, 大小: ${decryptedAudio.length}`)
    
    // 验证解密结果
    const headerHex = Array.from(decryptedAudio.slice(0, 16))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
    console.log('解密后音频文件头:', headerHex)
    
    // 验证FLAC文件头
    if (format === 'flac') {
      const flacHeader = decryptedAudio.slice(0, 4)
      if (flacHeader[0] === 0x66 && flacHeader[1] === 0x4C && 
          flacHeader[2] === 0x61 && flacHeader[3] === 0x43) {
        console.log('✅ FLAC文件头验证成功')
      } else {
        console.warn('⚠️ FLAC文件头验证失败，可能解密有误')
      }
    }
    
    return {
      format,
      data: decryptedAudio,
      metadata,
      image
    }
  }
} 