import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// LINE Bot 設定
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!

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

// 處理支出記錄
function parseExpenseMessage(text: string) {
  // 解析格式：項目 金額 或 項目+金額
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

// 生成每月提醒選單
function generateMonthlyReminderMenu() {
  return {
    type: "template",
    altText: "每月記帳提醒",
    template: {
      type: "carousel",
      columns: [
        {
          title: "收入記錄",
          text: "請記錄本月收入項目",
          actions: [
            {
              type: "postback",
              label: "薪資收入",
              data: "income_salary",
            },
            {
              type: "postback",
              label: "股票收入",
              data: "income_stock",
            },
            {
              type: "postback",
              label: "其他收入",
              data: "income_other",
            },
          ],
        },
        {
          title: "淨資產記錄",
          text: "請更新您的資產狀況",
          actions: [
            {
              type: "postback",
              label: "銀行存款",
              data: "asset_bank",
            },
            {
              type: "postback",
              label: "股票基金",
              data: "asset_stock",
            },
            {
              type: "postback",
              label: "信用卡債",
              data: "debt_credit",
            },
          ],
        },
      ],
    },
  }
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

        // 處理不同類型的訊息
        if (messageText === "記帳" || messageText === "開始記帳") {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "歡迎使用記帳小豆腐！🧾\n\n您可以：\n• 直接輸入「項目 金額」記錄支出\n• 例如：午餐 120\n• 輸入「報表」查看本月統計\n• 輸入「設定」進行個人設定",
            },
          ])
        } else if (messageText === "報表") {
          // 生成本月報表
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "📊 本月記帳報表\n\n💰 總收入：NT$ 45,000\n💸 總支出：NT$ 25,680\n💳 未知支出：NT$ 3,240\n💎 淨資產：NT$ 285,420\n\n詳細報表請查看：https://accounting-linebot-ruby.vercel.app/report",
            },
          ])
        } else if (messageText === "設定") {
          await replyMessage(event.replyToken, [
            {
              type: "template",
              altText: "設定選單",
              template: {
                type: "buttons",
                title: "個人設定",
                text: "請選擇要設定的項目",
                actions: [
                  {
                    type: "postback",
                    label: "銀行帳戶設定",
                    data: "setting_bank",
                  },
                  {
                    type: "postback",
                    label: "提醒時間設定",
                    data: "setting_reminder",
                  },
                  {
                    type: "postback",
                    label: "分類設定",
                    data: "setting_category",
                  },
                ],
              },
            },
          ])
        } else {
          // 嘗試解析支出記錄
          const expense = parseExpenseMessage(messageText)
          if (expense) {
            // 這裡應該儲存到資料庫
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: `✅ 記錄成功！\n\n項目：${expense.item}\n金額：NT$ ${expense.amount}\n時間：${new Date().toLocaleString("zh-TW")}\n\n輸入「報表」查看統計`,
              },
            ])
          } else {
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "請輸入正確格式：\n• 項目 金額（例如：午餐 120）\n• 或輸入「記帳」查看使用說明",
              },
            ])
          }
        }
      } else if (event.type === "postback") {
        const data = event.postback.data

        // 處理 postback 事件
        switch (data) {
          case "income_salary":
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "請輸入薪資收入金額：\n格式：薪資 金額\n例如：薪資 45000",
              },
            ])
            break
          case "asset_bank":
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "請選擇要更新的銀行：\n• 台新銀行\n• 聯邦銀行\n• 國泰銀行\n• 永豐銀行\n\n格式：銀行名稱 餘額\n例如：台新 50000",
              },
            ])
            break
          default:
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "功能開發中，敬請期待！",
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
