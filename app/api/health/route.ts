import { NextResponse } from "next/server"
import { env, validateEnv } from "@/lib/env"

export async function GET() {
  const isValid = validateEnv()

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      supabase: !!env.SUPABASE_URL,
      lineBot: !!env.LINE_CHANNEL_SECRET,
      linePay: !!env.LINEPAY_CHANNEL_ID,
    },
    configured: isValid,
  })
}
