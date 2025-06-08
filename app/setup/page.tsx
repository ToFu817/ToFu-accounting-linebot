"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, ExternalLink } from "lucide-react"

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({
    channelSecret: "",
    channelAccessToken: "",
    webhookUrl: "",
    linePayChannelId: "",
    linePayChannelSecret: "",
  })

  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/webhook`
  const linePayWebhookUrl = `${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/linepay/webhook`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">記帳小豆腐 - 系統設定</h1>
          <p className="text-gray-600">請按照以下步驟完成系統設定</p>
        </div>

        <div className="space-y-6">
          {/* 步驟 1: LINE Bot 設定 */}
          <Card className={step >= 1 ? "border-blue-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step > 1 && <CheckCircle className="h-5 w-5 text-green-500" />}
                步驟 1: LINE Bot 基本設定
              </CardTitle>
              <CardDescription>設定您的 LINE Bot Channel Secret 和 Access Token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  請到{" "}
                  <a
                    href="https://developers.line.biz/console/"
                    target="_blank"
                    className="text-blue-600 underline"
                    rel="noreferrer"
                  >
                    LINE Developers Console
                  </a>{" "}
                  取得以下資訊
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="channelSecret">Channel Secret</Label>
                  <Input
                    id="channelSecret"
                    value={config.channelSecret}
                    onChange={(e) => setConfig({ ...config, channelSecret: e.target.value })}
                    placeholder="請輸入 Channel Secret"
                  />
                </div>

                <div>
                  <Label htmlFor="channelAccessToken">Channel Access Token</Label>
                  <Input
                    id="channelAccessToken"
                    value={config.channelAccessToken}
                    onChange={(e) => setConfig({ ...config, channelAccessToken: e.target.value })}
                    placeholder="請輸入 Channel Access Token"
                  />
                </div>

                <div>
                  <Label>Webhook URL</Label>
                  <div className="flex items-center gap-2">
                    <Input value={webhookUrl} readOnly />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">請將此 URL 設定到 LINE Developers Console 的 Webhook URL</p>
                </div>
              </div>

              {step === 1 && (
                <Button onClick={() => setStep(2)} className="w-full">
                  下一步：LINE Pay 設定
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 步驟 2: LINE Pay 設定 */}
          {step >= 2 && (
            <Card className={step >= 2 ? "border-blue-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {step > 2 && <CheckCircle className="h-5 w-5 text-green-500" />}
                  步驟 2: LINE Pay 整合設定
                </CardTitle>
                <CardDescription>設定 LINE Pay 以自動記錄刷卡支出</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    請到{" "}
                    <a
                      href="https://pay.line.me/developers/"
                      target="_blank"
                      className="text-blue-600 underline"
                      rel="noreferrer"
                    >
                      LINE Pay Developers
                    </a>{" "}
                    申請並取得以下資訊
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linePayChannelId">LINE Pay Channel ID</Label>
                    <Input
                      id="linePayChannelId"
                      value={config.linePayChannelId}
                      onChange={(e) => setConfig({ ...config, linePayChannelId: e.target.value })}
                      placeholder="請輸入 LINE Pay Channel ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linePayChannelSecret">LINE Pay Channel Secret</Label>
                    <Input
                      id="linePayChannelSecret"
                      value={config.linePayChannelSecret}
                      onChange={(e) => setConfig({ ...config, linePayChannelSecret: e.target.value })}
                      placeholder="請輸入 LINE Pay Channel Secret"
                    />
                  </div>

                  <div>
                    <Label>LINE Pay Webhook URL</Label>
                    <div className="flex items-center gap-2">
                      <Input value={linePayWebhookUrl} readOnly />
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(linePayWebhookUrl)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">請將此 URL 設定到 LINE Pay 的 Webhook URL</p>
                  </div>
                </div>

                {step === 2 && (
                  <Button onClick={() => setStep(3)} className="w-full">
                    下一步：環境變數設定
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* 步驟 3: 環境變數設定 */}
          {step >= 3 && (
            <Card className={step >= 3 ? "border-blue-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {step > 3 && <CheckCircle className="h-5 w-5 text-green-500" />}
                  步驟 3: 環境變數設定
                </CardTitle>
                <CardDescription>將以下環境變數加入到您的 .env.local 檔案</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <pre>{`# LINE Bot 設定
LINE_CHANNEL_SECRET=${config.channelSecret || "your_channel_secret"}
LINE_CHANNEL_ACCESS_TOKEN=${config.channelAccessToken || "your_channel_access_token"}

# LINE Pay 設定
LINE_PAY_CHANNEL_ID=${config.linePayChannelId || "your_linepay_channel_id"}
LINE_PAY_CHANNEL_SECRET=${config.linePayChannelSecret || "your_linepay_channel_secret"}

# 資料庫設定 (Supabase)
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key`}</pre>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(
                        `LINE_CHANNEL_SECRET=${config.channelSecret}\nLINE_CHANNEL_ACCESS_TOKEN=${config.channelAccessToken}\nLINE_PAY_CHANNEL_ID=${config.linePayChannelId}\nLINE_PAY_CHANNEL_SECRET=${config.linePayChannelSecret}`,
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    複製環境變數
                  </Button>

                  {step === 3 && <Button onClick={() => setStep(4)}>下一步：部署說明</Button>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 步驟 4: 部署說明 */}
          {step >= 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  步驟 4: 部署到 Vercel
                </CardTitle>
                <CardDescription>完成部署並開始使用記帳小豆腐</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">點擊右上角的 "Deploy" 按鈕</p>
                      <p className="text-sm text-gray-600">將專案部署到 Vercel</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">在 Vercel 設定環境變數</p>
                      <p className="text-sm text-gray-600">將上述環境變數加入到 Vercel 專案設定中</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">設定 Supabase 資料庫</p>
                      <p className="text-sm text-gray-600">執行 SQL 腳本建立必要的資料表</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">測試 LINE Bot</p>
                      <p className="text-sm text-gray-600">加入您的 LINE 官方帳號並測試記帳功能</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>重要提醒：</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>確保所有環境變數都已正確設定</li>
                      <li>LINE Bot 的 Webhook URL 必須是 HTTPS</li>
                      <li>定期備份您的資料庫</li>
                      <li>建議設定 Vercel Cron Jobs 來處理每月提醒</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button asChild>
                    <a href="https://supabase.com" target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      建立 Supabase 專案
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/report" target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      查看報表範例
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
