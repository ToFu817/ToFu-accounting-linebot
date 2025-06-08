import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, Calendar, CreditCard } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">記帳小豆腐</h1>
          <p className="text-lg text-gray-600">您的智能記帳助手管理後台</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月支出</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NT$ 25,680</div>
              <p className="text-xs text-muted-foreground">+12% 較上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月收入</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NT$ 45,000</div>
              <p className="text-xs text-muted-foreground">薪資 + 其他收入</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">淨資產</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NT$ 285,420</div>
              <p className="text-xs text-muted-foreground">包含股票現值</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未知支出</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NT$ 3,240</div>
              <p className="text-xs text-muted-foreground">需要檢查的支出</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>系統設定</CardTitle>
              <CardDescription>配置您的記帳小豆腐設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                設定 LINE Bot Webhook
              </Button>
              <Button className="w-full" variant="outline">
                連結 LINE Pay API
              </Button>
              <Button className="w-full" variant="outline">
                設定每月提醒時間
              </Button>
              <Button className="w-full" variant="outline">
                管理銀行帳戶設定
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速功能</CardTitle>
              <CardDescription>常用的管理功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">查看本月報表</Button>
              <Button className="w-full" variant="outline">
                匯出資料
              </Button>
              <Button className="w-full" variant="outline">
                用戶管理
              </Button>
              <Button className="w-full" variant="outline">
                系統日誌
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>最近活動</CardTitle>
            <CardDescription>用戶最近的記帳活動</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">用戶 A - 午餐支出</p>
                  <p className="text-sm text-gray-600">2024-01-15 12:30</p>
                </div>
                <span className="text-red-600 font-medium">-NT$ 120</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">用戶 B - LINE Pay 自動記錄</p>
                  <p className="text-sm text-gray-600">2024-01-15 10:15</p>
                </div>
                <span className="text-red-600 font-medium">-NT$ 85</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">用戶 C - 薪資收入</p>
                  <p className="text-sm text-gray-600">2024-01-15 09:00</p>
                </div>
                <span className="text-green-600 font-medium">+NT$ 45,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
