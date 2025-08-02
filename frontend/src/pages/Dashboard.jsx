/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  FileText,
  Scan,
  CheckCircle,
  Calendar,
  Edit3,
  Sparkles,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart,
  Pie,
  Cell,
  Tooltip,LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router";


export default function Component() {
  // Manual transaction form state
  const [manualAmount, setManualAmount] = useState("")
  const [manualType, setManualType] = useState("")
  const [manualDescription, setManualDescription] = useState("")
  const [manualCategory, setManualCategory] = useState("")
  const [manualDate, setManualDate] = useState("")
  const [manualNotes, setManualNotes] = useState("")
  const [manualError, setManualError] = useState("")
  const [manualSuccess, setManualSuccess] = useState("")
  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("")
  const [transactions, setTransactions] = useState([])
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [isTxnDialogOpen, setIsTxnDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState([])
  const [showExtractedData, setShowExtractedData] = useState(false)
  const [allTransactions, setAllTransactions] = useState([]);
  const [chartPage, setChartPage] = useState(1);
  const [totals, setTotals] = useState({ total_income: 0, total_expense: 0, balance: 0 });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const navigate = useNavigate();
  useEffect(() => {
    const hasToken = document.cookie.split(";").some((c) => c.trim().startsWith("access_token="));
    if (!hasToken) {
      navigate("/auth", { replace: true });
      return;
    }

    const token = getAccessToken();
    if (token) {
      fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) setUserId(data.id);
          if (data && data.username) setUserName(data.username);
          else if (data && data.email) setUserName(data.email);
        })
        .catch(() => {});

      // Fetch paginated transactions for table
      fetch(`http://localhost:8000/transactions?skip=${(page - 1) * pageSize}&limit=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setTransactions(data);
        })
        .catch(() => {});

      // Fetch all transactions for graph and totals
      fetch("http://localhost:8000/transactions/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllTransactions(data);
            // Calculate totals from all transactions
            const total_income = data.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
            const total_expense = data.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
            setTotals({
              total_income,
              total_expense,
              balance: total_income - total_expense
            });
          }
        })
        .catch(() => {});
    }
  }, [navigate, page]);


  // Get current time for greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
  const greetingMessage = userName ? `${getCurrentGreeting()}, ${userName}!` : `${getCurrentGreeting()}!`;


  // Helper to get access_token from cookie
  function getAccessToken() {
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/)
    return match ? match[1] : null
  }

  // Handle manual transaction submit
  async function handleManualSubmit(e) {
    e.preventDefault()
    setManualError("")
    setManualSuccess("")
    const token = getAccessToken()
    if (!token) {
      setManualError("Not authenticated. Please log in again.")
      return
    }

    try {
      const res = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const userData = await res.json()
      if (!userData.id) throw new Error("Failed to get user id")
      setUserId(userData.id)

      const res2 = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userData.id,
          amount: Number.parseFloat(manualAmount),
          type: manualType,
          description: manualDescription,
          category: manualCategory,
          date: manualDate,
          notes: manualNotes,
        }),
      })

      const data = await res2.json()
      if (!res2.ok) throw new Error(data.detail || "Failed to add transaction")

      setTransactions((prev) => [...prev, data])
      setManualSuccess("Transaction added!")
      setManualAmount("")
      setManualType("")
      setManualDescription("")
      setManualCategory("")
      setManualDate("")
      setManualNotes("")
    } catch (err) {
      setManualError(err.message)
    }
  }

  const totalIncome = totals?.total_income ?? 0;
  const totalExpense = totals?.total_expense ?? 0;
  const balance = totals?.balance ?? 0;

  // Use allTransactions for graph data
  const groupedData = allTransactions.reduce((acc, txn) => {
    if (!acc[txn.date]) {
      acc[txn.date] = { date: txn.date, income: 0, expense: 0 };
    }
    if (txn.type === "income") acc[txn.date].income += txn.amount;
    else acc[txn.date].expense += txn.amount;
    return acc;
  }, {});
  const lineData = Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));

  function updateExtractedField(index, field, value) {
  setExtractedData((prev) =>
    prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
  )
}
  // Handle update transaction
  async function handleUpdateTransaction(e, id) {
    e.preventDefault()
    setManualError("")
    setManualSuccess("")
    const token = getAccessToken()
    if (!token) {
      setManualError("Not authenticated. Please log in again.")
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number.parseFloat(manualAmount),
          type: manualType,
          description: manualDescription,
          category: manualCategory,
          date: manualDate,
          notes: manualNotes,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to update transaction")

      setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)))
      setManualSuccess("Transaction updated!")
      setIsTxnDialogOpen(false)
    } catch (err) {
      setManualError(err.message)
    }
  }

  useEffect(() => {
    // Check for access_token in cookies
    const hasToken = document.cookie.split(";").some((c) => c.trim().startsWith("access_token="))
    if (!hasToken) {
      // navigate('/auth');
      return
    }

    // Fetch user_id from /users/me on mount
    const token = getAccessToken()
    if (token) {
      fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) setUserId(data.id)
        })
        .catch(() => {})

      // Fetch all transactions
      fetch("http://localhost:8000/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data[0])
          if (Array.isArray(data)) setTransactions(data)
        })
        .catch(() => {})
    }
  }, [])

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setUploadProgress(0);
    setManualError("");
    setManualSuccess("");
    setExtractedData([]);
    setShowExtractedData(false);

    // Simulate progress bar
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated. Please log in again.");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:8000/transactions/parse-receipt", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to parse receipt");
      }
      const data = await res.json();
      // data is expected to be a JSON object or array
      // If it's a single object, wrap in array for consistency
      const arr = Array.isArray(data) ? data : [data];
      setExtractedData(arr);
      // Pre-fill manual form with first extracted item
     setExtractedData(
        arr.map((item) => ({
          ...item,
          description: item.description || "",
          category: item.suggested_category || "",
          type: "expense", // default
          notes: "",
        }))
      )
      setShowExtractedData(true);
      setManualSuccess("Receipt parsed! Please review and confirm.");
    } catch (err) {
      setManualError(err.message);
    } finally {
      setIsProcessing(false);
      setUploadProgress(100);
    }
  };

  async function handleDeleteTransaction(id) {
    const token = getAccessToken()
    if (!token) return
    try {
      const res = await fetch(`http://localhost:8000/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete transaction")
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      setIsTxnDialogOpen(false)
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload({ target: { files } })
    }
  }

  // ...removed duplicate groupedData and lineData based on transactions...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full mx-auto p-6 space-y-8">
        {/* Modern Greeting Header */}
        <div className="relative overflow-hidden text-black">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-5">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
          <h1 className="text-4xl font-bold tracking-tight">{greetingMessage}</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Modern Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xl font-semibold opacity-90">Total Income</CardTitle>
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <TrendingUp className="h-10 w-10" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">₹{totalIncome.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xl font-semibold opacity-90">Total Expenses</CardTitle>
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <TrendingDown className="h-10 w-10" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">₹{totalExpense.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xl font-semibold opacity-90">Net Balance</CardTitle>
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Wallet className="h-10 w-10" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">₹{balance.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Grid View: Chart + Transaction List side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
             <Card className="shadow-xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-bold text-slate-800">
                    {chartPage === 1 ? "Financial Overview" : "Spending by Category"}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                    {chartPage === 1
                        ? "Daily income and expenses tracking"
                        : "Visual breakdown of expenses"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                    {chartPage === 1 ? (
                        <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <ChartContainer>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </ChartContainer>
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            name="Income"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            stroke="#ef4444"
                            name="Expenses"
                            strokeWidth={3}
                            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                        />
                        </LineChart>
                    ) : (
                        <PieChart>
                        <Pie
                            data={Object.entries(
                            allTransactions
                                .filter((txn) => txn.type === "expense")
                                .reduce((acc, txn) => {
                                acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
                                return acc;
                                }, {})
                            ).map(([name, value]) => ({ name, value }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {[
                            "#f87171",
                            "#fbbf24",
                            "#34d399",
                            "#60a5fa",
                            "#a78bfa",
                            "#f472b6",
                            "#cbd5e1",
                            ].map((color, index) => (
                            <Cell key={index} fill={color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        </PieChart>
                    )}
                    </ResponsiveContainer>
                </CardContent>

                <div className="flex justify-between items-center px-6 pb-4">
                    <Button
                    variant="outline"
                    disabled={chartPage === 1}
                    onClick={() => setChartPage(1)}
                    className="rounded-xl"
                    >
                    Previous
                    </Button>
                    <span className="text-sm text-slate-600">
                    {chartPage} / 2
                    </span>
                    <Button
                    variant="outline"
                    disabled={chartPage === 2}
                    onClick={() => setChartPage(2)}
                    className="rounded-xl"
                    >
                    Next
                    </Button>
                </div>
                </Card>


            {/* Transactions List */}
            <Card className="shadow-xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm  overflow-y-auto">
                <CardHeader className="pb-6">
                <div className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-800">Recent Transactions</CardTitle>
                        <CardDescription className="text-slate-600">Your latest financial activities</CardDescription>
                    </div>
                    <div>
                         <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={(open) => {
                        setIsAddDialogOpen(open)
                        if (!open) {
                            // Reset all fields when dialog closes
                            setManualAmount("")
                            setManualType("")
                            setManualDescription("")
                            setManualCategory("")
                            setManualDate("")
                            setManualNotes("")
                            setManualError("")
                            setManualSuccess("")
                            setActiveTab("manual")
                            setUploadProgress(0)
                            setIsProcessing(false)
                            setExtractedData([])
                            setShowExtractedData(false)
                        }
                        }}
                    >
                        <DialogTrigger asChild>
                        <Button className=" shadow-lg px-6 py-3 rounded-xl font-semibold">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Add Transaction
                        </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                            <PlusCircle className="w-6 h-6 text-blue-600" />
                            Add New Transaction
                            </DialogTitle>
                            <DialogDescription className="text-base">
                            Choose how you'd like to add your transaction - manually or by uploading a receipt/PDF
                            </DialogDescription>
                        </DialogHeader>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1">
                            <TabsTrigger value="manual" className="flex items-center gap-2 rounded-lg">
                                <Edit3 className="w-4 h-4" />
                                Manual Entry
                            </TabsTrigger>
                            <TabsTrigger value="pdf" className="flex items-center gap-2 rounded-lg">
                                <Scan className="w-4 h-4" />
                                PDF/Receipt Upload
                            </TabsTrigger>
                            </TabsList>
                            <TabsContent value="manual" className="space-y-6 mt-6">
                            <form onSubmit={handleManualSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manual-amount" className="text-sm font-semibold">
                                    Amount *
                                    </Label>
                                    <Input
                                    id="manual-amount"
                                    placeholder="0.00"
                                    type="number"
                                    value={manualAmount}
                                    onChange={(e) => setManualAmount(e.target.value)}
                                    required
                                    className="rounded-xl border-2 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manual-type" className="text-sm font-semibold">
                                    Type *
                                    </Label>
                                    <Select value={manualType} onValueChange={setManualType} required>
                                    <SelectTrigger className="rounded-xl border-2 focus:border-blue-500">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="manual-description" className="text-sm font-semibold">
                                    Description *
                                </Label>
                                <Input
                                    id="manual-description"
                                    placeholder="Transaction description"
                                    value={manualDescription ?? ""}
                                    onChange={(e) => setManualDescription(e.target.value)}
                                    required
                                    className="rounded-xl border-2 focus:border-blue-500"
                                />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manual-category" className="text-sm font-semibold">
                                    Category *
                                    </Label>
                                    <Select value={manualCategory ?? ""} onValueChange={setManualCategory} required>
                                    <SelectTrigger className="rounded-xl border-2 focus:border-blue-500">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                                        <SelectItem value="Transportation">Transportation</SelectItem>
                                        <SelectItem value="Shopping">Shopping</SelectItem>
                                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                                        <SelectItem value="Bills & Utilities">Bills & Utilities</SelectItem>
                                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                                        <SelectItem value="Income">Income</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manual-date" className="text-sm font-semibold">
                                    Date *
                                    </Label>
                                    <Input
                                    id="manual-date"
                                    type="date"
                                    value={manualDate ?? ""}
                                    onChange={(e) => setManualDate(e.target.value)}
                                    required
                                    className="rounded-xl border-2 focus:border-blue-500"
                                    />
                                </div>
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="manual-notes" className="text-sm font-semibold">
                                    Notes (Optional)
                                </Label>
                                <Input
                                    id="manual-notes"
                                    placeholder="Additional notes..."
                                    value={manualNotes ?? ""}
                                    onChange={(e) => setManualNotes(e.target.value)}
                                    className="rounded-xl border-2 focus:border-blue-500"
                                />
                                </div>
                                {manualError && (
                                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{manualError}</div>
                                )}
                                {manualSuccess && (
                                <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-xl">
                                    {manualSuccess}
                                </div>
                                )}
                                <div className="flex gap-3 pt-4">
                                <Button
                                    className="flex-1 rounded-xl py-3"
                                    type="submit"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Add Transaction
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddDialogOpen(false)}
                                    type="button"
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                </div>
                            </form>
                            </TabsContent>
                            <TabsContent value="pdf" className="space-y-4 mt-6">
                            {!showExtractedData ? (
                                <>
                                <div
                                    className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors bg-slate-50/50"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-blue-50 rounded-full">
                                        <Upload className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Upload Receipt or PDF</h3>
                                        <p className="text-slate-600 mt-1">Drag and drop your file here, or click to browse</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <FileText className="w-4 h-4" />
                                        Supports PDF, JPG, PNG files up to 10MB
                                    </div>
                                    </div>
                                    <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                {isProcessing && (
                                    <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Scan className="w-4 h-4 text-blue-600 animate-pulse" />
                                        <span className="text-sm font-medium">Processing document...</span>
                                    </div>
                                    <Progress value={uploadProgress} className="w-full" />
                                    <p className="text-xs text-slate-500">Extracting transaction data from your document</p>
                                    </div>
                                )}
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <h4 className="font-medium text-blue-900 mb-2">Supported Document Types:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• POS receipts (restaurants, stores, gas stations)</li>
                                    <li>• Bank statements and transaction history</li>
                                    <li>• Invoice and billing documents</li>
                                    <li>• Credit card statements</li>
                                    </ul>
                                </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Document processed successfully!</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <h4 className="font-medium text-slate-900 mb-3">Extracted Transactions:</h4>
                                    <div className="space-y-3">
                                    {extractedData.map((item, index) => (
                                        <form
                                          key={index}
                                          onSubmit={(e) => handleManualSubmit(e, index)}
                                          className="bg-white p-4 rounded-lg border space-y-3"
                                        >
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm">Amount</Label>
                                              <Input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => updateExtractedField(index, "amount", e.target.value)}
                                                required
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-sm">Type</Label>
                                              <Select
                                                value={item.type}
                                                onValueChange={(val) => updateExtractedField(index, "type", val)}
                                              >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="income">Income</SelectItem>
                                                  <SelectItem value="expense">Expense</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm">Description</Label>
                                            <Input
                                              value={item.description}
                                              onChange={(e) => updateExtractedField(index, "description", e.target.value)}
                                              required
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm">Category</Label>
                                              <Input
                                                value={item.category}
                                                onChange={(e) => updateExtractedField(index, "category", e.target.value)}
                                                required
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-sm">Date</Label>
                                              <Input
                                                type="date"
                                                value={item.date}
                                                onChange={(e) => updateExtractedField(index, "date", e.target.value)}
                                                required
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm">Notes</Label>
                                            <Input
                                              value={item.notes}
                                              onChange={(e) => updateExtractedField(index, "notes", e.target.value)}
                                            />
                                          </div>
                                          <Button type="submit" className="w-full mt-2">
                                            Add Transaction
                                          </Button>
                                        </form>
                                      ))}
                                                                          </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirm & Add All ({extractedData.length})
                                    </Button>
                                    <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowExtractedData(false)
                                        setExtractedData([])
                                    }}
                                    className="rounded-xl"
                                    >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload New File
                                    </Button>
                                </div>
                                </div>
                            )}
                            </TabsContent>
                        </Tabs>
                        </DialogContent>
                    </Dialog>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                    <div className="relative min-h-[400px] space-y-3 transition-all duration-500">
                        <AnimatePresence mode="wait">
                        {transactions.length === 0 ? (
                           <motion.div
                                key={`page-${page}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                >
                            <div className="text-center py-12">
                                <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4">
                                <Receipt className="w-8 h-8 text-slate-400 mx-auto mt-1" />
                                </div>
                                <p className="text-slate-500 font-medium">No transactions found</p>
                                <p className="text-slate-400 text-sm">Start by adding your first transaction</p>
                            </div>
                            </motion.div>
                        ) : (
                            <motion.div
                            key={`page-${page}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            >
                            {transactions
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map((txn) => (
                                <div
                                    key={txn.id}
                                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                                    onClick={() => {
                                    setSelectedTxn(txn);
                                    setManualAmount(txn.amount);
                                    setManualType(txn.type);
                                    setManualDescription(txn.description);
                                    setManualCategory(txn.category);
                                    setManualDate(txn.date);
                                    setManualNotes(txn.notes || "");
                                    setIsTxnDialogOpen(true);
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                    <div
                                        className={`p-2 rounded-full ${
                                        txn.type === "expense" ? "bg-red-100" : "bg-green-100"
                                        }`}
                                    >
                                        {txn.type === "expense" ? (
                                        <ArrowDownRight
                                            className={`w-5 h-5 ${
                                            txn.type === "expense" ? "text-red-600" : "text-green-600"
                                            }`}
                                        />
                                        ) : (
                                        <ArrowUpRight
                                            className={`w-5 h-5 ${
                                            txn.type === "expense" ? "text-red-600" : "text-green-600"
                                            }`}
                                        />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{txn.description}</div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Badge variant="secondary" className="text-xs">
                                            {txn.category}
                                        </Badge>
                                        <span>•</span>
                                        <span>{new Date(txn.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    </div>
                                    <div
                                    className={`text-lg font-bold ${
                                        txn.type === "expense" ? "text-red-600" : "text-green-600"
                                    }`}
                                    >
                                    {txn.type === "expense" ? "-" : "+"}₹
                                    {Math.abs(txn.amount).toLocaleString()}
                                    </div>
                                </div>
                                ))}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    </CardContent>
                <div className="flex justify-between items-center mt-4">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className="rounded-xl"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-slate-600">Page {page}</span>
                    <Button
                        variant="outline"
                        disabled={transactions.length < pageSize}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="rounded-xl"
                    >
                        Next
                    </Button>
                    </div>
            </Card>
            </div>


        {/* Edit Transaction Dialog */}
        <Dialog open={isTxnDialogOpen} onOpenChange={setIsTxnDialogOpen}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Transaction</DialogTitle>
              <DialogDescription>Update or delete this transaction</DialogDescription>
            </DialogHeader>
            {selectedTxn && (
              <form onSubmit={(e) => handleUpdateTransaction(e, selectedTxn.id)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="Amount"
                    type="number"
                    required
                    className="rounded-xl border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-semibold">
                    Type
                  </Label>
                  <Select value={manualType} onValueChange={setManualType} required>
                    <SelectTrigger id="type" className="rounded-xl border-2 focus:border-blue-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Description"
                    required
                    className="rounded-xl border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    placeholder="Category"
                    required
                    className="rounded-xl border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold">
                    Date
                  </Label>
                  <Input
                    id="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    type="date"
                    required
                    className="rounded-xl border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="Notes"
                    className="rounded-xl border-2 focus:border-blue-500"
                  />
                </div>
                {manualError && (
                  <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{manualError}</div>
                )}
                {manualSuccess && (
                  <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-xl">{manualSuccess}</div>
                )}
                <div className="flex justify-between pt-4 gap-3">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDeleteTransaction(selectedTxn.id)}
                    className="rounded-xl"
                  >
                    Delete
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl flex-1"
                  >
                    Update
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
