import { type NextRequest, NextResponse } from "next/server"

// LINE Pay Webhook 處理
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 驗證 LINE Pay 簽名（實際使用時需要實作）
    // const signature = request.headers.get('x-line-pay-signature')

    // 處理 LINE Pay 交易通知
    if (body.events) {
      for (const event of body.events) {
        if (event.type === "payment") {
          const transaction = event.info

          // 自動記錄支出到記帳系統
          const expenseData = {
            userId: transaction.payInfo.method.creditCard?.maskedCreditCardNumber || "unknown",
            amount: transaction.transaction.amount,
            currency: transaction.transaction.currency,
            merchantName: transaction.packages[0]?.name || "未知商家",
            transactionId: transaction.transactionId,
            timestamp: new Date().toISOString(),
          }

          // 發送記帳訊息給用戶的 LINE
          await sendAccountingMessage(expenseData)

          console.log("LINE Pay transaction recorded:", expenseData)
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("LINE Pay webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendAccountingMessage(expenseData: any) {
  // 這裡應該根據信用卡號或其他識別資訊找到對應的 LINE 用戶
  // 然後發送記帳訊息

  const message = {
    type: "text",
    text: `💳 LINE Pay 自動記帳\n\n商家：${expenseData.merchantName}\n金額：${expenseData.currency} ${expenseData.amount}\n時間：${new Date(expenseData.timestamp).toLocaleString("zh-TW")}\n\n已自動記錄為支出項目`,
  }

  // 實際發送邏輯需要根據用戶 ID 來推送訊息
  console.log("Would send message:", message)
}
