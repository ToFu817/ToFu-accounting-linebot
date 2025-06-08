import { type NextRequest, NextResponse } from "next/server"

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!

// 推送訊息給所有用戶
async function pushMessage(userId: string, messages: any[]) {
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages,
    }),
  })
  return response.json()
}

// 每月定時提醒
export async function GET(request: NextRequest) {
  try {
    // 這裡應該從資料庫獲取所有用戶 ID
    const userIds = ["USER_ID_1", "USER_ID_2"] // 示例用戶 ID

    const reminderMessage = {
      type: "template",
      altText: "每月記帳提醒 - 記帳小豆腐",
      template: {
        type: "carousel",
        columns: [
          {
            title: "📊 每月記帳提醒",
            text: "該記錄本月收入和資產了！",
            actions: [
              {
                type: "postback",
                label: "記錄收入",
                data: "monthly_income",
              },
              {
                type: "postback",
                label: "更新資產",
                data: "monthly_assets",
              },
              {
                type: "uri",
                label: "查看報表",
                uri: "https://your-domain.com/report",
              },
            ],
          },
          {
            title: "💰 本月統計",
            text: "快速查看本月記帳狀況",
            actions: [
              {
                type: "postback",
                label: "支出統計",
                data: "expense_summary",
              },
              {
                type: "postback",
                label: "未知支出",
                data: "unknown_expense",
              },
              {
                type: "postback",
                label: "設定提醒",
                data: "setting_reminder",
              },
            ],
          },
        ],
      },
    }

    // 發送提醒給所有用戶
    for (const userId of userIds) {
      await pushMessage(userId, [reminderMessage])
    }

    return NextResponse.json({
      status: "ok",
      message: `Sent monthly reminder to ${userIds.length} users`,
    })
  } catch (error) {
    console.error("Monthly reminder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
