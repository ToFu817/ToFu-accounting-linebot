"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

const monthlyData = [
  { month: "1月", income: 45000, expense: 25680, unknown: 3240 },
  { month: "2月", income: 45000, expense: 28900, unknown: 2100 },
  { month: "3月", income: 47000, expense: 26500, unknown: 4200 },
  { month: "4月", income: 45000, expense: 24800, unknown: 1800 },
  { month: "5月", income: 48000, expense: 29200, unknown: 3600 },
  { month: "6月", income: 45000, expense: 27100, unknown: 2900 },
]

const expenseCategories = [
  { name: "餐飲", value: 8500, color: "#8884d8" },
  { name: "交通", value: 3200, color: "#82ca9d" },
  { name: "購物", value: 6800, color: "#ffc658" },
  { name: "娛樂", value: 2400, color: "#ff7300" },
  { name: "其他", value: 4780, color: "#00ff88" },
]

const assetData = [
  { category: "現金", amount: 15000 },
  { category: "銀行存款", amount: 180000 },
  { category: "股票現值", amount: 120000 },
  { category: "信用卡債", amount: -25000 },
  { category: "其他", amount: 8000 },
]

export default function ReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">記帳小豆腐 - 財務報表</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">每月報表</SelectItem>
                <SelectItem value="quarterly">每季報表</SelectItem>
                <SelectItem value="halfyearly">半年報表</SelectItem>
                <SelectItem value="yearly">年度報表</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">匯出 Excel</Button>
            <Button variant="outline">匯出 PDF</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="income-expense">收支分析</TabsTrigger>
            <TabsTrigger value="assets">資產分析</TabsTrigger>
            <TabsTrigger value="trends">趨勢分析</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">本月總收入</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">NT$ 45,000</div>
                  <p className="text-xs text-gray-500">薪資 + 股票 + 其他</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">本月總支出</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">NT$ 25,680</div>
                  <p className="text-xs text-gray-500">已知支出統計</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">未知支出</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">NT$ 3,240</div>
                  <p className="text-xs text-gray-500">需要檢查的支出</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">淨資產</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">NT$ 298,000</div>
                  <p className="text-xs text-gray-500">總資產 - 總負債</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>支出分類</CardTitle>
                  <CardDescription>本月支出項目分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: NT$ ${value.toLocaleString()}`}
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>資產配置</CardTitle>
                  <CardDescription>目前資產分布狀況</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assetData.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{asset.category}</span>
                        <span className={`text-sm font-bold ${asset.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                          NT$ {asset.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="income-expense" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>收支對比圖</CardTitle>
                <CardDescription>過去6個月收入與支出趨勢</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#10b981" name="收入" />
                    <Bar dataKey="expense" fill="#ef4444" name="支出" />
                    <Bar dataKey="unknown" fill="#f59e0b" name="未知支出" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>銀行存款明細</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>台新銀行</span>
                      <span className="font-bold">NT$ 65,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>聯邦銀行</span>
                      <span className="font-bold">NT$ 48,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>國泰銀行</span>
                      <span className="font-bold">NT$ 32,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>永豐銀行</span>
                      <span className="font-bold">NT$ 35,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>股票投資狀況</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">股票現值</p>
                        <p className="text-sm text-gray-600">市場價值</p>
                      </div>
                      <span className="font-bold">NT$ 120,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">股票成本</p>
                        <p className="text-sm text-gray-600">購買成本</p>
                      </div>
                      <span className="font-bold">NT$ 110,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <div>
                        <p className="font-medium">未實現損益</p>
                        <p className="text-sm text-gray-600">本月變化</p>
                      </div>
                      <span className="font-bold text-green-600">+NT$ 10,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>淨資產趨勢</CardTitle>
                <CardDescription>過去6個月淨資產變化</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={monthlyData.map((item) => ({
                      ...item,
                      netAsset: item.income - item.expense,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="netAsset" stroke="#8884d8" strokeWidth={2} name="淨資產變化" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
