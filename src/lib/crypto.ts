import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-default-encryption-key-change-in-production'

export function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString()
}

export function decryptApiKey(encryptedKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function createKeyPreview(apiKey: string): string {
  if (apiKey.length <= 8) return '***'

  const start = apiKey.substring(0, 4)
  const end = apiKey.substring(apiKey.length - 4)
  return `${start}...${end}`
}