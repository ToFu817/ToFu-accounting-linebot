// 環境變數配置和驗證
export const env = {
  // Supabase 設定
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // LINE Bot 設定
  LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET || "",
  LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",

  // LINE Pay 設定
  LINEPAY_CHANNEL_ID: process.env.LINEPAY_CHANNEL_ID || "",
  LINEPAY_CHANNEL_SECRET: process.env.LINEPAY_CHANNEL_SECRET || "",
}

// 檢查必要的環境變數
export function validateEnv() {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "LINE_CHANNEL_SECRET", "LINE_CHANNEL_ACCESS_TOKEN"]

  const missing = required.filter((key) => !env[key as keyof typeof env])

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}

// 建立 Supabase 客戶端的安全方法
export function createSupabaseClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase configuration missing")
    return null
  }

  try {
    const { createClient } = require("@supabase/supabase-js")
    return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}
