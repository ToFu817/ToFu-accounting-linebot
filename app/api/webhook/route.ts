import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// LINE Bot 設定
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!

// Supabase 設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// 驗證 LINE 簽名
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac("SHA256", CHANNEL_SECRET).update(body).digest("base64")
  return hash === signature
}

// 發送回覆訊息
async function replyMessage(replyToken: string, messages: any[]) {
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
  let { data: user } = await supabase.from("users").select("*").eq("line_user_id", lineUserId).single()

  if (!user) {
    const { data: newUser } = await supabase
      .from("users")
      .insert([{ line_user_id: lineUserId, display_name: displayName }])
      .select()
      .single()
    user = newUser
  }

  return user
}

// 檢查用戶是否已設定初始淨資產
async function checkUserSetup(userId: number) {
  const { data: assets } = await supabase.from("assets").select("*").eq("user_id", userId).limit(1)

  return assets && assets.length > 0
}

// 生成初始設定引導
function generateInitialSetupMessage() {
  return {
    type: "flex",
    altText: "請先設定您的初始淨資產",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "歡迎使用記帳小豆腐！",
            weight: "bold",
            size: "lg",
            color: "#333333",
          },
          {
            type: "text",
            text: "在開始記帳前，請先設定您目前的淨資產狀況，這樣才能準確計算未知支出。",
            size: "sm",
            color: "#666666",
            margin: "md",
            wrap: true,
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "text",
            text: "請依序輸入以下資產項目：",
            size: "sm",
            color: "#333333",
            margin: "md",
            weight: "bold",
          },
          {
            type: "text",
            text: "• 現金 金額\n• 銀行名稱 餘額\n• 股票 現值\n• 信用卡 欠款",
            size: "sm",
            color: "#666666",
            margin: "sm",
            wrap: true,
          },
          {
            type: "text",
            text: "範例：現金 5000",
            size: "sm",
            color: "#999999",
            margin: "sm",
            style: "italic",
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
              label: "開始設定資產",
              data: "start_asset_setup",
            },
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "postback",
              label: "跳過設定",
              data: "skip_asset_setup",
            },
          },
        ],
      },
    },
  }
}

// 儲存資產記錄
async function saveAsset(userId: number, category: string, amount: number, type: "asset" | "debt" = "asset") {
  const { data, error } = await supabase
    .from("assets")
    .insert([
      {
        user_id: userId,
        category,
        amount,
        asset_type: type,
      },
    ])
    .select()
    .single()

  return { data, error }
}

// 處理資產記錄
function parseAssetMessage(text: string) {
  const patterns = [
    /^(.+?)\s+(\d+)$/, // "現金 5000"
    /^(.+?)\+(\d+)$/, // "現金+5000"
    /^(.+?)：(\d+)$/, // "現金：5000"
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const category = match[1].trim()
      const amount = Number.parseInt(match[2])

      // 判斷是資產還是負債
      const debtKeywords = ["信用卡", "貸款", "欠款", "債務"]
      const isDebt = debtKeywords.some((keyword) => category.includes(keyword))

      return {
        category,
        amount,
        type: isDebt ? "debt" : ("asset" as "asset" | "debt"),
      }
    }
  }
  return null
}

// 處理支出記錄
function parseExpenseMessage(text: string) {
  const patterns = [
    /^(.+?)\s+(\d+)$/, // "午餐 120"
    /^(.+?)\+(\d+)$/, // "午餐+120"
    /^(.+?)：(\d+)$/, // "午餐：120"
    /^(.+?)\$(\d+)$/, // "午餐$120"
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return {
        item: match[1].trim(),
        amount: Number.parseInt(match[2]),
      }
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-line-signature")

    if (!signature || !verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)

    for (const event of data.events) {
      if (event.type === "message" && event.message.type === "text") {
        const messageText = event.message.text
        const userId = event.source.userId
        const displayName = event.source.displayName

        // 取得或建立用戶
        const user = await getOrCreateUser(userId, displayName)
        if (!user) continue

        // 檢查用戶是否已完成初始設定
        const isSetupComplete = await checkUserSetup(user.id)

        // 處理不同類型的訊息
        if (messageText === "記帳" || messageText === "開始記帳") {
          if (!isSetupComplete) {
            // 用戶尚未設定初始資產，引導設定
            await replyMessage(event.replyToken, [generateInitialSetupMessage()])
          } else {
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "歡迎使用記帳小豆腐！🧾\n\n您可以：\n• 直接輸入「項目 金額」記錄支出\n• 例如：午餐 120\n• 輸入「報表」查看本月統計\n• 輸入「明細」查看最近記錄\n• 輸入「資產」管理資產項目",
              },
            ])
          }
        } else if (messageText === "報表") {
          // 取得本月統計
          const stats = await getMonthlyStats(user.id)

          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: `📊 本月記帳報表\n\n💰 總收入：NT$ ${stats.totalIncome.toLocaleString()}\n💸 總支出：NT$ ${stats.totalExpense.toLocaleString()}\n💳 未知支出：NT$ ${stats.unknownExpense.toLocaleString()}\n💎 淨資產：NT$ ${stats.netAsset.toLocaleString()}\n\n詳細報表請查看：https://accounting-linebot-ruby.vercel.app/report`,
            },
          ])
        } else if (messageText === "資產") {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "💰 資產管理\n\n請輸入要新增或更新的資產：\n\n格式：項目名稱 金額\n例如：\n• 現金 5000\n• 台新銀行 50000\n• 股票 120000\n• 信用卡債 25000\n\n或前往網頁版進行詳細管理：\nhttps://accounting-linebot-ruby.vercel.app/report",
            },
          ])
        } else {
          if (!isSetupComplete) {
            // 用戶尚未完成設定，嘗試解析資產記錄
            const asset = parseAssetMessage(messageText)
            if (asset) {
              const { data: savedAsset, error } = await saveAsset(user.id, asset.category, asset.amount, asset.type)

              if (error) {
                await replyMessage(event.replyToken, [
                  {
                    type: "text",
                    text: "記錄失敗，請稍後再試！",
                  },
                ])
              } else {
                await replyMessage(event.replyToken, [
                  {
                    type: "text",
                    text: `✅ 資產記錄成功！\n\n${asset.category}：NT$ ${asset.amount.toLocaleString()}\n類型：${asset.type === "asset" ? "資產" : "負債"}\n\n請繼續輸入其他資產項目，或輸入「完成設定」開始記帳。`,
                  },
                ])
              }
            } else {
              await replyMessage(event.replyToken, [
                {
                  type: "text",
                  text: "請先完成資產設定再開始記帳！\n\n格式：項目名稱 金額\n例如：現金 5000\n\n或輸入「記帳」查看設定說明。",
                },
              ])
            }
          } else {
            // 用戶已完成設定，處理一般記帳
            const expense = parseExpenseMessage(messageText)
            if (expense) {
              // 儲存支出記錄的邏輯...
              await replyMessage(event.replyToken, [
                {
                  type: "text",
                  text: `✅ 記錄成功！\n\n項目：${expense.item}\n金額：NT$ ${expense.amount}\n時間：${new Date().toLocaleString("zh-TW")}`,
                },
              ])
            } else {
              // 嘗試解析資產記錄
              const asset = parseAssetMessage(messageText)
              if (asset) {
                const { data: savedAsset, error } = await saveAsset(user.id, asset.category, asset.amount, asset.type)

                if (!error) {
                  await replyMessage(event.replyToken, [
                    {
                      type: "text",
                      text: `✅ 資產更新成功！\n\n${asset.category}：NT$ ${asset.amount.toLocaleString()}\n類型：${asset.type === "asset" ? "資產" : "負債"}`,
                    },
                  ])
                } else {
                  await replyMessage(event.replyToken, [
                    {
                      type: "text",
                      text: "更新失敗，請稍後再試！",
                    },
                  ])
                }
              } else {
                await replyMessage(event.replyToken, [
                  {
                    type: "text",
                    text: "請輸入正確格式：\n• 支出：項目 金額（例如：午餐 120）\n• 資產：項目 金額（例如：現金 5000）\n• 或輸入「記帳」查看使用說明",
                  },
                ])
              }
            }
          }
        }
      } else if (event.type === "postback") {
        const postbackData = event.postback.data
        const userId = event.source.userId

        if (postbackData === "start_asset_setup") {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "🏦 開始設定資產\n\n請依序輸入您的資產項目：\n\n1️⃣ 現金 金額\n2️⃣ 銀行名稱 餘額\n3️⃣ 股票 現值\n4️⃣ 信用卡 欠款\n\n範例：現金 5000\n\n輸入完成後，請輸入「完成設定」。",
            },
          ])
        } else if (postbackData === "skip_asset_setup") {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "⚠️ 已跳過資產設定\n\n您可以隨時輸入「資產」來管理資產項目。\n\n現在可以開始記帳了！\n輸入格式：項目 金額\n例如：午餐 120",
            },
          ])
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 取得本月統計（需要實作）
async function getMonthlyStats(userId: number) {
  // 實作統計邏輯...
  return {
    totalIncome: 45000,
    totalExpense: 25680,
    unknownExpense: 3240,
    netAsset: 298000,
  }
}
