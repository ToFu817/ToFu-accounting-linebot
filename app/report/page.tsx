"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Plus, Trash2, Save } from "lucide-react"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface ExpenseItem {
  id: number
  category: string
  amount: number
  description?: string
  transaction_date: string
}

interface AssetItem {
  id: number
  category: string
  amount: number
  type: "asset" | "debt"
}

export default function ReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null)
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isAddingAsset, setIsAddingAsset] = useState(false)
  const [stats, setStats] = useState({
    totalIncome: 45000,
    totalExpense: 25680,
    unknownExpense: 3240,
    netAsset: 298000,
  })

  // 載入數據
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 這裡應該從 API 載入真實數據
      // 暫時使用模擬數據
      setExpenses([
        { id: 1, category: "餐飲", amount: 8500, description: "各種餐費", transaction_date: "2024-01-15" },
        { id: 2, category: "交通", amount: 3200, description: "捷運、公車", transaction_date: "2024-01-14" },
        { id: 3, category: "購物", amount: 6800, description: "日用品", transaction_date: "2024-01-13" },
      ])

      setAssets([
        { id: 1, category: "現金", amount: 15000, type: "asset" },
        { id: 2, category: "台新銀行", amount: 65000, type: "asset" },
        { id: 3, category: "聯邦銀行", amount: 48000, type: "asset" },
        { id: 4, category: "股票現值", amount: 120000, type: "asset" },
        { id: 5, category: "信用卡債", amount: 25000, type: "debt" },
      ])
    } catch (error) {
      console.error("載入數據失敗:", error)
    }
  }

  const saveExpense = async (expense: Partial<ExpenseItem>) => {
    try {
      if (expense.id) {
        // 更新現有支出
        setExpenses((prev) =>
          prev.map((item) => (item.id === expense.id ? ({ ...item, ...expense } as ExpenseItem) : item)),
        )
      } else {
        // 新增支出
        const newExpense = {
          ...expense,
          id: Date.now(),
          transaction_date: expense.transaction_date || new Date().toISOString().split("T")[0],
        } as ExpenseItem
        setExpenses((prev) => [...prev, newExpense])
      }
      setEditingExpense(null)
      setIsAddingExpense(false)
      updateStats()
    } catch (error) {
      console.error("儲存支出失敗:", error)
    }
  }

  const deleteExpense = async (id: number) => {
    try {
      setExpenses((prev) => prev.filter((item) => item.id !== id))
      updateStats()
    } catch (error) {
      console.error("刪除支出失敗:", error)
    }
  }

  const saveAsset = async (asset: Partial<AssetItem>) => {
    try {
      if (asset.id) {
        // 更新現有資產
        setAssets((prev) => prev.map((item) => (item.id === asset.id ? ({ ...item, ...asset } as AssetItem) : item)))
      } else {
        // 新增資產
        const newAsset = {
          ...asset,
          id: Date.now(),
        } as AssetItem
        setAssets((prev) => [...prev, newAsset])
      }
      setEditingAsset(null)
      setIsAddingAsset(false)
      updateStats()
    } catch (error) {
      console.error("儲存資產失敗:", error)
    }
  }

  const deleteAsset = async (id: number) => {
    try {
      setAssets((prev) => prev.filter((item) => item.id !== id))
      updateStats()
    } catch (error) {
      console.error("刪除資產失敗:", error)
    }
  }

  const updateStats = () => {
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalAssets = assets.filter((a) => a.type === "asset").reduce((sum, asset) => sum + asset.amount, 0)
    const totalDebts = assets.filter((a) => a.type === "debt").reduce((sum, debt) => sum + debt.amount, 0)
    const netAsset = totalAssets - totalDebts

    setStats({
      totalIncome: 45000, // 這個應該從收入記錄計算
      totalExpense,
      unknownExpense: Math.max(0, 45000 - totalExpense - 5000),
      netAsset,
    })
  }

  const expenseCategories = expenses.map((exp) => ({
    name: exp.category,
    value: exp.amount,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  }))

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
            <Button onClick={() => loadData()}>重新載入</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="expenses">支出管理</TabsTrigger>
            <TabsTrigger value="assets">資產管理</TabsTrigger>
            <TabsTrigger value="trends">趨勢分析</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">本月總收入</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">NT$ {stats.totalIncome.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">薪資 + 股票 + 其他</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">本月總支出</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">NT$ {stats.totalExpense.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">已知支出統計</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">未知支出</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">NT$ {stats.unknownExpense.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">需要檢查的支出</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">淨資產</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">NT$ {stats.netAsset.toLocaleString()}</div>
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
                    {assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{asset.category}</span>
                        <span
                          className={`text-sm font-bold ${asset.type === "asset" ? "text-green-600" : "text-red-600"}`}
                        >
                          {asset.type === "debt" ? "-" : ""}NT$ {asset.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>支出管理</CardTitle>
                    <CardDescription>管理您的支出記錄</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddingExpense(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增支出
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{expense.category}</h3>
                        <p className="text-sm text-gray-600">{expense.description}</p>
                        <p className="text-xs text-gray-500">{expense.transaction_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">NT$ {expense.amount.toLocaleString()}</span>
                        <Button variant="outline" size="sm" onClick={() => setEditingExpense(expense)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteExpense(expense.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>資產管理</CardTitle>
                    <CardDescription>管理您的資產和負債</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddingAsset(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增資產
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{asset.category}</h3>
                        <p className="text-sm text-gray-600">{asset.type === "asset" ? "資產" : "負債"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${asset.type === "asset" ? "text-green-600" : "text-red-600"}`}>
                          {asset.type === "debt" ? "-" : ""}NT$ {asset.amount.toLocaleString()}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setEditingAsset(asset)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteAsset(asset.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>趨勢分析</CardTitle>
                <CardDescription>財務趨勢變化</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">趨勢分析功能開發中...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 編輯支出對話框 */}
      <Dialog
        open={!!editingExpense || isAddingExpense}
        onOpenChange={() => {
          setEditingExpense(null)
          setIsAddingExpense(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "編輯支出" : "新增支出"}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense}
            onSave={saveExpense}
            onCancel={() => {
              setEditingExpense(null)
              setIsAddingExpense(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 編輯資產對話框 */}
      <Dialog
        open={!!editingAsset || isAddingAsset}
        onOpenChange={() => {
          setEditingAsset(null)
          setIsAddingAsset(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAsset ? "編輯資產" : "新增資產"}</DialogTitle>
          </DialogHeader>
          <AssetForm
            asset={editingAsset}
            onSave={saveAsset}
            onCancel={() => {
              setEditingAsset(null)
              setIsAddingAsset(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ExpenseForm({
  expense,
  onSave,
  onCancel,
}: {
  expense: ExpenseItem | null
  onSave: (expense: Partial<ExpenseItem>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    category: expense?.category || "",
    amount: expense?.amount || 0,
    description: expense?.description || "",
    transaction_date: expense?.transaction_date || new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...expense, ...formData })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">項目</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="amount">金額</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">備註</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="date">日期</Label>
        <Input
          id="date"
          type="date"
          value={formData.transaction_date}
          onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
          required
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          儲存
        </Button>
      </DialogFooter>
    </form>
  )
}

function AssetForm({
  asset,
  onSave,
  onCancel,
}: {
  asset: AssetItem | null
  onSave: (asset: Partial<AssetItem>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    category: asset?.category || "",
    amount: asset?.amount || 0,
    type: asset?.type || ("asset" as "asset" | "debt"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...asset, ...formData })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">項目名稱</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="amount">金額</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="type">類型</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "asset" | "debt") => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asset">資產</SelectItem>
            <SelectItem value="debt">負債</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          儲存
        </Button>
      </DialogFooter>
    </form>
  )
}
