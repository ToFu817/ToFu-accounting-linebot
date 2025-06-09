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
import { Pencil, Plus, Trash2, Save, RefreshCw } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { createClient } from "@supabase/supabase-js"

// Supabase 設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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
  asset_type: "asset" | "debt"
}

interface IncomeItem {
  id: number
  category: string
  amount: number
  income_date: string
}

export default function ReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [incomes, setIncomes] = useState<IncomeItem[]>([])
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null)
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null)
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isAddingAsset, setIsAddingAsset] = useState(false)
  const [isAddingIncome, setIsAddingIncome] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    unknownExpense: 0,
    netAsset: 0,
  })

  // 載入數據
  useEffect(() => {
    // 從 URL 參數獲取 userId，或使用預設值
    const urlParams = new URLSearchParams(window.location.search)
    const userIdParam = urlParams.get("userId")
    const defaultUserId = userIdParam ? Number.parseInt(userIdParam) : 1 // 預設用戶 ID

    setUserId(defaultUserId)
    loadData(defaultUserId)
  }, [])

  const loadData = async (userIdToLoad: number) => {
    setLoading(true)
    try {
      // 載入支出記錄
      const { data: expenseData } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userIdToLoad)
        .order("created_at", { ascending: false })

      // 載入資產記錄
      const { data: assetData } = await supabase.from("assets").select("*").eq("user_id", userIdToLoad)

      // 載入收入記錄
      const { data: incomeData } = await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", userIdToLoad)
        .order("created_at", { ascending: false })

      setExpenses(expenseData || [])
      setAssets(assetData || [])
      setIncomes(incomeData || [])

      // 計算統計數據
      updateStats(expenseData || [], assetData || [], incomeData || [])
    } catch (error) {
      console.error("載入數據失敗:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveExpense = async (expense: Partial<ExpenseItem>) => {
    if (!userId) return

    try {
      if (expense.id) {
        // 更新現有支出
        const { data, error } = await supabase
          .from("expenses")
          .update({
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
            transaction_date: expense.transaction_date,
          })
          .eq("id", expense.id)
          .select()
          .single()

        if (!error) {
          setExpenses((prev) => prev.map((item) => (item.id === expense.id ? data : item)))
        }
      } else {
        // 新增支出
        const { data, error } = await supabase
          .from("expenses")
          .insert([
            {
              user_id: userId,
              category: expense.category,
              amount: expense.amount,
              description: expense.description,
              transaction_date: expense.transaction_date || new Date().toISOString().split("T")[0],
            },
          ])
          .select()
          .single()

        if (!error) {
          setExpenses((prev) => [data, ...prev])
        }
      }

      setEditingExpense(null)
      setIsAddingExpense(false)
      loadData(userId) // 重新載入數據以更新統計
    } catch (error) {
      console.error("儲存支出失敗:", error)
    }
  }

  const deleteExpense = async (id: number) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id)

      if (!error) {
        setExpenses((prev) => prev.filter((item) => item.id !== id))
        if (userId) loadData(userId) // 重新載入數據以更新統計
      }
    } catch (error) {
      console.error("刪除支出失敗:", error)
    }
  }

  const saveAsset = async (asset: Partial<AssetItem>) => {
    if (!userId) return

    try {
      if (asset.id) {
        // 更新現有資產
        const { data, error } = await supabase
          .from("assets")
          .update({
            category: asset.category,
            amount: asset.amount,
            asset_type: asset.asset_type,
          })
          .eq("id", asset.id)
          .select()
          .single()

        if (!error) {
          setAssets((prev) => prev.map((item) => (item.id === asset.id ? data : item)))
        }
      } else {
        // 新增資產
        const { data, error } = await supabase
          .from("assets")
          .insert([
            {
              user_id: userId,
              category: asset.category,
              amount: asset.amount,
              asset_type: asset.asset_type,
            },
          ])
          .select()
          .single()

        if (!error) {
          setAssets((prev) => [...prev, data])
        }
      }

      setEditingAsset(null)
      setIsAddingAsset(false)
      if (userId) loadData(userId) // 重新載入數據以更新統計
    } catch (error) {
      console.error("儲存資產失敗:", error)
    }
  }

  const deleteAsset = async (id: number) => {
    try {
      const { error } = await supabase.from("assets").delete().eq("id", id)

      if (!error) {
        setAssets((prev) => prev.filter((item) => item.id !== id))
        if (userId) loadData(userId) // 重新載入數據以更新統計
      }
    } catch (error) {
      console.error("刪除資產失敗:", error)
    }
  }

  const saveIncome = async (income: Partial<IncomeItem>) => {
    if (!userId) return

    try {
      if (income.id) {
        // 更新現有收入
        const { data, error } = await supabase
          .from("incomes")
          .update({
            category: income.category,
            amount: income.amount,
            income_date: income.income_date,
          })
          .eq("id", income.id)
          .select()
          .single()

        if (!error) {
          setIncomes((prev) => prev.map((item) => (item.id === income.id ? data : item)))
        }
      } else {
        // 新增收入
        const { data, error } = await supabase
          .from("incomes")
          .insert([
            {
              user_id: userId,
              category: income.category,
              amount: income.amount,
              income_date: income.income_date || new Date().toISOString().split("T")[0],
            },
          ])
          .select()
          .single()

        if (!error) {
          setIncomes((prev) => [data, ...prev])
        }
      }

      setEditingIncome(null)
      setIsAddingIncome(false)
      if (userId) loadData(userId) // 重新載入數據以更新統計
    } catch (error) {
      console.error("儲存收入失敗:", error)
    }
  }

  const deleteIncome = async (id: number) => {
    try {
      const { error } = await supabase.from("incomes").delete().eq("id", id)

      if (!error) {
        setIncomes((prev) => prev.filter((item) => item.id !== id))
        if (userId) loadData(userId) // 重新載入數據以更新統計
      }
    } catch (error) {
      console.error("刪除收入失敗:", error)
    }
  }

  const updateStats = (expenseData: ExpenseItem[], assetData: AssetItem[], incomeData: IncomeItem[]) => {
    const totalExpense = expenseData.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const totalIncome = incomeData.reduce((sum, inc) => sum + Number(inc.amount), 0)
    const totalAssets = assetData
      .filter((a) => a.asset_type === "asset")
      .reduce((sum, asset) => sum + Number(asset.amount), 0)
    const totalDebts = assetData
      .filter((a) => a.asset_type === "debt")
      .reduce((sum, debt) => sum + Number(debt.amount), 0)
    const netAsset = totalAssets - totalDebts

    // 計算未知支出
    const unknownExpense = Math.max(0, totalIncome - totalExpense)

    setStats({
      totalIncome,
      totalExpense,
      unknownExpense,
      netAsset,
    })
  }

  const expenseCategories = expenses.reduce(
    (acc, exp) => {
      const existing = acc.find((item) => item.name === exp.category)
      if (existing) {
        existing.value += Number(exp.amount)
      } else {
        acc.push({
          name: exp.category,
          value: Number(exp.amount),
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        })
      }
      return acc
    },
    [] as { name: string; value: number; color: string }[],
  )

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
            <Button onClick={() => userId && loadData(userId)} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              重新載入
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="expenses">支出管理</TabsTrigger>
            <TabsTrigger value="incomes">收入管理</TabsTrigger>
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
                  {expenseCategories.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">尚無支出記錄</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>資產配置</CardTitle>
                  <CardDescription>目前資產分布狀況</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assets.length > 0 ? (
                      assets.map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{asset.category}</span>
                          <span
                            className={`text-sm font-bold ${asset.asset_type === "asset" ? "text-green-600" : "text-red-600"}`}
                          >
                            {asset.asset_type === "debt" ? "-" : ""}NT$ {Number(asset.amount).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4">尚無資產記錄</div>
                    )}
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
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{expense.category}</h3>
                          <p className="text-sm text-gray-600">{expense.description}</p>
                          <p className="text-xs text-gray-500">{expense.transaction_date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">NT$ {Number(expense.amount).toLocaleString()}</span>
                          <Button variant="outline" size="sm" onClick={() => setEditingExpense(expense)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteExpense(expense.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-8">尚無支出記錄</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incomes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>收入管理</CardTitle>
                    <CardDescription>管理您的收入記錄</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddingIncome(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增收入
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomes.length > 0 ? (
                    incomes.map((income) => (
                      <div key={income.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{income.category}</h3>
                          <p className="text-xs text-gray-500">{income.income_date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">NT$ {Number(income.amount).toLocaleString()}</span>
                          <Button variant="outline" size="sm" onClick={() => setEditingIncome(income)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteIncome(income.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-8">尚無收入記錄</div>
                  )}
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
                  {assets.length > 0 ? (
                    assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{asset.category}</h3>
                          <p className="text-sm text-gray-600">{asset.asset_type === "asset" ? "資產" : "負債"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${asset.asset_type === "asset" ? "text-green-600" : "text-red-600"}`}
                          >
                            {asset.asset_type === "debt" ? "-" : ""}NT$ {Number(asset.amount).toLocaleString()}
                          </span>
                          <Button variant="outline" size="sm" onClick={() => setEditingAsset(asset)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteAsset(asset.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-8">尚無資產記錄</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>收支趨勢</CardTitle>
                <CardDescription>收入與支出趨勢分析</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={[{ name: "本月", income: stats.totalIncome, expense: stats.totalExpense }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#10b981" name="收入" />
                    <Bar dataKey="expense" fill="#ef4444" name="支出" />
                  </BarChart>
                </ResponsiveContainer>
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

      {/* 編輯收入對話框 */}
      <Dialog
        open={!!editingIncome || isAddingIncome}
        onOpenChange={() => {
          setEditingIncome(null)
          setIsAddingIncome(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIncome ? "編輯收入" : "新增收入"}</DialogTitle>
          </DialogHeader>
          <IncomeForm
            income={editingIncome}
            onSave={saveIncome}
            onCancel={() => {
              setEditingIncome(null)
              setIsAddingIncome(false)
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

function IncomeForm({
  income,
  onSave,
  onCancel,
}: {
  income: IncomeItem | null
  onSave: (income: Partial<IncomeItem>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    category: income?.category || "",
    amount: income?.amount || 0,
    income_date: income?.income_date || new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...income, ...formData })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">收入項目</Label>
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
        <Label htmlFor="date">日期</Label>
        <Input
          id="date"
          type="date"
          value={formData.income_date}
          onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
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
    asset_type: asset?.asset_type || ("asset" as "asset" | "debt"),
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
          value={formData.asset_type}
          onValueChange={(value: "asset" | "debt") => setFormData({ ...formData, asset_type: value })}
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
