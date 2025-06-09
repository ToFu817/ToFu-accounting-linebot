"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Calculator, PieChart, TrendingUp, Wallet, CreditCard, DollarSign } from "lucide-react"

interface FinancialItem {
  id: string
  name: string
  amount: number
  category: string
  subcategory: string
}

export default function FinancePage() {
  const [items, setItems] = useState<FinancialItem[]>([
    // 資產示範資料
    { id: "1", name: "現金", amount: 5000, category: "資產", subcategory: "錢包" },
    { id: "2", name: "悠遊卡", amount: 500, category: "資產", subcategory: "錢包" },
    { id: "3", name: "LINE PAY MONEY", amount: 1200, category: "資產", subcategory: "錢包" },
    { id: "4", name: "郵局", amount: 50000, category: "資產", subcategory: "銀行存款" },
    { id: "5", name: "台新", amount: 80000, category: "資產", subcategory: "銀行存款" },
    { id: "6", name: "國泰", amount: 30000, category: "資產", subcategory: "銀行存款" },
    { id: "7", name: "房屋押金", amount: 20000, category: "資產", subcategory: "存出保證金" },
    { id: "8", name: "股票成本", amount: 100000, category: "資產", subcategory: "國泰證券" },
    { id: "9", name: "股票現值", amount: 105000, category: "資產", subcategory: "國泰證券" },

    // 負債示範資料
    { id: "10", name: "國泰信用卡", amount: 15000, category: "負債", subcategory: "應付信用卡款" },
    { id: "11", name: "台新信用卡", amount: 8000, category: "負債", subcategory: "應付信用卡款" },
    { id: "12", name: "學貸", amount: 200000, category: "負債", subcategory: "貸款" },

    // 收入示範資料
    { id: "13", name: "薪資", amount: 45000, category: "收入", subcategory: "本月總收入" },
    { id: "14", name: "租金", amount: 8000, category: "收入", subcategory: "本月總收入" },

    // 支出示範資料
    { id: "15", name: "房租", amount: 12000, category: "支出", subcategory: "固定支出" },
    { id: "16", name: "保險費", amount: 3000, category: "支出", subcategory: "固定支出" },
    { id: "17", name: "電話費", amount: 800, category: "支出", subcategory: "固定支出" },
    { id: "18", name: "伙食費", amount: 8000, category: "支出", subcategory: "已知變動支出" },
    { id: "19", name: "購物花費", amount: 5000, category: "支出", subcategory: "已知變動支出" },
    { id: "20", name: "交際費", amount: 3000, category: "支出", subcategory: "已知變動支出" },
  ])

  const [newItem, setNewItem] = useState({
    name: "",
    amount: 0,
    category: "資產",
    subcategory: "",
  })

  // 計算各項總額
  const calculateTotals = () => {
    const assets = items.filter((item) => item.category === "資產").reduce((sum, item) => sum + item.amount, 0)
    const liabilities = items.filter((item) => item.category === "負債").reduce((sum, item) => sum + item.amount, 0)
    const income = items.filter((item) => item.category === "收入").reduce((sum, item) => sum + item.amount, 0)
    const fixedExpenses = items
      .filter((item) => item.subcategory === "固定支出")
      .reduce((sum, item) => sum + item.amount, 0)
    const knownVariableExpenses = items
      .filter((item) => item.subcategory === "已知變動支出")
      .reduce((sum, item) => sum + item.amount, 0)

    const netAssets = assets - liabilities
    const totalExpenses = fixedExpenses + knownVariableExpenses
    const unknownExpenses = Math.max(0, income - totalExpenses - 1000)

    return {
      assets,
      liabilities,
      netAssets,
      income,
      fixedExpenses,
      knownVariableExpenses,
      unknownExpenses,
      totalExpenses: totalExpenses + unknownExpenses,
    }
  }

  const totals = calculateTotals()

  // 新增項目
  const addItem = () => {
    if (newItem.name && newItem.subcategory) {
      const item: FinancialItem = {
        id: Date.now().toString(),
        name: newItem.name,
        amount: newItem.amount,
        category: newItem.category,
        subcategory: newItem.subcategory,
      }
      setItems([...items, item])
      setNewItem({ name: "", amount: 0, category: "資產", subcategory: "" })
    }
  }

  // 刪除項目
  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  // 更新金額
  const updateAmount = (id: string, amount: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, amount } : item)))
  }

  // 按類別和子類別分組
  const groupedItems = (category: string) => {
    const categoryItems = items.filter((item) => item.category === category)
    const grouped: { [key: string]: FinancialItem[] } = {}

    categoryItems.forEach((item) => {
      if (!grouped[item.subcategory]) {
        grouped[item.subcategory] = []
      }
      grouped[item.subcategory].push(item)
    })

    return grouped
  }

  // 子類別選項
  const subcategoryOptions = {
    資產: ["錢包", "銀行存款", "存出保證金", "國泰證券", "台新證券", "應收股票款"],
    負債: ["應付信用卡款", "應付股票款", "欠款", "貸款"],
    收入: ["本月總收入"],
    支出: ["固定支出", "已知變動支出"],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 標題 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            記帳小豆腐 🧮
          </h1>
          <p className="text-lg text-gray-600">您的智能財務管理助手</p>
        </div>

        {/* 財務總覽 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總資產</CardTitle>
              <Wallet className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.assets.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總負債</CardTitle>
              <CreditCard className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.liabilities.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">淨資產</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.netAssets.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月收入</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.income.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已知支出</CardTitle>
              <Calculator className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totals.fixedExpenses + totals.knownVariableExpenses).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未知支出</CardTitle>
              <PieChart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.unknownExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要內容 */}
        <Card>
          <CardHeader>
            <CardTitle>財務科目管理</CardTitle>
            <CardDescription>管理您的資產、負債、收入和支出項目</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="資產" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="資產">資產</TabsTrigger>
                <TabsTrigger value="負債">負債</TabsTrigger>
                <TabsTrigger value="收入">收入</TabsTrigger>
                <TabsTrigger value="支出">支出</TabsTrigger>
              </TabsList>

              {["資產", "負債", "收入", "支出"].map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(groupedItems(category)).map(([subcategory, subcategoryItems]) => (
                      <AccordionItem key={subcategory} value={subcategory}>
                        <AccordionTrigger className="text-left">
                          <div className="flex justify-between items-center w-full mr-4">
                            <span className="font-medium">{subcategory}</span>
                            <span className="text-sm text-gray-500">
                              ${subcategoryItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {subcategoryItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <span className="font-medium">{item.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">$</span>
                                  <Input
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => updateAmount(item.id, Number(e.target.value))}
                                    className="w-24 text-right"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteItem(item.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>

            {/* 新增項目表單 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">新增項目</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="category">類別</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value, subcategory: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="資產">資產</SelectItem>
                        <SelectItem value="負債">負債</SelectItem>
                        <SelectItem value="收入">收入</SelectItem>
                        <SelectItem value="支出">支出</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">子類別</Label>
                    <Select
                      value={newItem.subcategory}
                      onValueChange={(value) => setNewItem({ ...newItem, subcategory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇子類別" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategoryOptions[newItem.category as keyof typeof subcategoryOptions]?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">項目名稱</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="輸入項目名稱"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">金額</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({ ...newItem, amount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button onClick={addItem} className="mt-4 w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  新增項目
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
