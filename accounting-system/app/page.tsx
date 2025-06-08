"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Download, FileText } from "lucide-react"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

interface Asset {
  id: string
  name: string
  amount: number
  type: string
}

export default function AccountingSystem() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  // 預設分類
  const expenseCategories = ["餐飲", "交通", "購物", "娛樂", "醫療", "教育", "其他"]
  const incomeCategories = ["薪資", "獎金", "投資", "副業", "其他"]
  const assetTypes = ["現金", "銀行存款", "股票投資", "信用卡債", "其他"]

  // 初始化示例數據
  useEffect(() => {
    const sampleTransactions: Transaction[] = [
      { id: "1", type: "income", amount: 45000, category: "薪資", description: "月薪", date: "2024-01-01" },
      { id: "2", type: "expense", amount: 15000, category: "餐飲", description: "伙食費", date: "2024-01-02" },
      { id: "3", type: "expense", amount: 8000, category: "交通", description: "交通費", date: "2024-01-03" },
      { id: "4", type: "expense", amount: 2680, category: "購物", description: "日用品", date: "2024-01-04" },
    ]

    const sampleAssets: Asset[] = [
      { id: "1", name: "現金", amount: 15000, type: "現金" },
      { id: "2", name: "銀行存款", amount: 180000, type: "銀行存款" },
      { id: "3", name: "股票投資", amount: 120000, type: "股票投資" },
      { id: "4", name: "信用卡債", amount: -25000, type: "信用卡債" },
      { id: "5", name: "其他", amount: 8000, type: "其他" },
    ]

    setTransactions(sampleTransactions)
    setAssets(sampleAssets)
  }, [])

  // 計算統計數據
  const currentMonthIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0)

  // 支出分類統計
  const expenseByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  // 添加/編輯交易
  const handleSaveTransaction = (formData: FormData) => {
    const transaction: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      type: formData.get("type") as "income" | "expense",
      amount: Number(formData.get("amount")),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    }

    if (editingTransaction) {
      setTransactions((prev) => prev.map((t) => (t.id === editingTransaction.id ? transaction : t)))
    } else {
      setTransactions((prev) => [...prev, transaction])
    }

    setIsAddTransactionOpen(false)
    setEditingTransaction(null)
  }

  // 添加/編輯資產
  const handleSaveAsset = (formData: FormData) => {
    const asset: Asset = {
      id: editingAsset?.id || Date.now().toString(),
      name: formData.get("name") as string,
      amount: Number(formData.get("amount")),
      type: formData.get("type") as string,
    }

    if (editingAsset) {
      setAssets((prev) => prev.map((a) => (a.id === editingAsset.id ? asset : a)))
    } else {
      setAssets((prev) => [...prev, asset])
    }

    setIsAddAssetOpen(false)
    setEditingAsset(null)
  }

  // 刪除交易
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  // 刪除資產
  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">記帳小豆腐 - 財務報表</h1>
          <div className="flex justify-center gap-4 mt-4">
            <Select defaultValue="monthly">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">每月報表</SelectItem>
                <SelectItem value="yearly">年度報表</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              匯出 Excel
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              匯出 PDF
            </Button>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>本月收入</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">NT$ {currentMonthIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">薪資、獎金、其他</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>本月支出</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">NT$ {currentMonthExpense.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">生活支出總計</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>本月結餘</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                NT$ {(currentMonthIncome - currentMonthExpense).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">收入減去支出</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>淨資產</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">NT$ {totalAssets.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">總資產 - 總負債</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="transactions">交易記錄</TabsTrigger>
            <TabsTrigger value="assets">資產管理</TabsTrigger>
            <TabsTrigger value="reports">詳細報表</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 支出分類 */}
              <Card>
                <CardHeader>
                  <CardTitle>支出分類</CardTitle>
                  <CardDescription>本月支出項目分析</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(expenseByCategory).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span>{category}</span>
                      <Badge variant="secondary">NT$ {amount.toLocaleString()}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 資產配置 */}
              <Card>
                <CardHeader>
                  <CardTitle>資產配置</CardTitle>
                  <CardDescription>目前資產分布狀況</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center">
                      <span>{asset.name}</span>
                      <Badge
                        variant={asset.amount >= 0 ? "default" : "destructive"}
                        className={asset.amount >= 0 ? "bg-green-100 text-green-800" : ""}
                      >
                        NT$ {asset.amount.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">交易記錄</h2>
              <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增交易
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form action={handleSaveTransaction}>
                    <DialogHeader>
                      <DialogTitle>{editingTransaction ? "編輯交易" : "新增交易"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          類型
                        </Label>
                        <Select name="type" defaultValue={editingTransaction?.type || "expense"}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">收入</SelectItem>
                            <SelectItem value="expense">支出</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          金額
                        </Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          defaultValue={editingTransaction?.amount}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          分類
                        </Label>
                        <Select name="category" defaultValue={editingTransaction?.category}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...expenseCategories, ...incomeCategories].map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          描述
                        </Label>
                        <Input
                          id="description"
                          name="description"
                          defaultValue={editingTransaction?.description}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          日期
                        </Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          defaultValue={editingTransaction?.date}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">儲存</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                            {transaction.type === "income" ? "收入" : "支出"}
                          </Badge>
                          <span className="font-medium">{transaction.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}NT$ {transaction.amount.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTransaction(transaction)
                            setIsAddTransactionOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteTransaction(transaction.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">資產管理</h2>
              <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增資產
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form action={handleSaveAsset}>
                    <DialogHeader>
                      <DialogTitle>{editingAsset ? "編輯資產" : "新增資產"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          名稱
                        </Label>
                        <Input id="name" name="name" defaultValue={editingAsset?.name} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          金額
                        </Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          defaultValue={editingAsset?.amount}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          類型
                        </Label>
                        <Select name="type" defaultValue={editingAsset?.type}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {assetTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">儲存</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{asset.name}</span>
                          <Badge variant="outline">{asset.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${asset.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                          NT$ {asset.amount.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAsset(asset)
                            setIsAddAssetOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAsset(asset.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>收支趨勢</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">圖表功能開發中...</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>分類占比</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">圖表功能開發中...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
