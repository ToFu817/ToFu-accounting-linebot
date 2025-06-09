# 部署指南

## 環境變數設定

在 Vercel 部署前，請確保設定以下環境變數：

### 必要環境變數

\`\`\`env
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LINE Bot 設定  
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_access_token

# LINE Pay 設定（可選）
LINEPAY_CHANNEL_ID=your_linepay_channel_id
LINEPAY_CHANNEL_SECRET=your_linepay_channel_secret
\`\`\`

## 部署步驟

### 方法一：v0 一鍵部署

1. 點擊右上角 **Deploy** 按鈕
2. 等待部署完成
3. 到 Vercel 控制台設定環境變數：
   - 進入專案設定
   - 點擊 **Environment Variables**
   - 逐一新增上述環境變數
4. 觸發重新部署

### 方法二：Vercel CLI

\`\`\`bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel --prod

# 設定環境變數
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add LINE_CHANNEL_SECRET
vercel env add LINE_CHANNEL_ACCESS_TOKEN
\`\`\`

### 方法三：GitHub 自動部署

1. 推送程式碼到 GitHub
2. 在 Vercel 連接 GitHub 倉庫
3. 在專案設定中新增環境變數
4. 觸發重新部署

## 驗證部署

部署完成後，訪問以下端點檢查狀態：

\`\`\`
https://your-app.vercel.app/api/health
\`\`\`

應該返回：
\`\`\`json
{
  "status": "ok",
  "configured": true,
  "environment": {
    "supabase": true,
    "lineBot": true,
    "linePay": true
  }
}
\`\`\`

## 常見問題

### 1. supabaseUrl is required 錯誤
- 確保設定了 \`NEXT_PUBLIC_SUPABASE_URL\`
- 注意前綴必須是 \`NEXT_PUBLIC_\`

### 2. LINE Bot 無法回應
- 檢查 \`LINE_CHANNEL_SECRET\` 和 \`LINE_CHANNEL_ACCESS_TOKEN\`
- 確認 Webhook URL 設定正確

### 3. 資料庫連接失敗
- 檢查 \`SUPABASE_SERVICE_ROLE_KEY\` 權限
- 確認 Supabase 專案狀態正常

## 取得環境變數

### Supabase
1. 登入 [supabase.com](https://supabase.com)
2. 選擇專案 → Settings → API
3. 複製 URL 和 service_role key

### LINE Developers
1. 登入 [developers.line.biz](https://developers.line.biz)
2. 選擇 Provider → Channel
3. 在 Basic settings 找到 Channel secret
4. 在 Messaging API 找到 Channel access token

### LINE Pay
1. 登入 LINE Pay 商家後台
2. 取得 Channel ID 和 Channel Secret
\`\`\`
