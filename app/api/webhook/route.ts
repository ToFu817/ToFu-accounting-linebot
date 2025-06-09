import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// 環境變數檢查
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 只在有環境變數時建立 Supabase 客戶端
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// 驗證 LINE 簽名
function verifySignature(body: string, signature: string): boolean {
  if (!CHANNEL_SECRET) return false
  const hash = crypto.createHmac("SHA256", CHANNEL_SECRET).update(body).digest("base64")
  return hash === signature
}

// 發送回覆訊息
async function replyMessage(replyToken: string, messages: any[]) {
  if (!CHANNEL_ACCESS_TOKEN) return

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  })
  return response.json()
}

// 取得或建立用戶
async function getOrCreateUser(lineUserId: string, displayName?: string) {
  if (!supabase) return null

  let { data: user } = await supabase.from("users").select("*").eq("line_user_id", lineUserId).single()

  if (!user) {
    const { data: newUser } = await supabase
      .from("users")
      .insert([
        {
          line_user_id: lineUserId,
          display_name: displayName,
          setup_completed: false,
          disclaimer_accepted: false,
        },
      ])
      .select()
      .single()
    user = newUser
  }

  return user
}

// 生成歡迎訊息和開始記帳按鈕
function generateWelcomeMessage() {
  return {
    type: "flex",
    altText: "歡迎使用記帳小豆腐！",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://via.placeholder.com/1040x585/4CAF50/FFFFFF?text=記帳小豆腐",
        size: "full",
        aspectRatio: "20:13",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "歡迎使用記帳小豆腐！",
            weight: "bold",
            size: "xl",
            color: "#333333",
            align: "center",
          },
          {
            type: "text",
            text: "您的智能財務管理助手",
            size: "md",
            color: "#666666",
            margin: "md",
            align: "center",
          },
          {
            type: "separator",
            margin: "xl",
          },
          {
            type: "text",
            text: "✨ 自動記帳追蹤\n📊 詳細財務報表\n💰 未知支出分析\n📱 即時資產管理",
            size: "sm",
            color: "#666666",
            margin: "xl",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "postback",
              label: "🚀 開始記帳",
              data: "start_accounting",
            },
          },
          {
            type: "button",
            style: "secondary",
            height: "sm",
            margin: "sm",
            action: {
              type: "postback",
              label: "📋 查看功能說明",
              data: "show_features",
            },
          },
        ],
      },
    },
  }
}

// 生成免責聲明
function generateDisclaimerMessage() {
  return {
    type: "flex",
    altText: "服務條款與隱私聲明",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📋 服務條款與隱私聲明",
            weight: "bold",
            size: "lg",
            color: "#333333",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🔒 資料安全保障",
            weight: "bold",
            size: "md",
            color: "#4CAF50",
            margin: "md",
          },
          {
            type: "text",
            text: "• 您的財務資料採用銀行級加密保護\n• 所有資料儲存於安全的雲端資料庫\n• 我們絕不會將您的資料提供給第三方\n• 您可隨時要求刪除所有個人資料",
            size: "sm",
            color: "#666666",
            margin: "sm",
            wrap: true,
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "text",
            text: "📊 服務功能",
            weight: "bold",
            size: "md",
            color: "#2196F3",
            margin: "md",
          },
          {
            type: "text",
            text: "• 自動記錄和分類您的收支\n• 計算淨資產變化和未知支出\n• 提供詳細的財務分析報表\n• 協助您更好地管理個人財務",
            size: "sm",
            color: "#666666",
            margin: "sm",
            wrap: true,
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "text",
            text: "⚠️ 免責聲明",
            weight: "bold",
            size: "md",
            color: "#FF9800",
            margin: "md",
          },
          {
            type: "text",
            text: "• 本服務僅供個人財務管理參考\n• 請確保輸入資料的準確性\n• 投資決策請諮詢專業理財顧問\n• 使用本服務即表示同意上述條款",
            size: "sm",
            color: "#666666",
            margin: "sm",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "postback",
              label: "✅ 我同意並開始設定",
              data: "accept_disclaimer",
            },
          },
          {
            type: "button",
            style: "secondary",
            margin: "sm",
            action: {
              type: "postback",
              label: "❌ 我不同意",
              data: "decline_disclaimer",
            },
          },
        ],
      },
    },
  }
}

// 生成科目設定引導
function generateAccountSetupMessage() {
  return {
    type: "flex",
    altText: "開始設定您的財務科目",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "💼 財務科目設定",
            weight: "bold",
            size: "lg",
            color: "#333333",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "為了提供精確的財務分析，請先設定您的基本財務科目。",
            size: "md",
            color: "#666666",
            wrap: true,
          },
          {
            type: "separator",
            margin: "xl",
          },
          {
            type: "text",
            text: "📋 設定步驟：",
            weight: "bold",
            size: "md",
            color: "#4CAF50",
            margin: "xl",
          },
          {
            type: "text",
            text: "1️⃣ 資產科目（現金、銀行存款、股票等）\n2️⃣ 負債科目（信用卡、貸款等）\n3️⃣ 收入科目（薪資、租金等）\n4️⃣ 支出科目（固定支出、變動支出）",
            size: "sm",
            color: "#666666",
            margin: "md",
            wrap: true,
          },
          {
            type: "separator",
            margin: "xl",
          },
          {
            type: "text",
            text: "💡 小提醒：",
            weight: "bold",
            size: "md",
            color: "#FF9800",
            margin: "xl",
          },
          {
            type: "text",
            text: "• 可以隨時新增或修改科目\n• 建議先設定主要的科目\n• 詳細設定可到網頁版進行",
            size: "sm",
            color: "#666666",
            margin: "md",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "uri",
              label: "🌐 前往網頁版設定",
              uri: `https://tofu-accounting-linebot.vercel.app/setup`,
            },
          },
          {
            type: "button",
            style: "secondary",
            margin: "sm",
            action: {
              type: "postback",
              label: "📱 在 LINE 中快速設定",
              data: "quick_setup",
            },
          },
        ],
      },
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    // 檢查環境變數
    if (!CHANNEL_SECRET || !CHANNEL_ACCESS_TOKEN || !supabase) {
      console.error("Missing required environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Missing required environment variables",
        },
        { status: 500 },
      )
    }

    const body = await request.text()
    const signature = request.headers.get("x-line-signature")

    if (!signature || !verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)

    for (const event of data.events) {
      // 處理加好友事件
      if (event.type === "follow") {
        const userId = event.source.userId

        // 建立用戶記錄
        await getOrCreateUser(userId)

        // 發送歡迎訊息
        await replyMessage(event.replyToken, [generateWelcomeMessage()])
        continue
      }

      // 處理訊息事件
      if (event.type === "message" && event.message.type === "text") {
        const messageText = event.message.text
        const userId = event.source.userId
        const displayName = event.source.displayName

        // 取得或建立用戶
        const user = await getOrCreateUser(userId, displayName)
        if (!user) continue

        // 處理基本指令
        if (messageText === "記帳" || messageText === "開始記帳" || messageText === "開始") {
          await replyMessage(event.replyToken, [generateWelcomeMessage()])
        } else if (messageText === "報表" || messageText === "查看報表") {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: `📊 您的財務報表\n\n點擊下方連結查看詳細報表：\nhttps://tofu-accounting-linebot.vercel.app/report?userId=${user.id}`,
            },
          ])
        } else if (messageText === "設定" || messageText === "科目設定") {
          await replyMessage(event.replyToken, [generateAccountSetupMessage()])
        } else {
          // 處理記帳輸入
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "請使用以下指令：\n\n🚀 「開始記帳」- 開始使用\n📊 「報表」- 查看財務報表\n⚙️ 「設定」- 科目設定\n\n或直接輸入支出：\n例如：午餐 120",
            },
          ])
        }
      }

      // 處理 Postback 事件
      if (event.type === "postback") {
        const postbackData = event.postback.data
        const userId = event.source.userId

        const user = await getOrCreateUser(userId)
        if (!user) continue

        switch (postbackData) {
          case "start_accounting":
            if (!user.disclaimer_accepted) {
              await replyMessage(event.replyToken, [generateDisclaimerMessage()])
            } else {
              await replyMessage(event.replyToken, [generateAccountSetupMessage()])
            }
            break

          case "show_features":
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "🌟 記帳小豆腐功能介紹\n\n💰 智能記帳\n• 自動分類收支項目\n• 即時記錄財務變化\n\n📊 財務分析\n• 詳細的收支報表\n• 資產負債分析\n• 未知支出計算\n\n📱 便利操作\n• LINE 即時記帳\n• 網頁版詳細管理\n• 圓餅圖視覺化分析\n\n🔒 安全保障\n• 銀行級資料加密\n• 隱私資料保護",
              },
            ])
            break

          case "accept_disclaimer":
            // 更新用戶同意狀態
            await supabase.from("users").update({ disclaimer_accepted: true }).eq("id", user.id)

            await replyMessage(event.replyToken, [generateAccountSetupMessage()])
            break

          case "decline_disclaimer":
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "感謝您的考慮。\n\n如果您改變主意，隨時可以輸入「開始記帳」重新開始。\n\n祝您有美好的一天！ 😊",
              },
            ])
            break

          case "quick_setup":
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "🚀 快速設定模式\n\n請依序輸入您的基本資產：\n\n格式：科目 金額\n例如：\n• 現金 5000\n• 台新銀行 50000\n• 國泰信用卡 15000\n\n輸入完成後請輸入「完成設定」",
              },
            ])
            break
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
