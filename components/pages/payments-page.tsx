import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  Eye,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

const paymentData = {
  summary: {
    totalPaid: "AED 70,833",
    nextPayment: "AED 7,083",
    nextDueDate: "01/08/2024",
    outstandingBalance: "AED 0",
  },
  recentPayments: [
    {
      id: "PAY-001",
      date: "01/07/2024",
      amount: "AED 7,083",
      type: "Monthly Rent",
      method: "Bank Transfer",
      status: "Completed",
      reference: "TXN789456123",
    },
    {
      id: "PAY-002",
      date: "01/06/2024",
      amount: "AED 7,083",
      type: "Monthly Rent",
      method: "Bank Transfer",
      status: "Completed",
      reference: "TXN789456122",
    },
    {
      id: "PAY-003",
      date: "01/05/2024",
      amount: "AED 7,083",
      type: "Monthly Rent",
      method: "Credit Card",
      status: "Completed",
      reference: "TXN789456121",
    },
    {
      id: "PAY-004",
      date: "15/04/2024",
      amount: "AED 2,000",
      type: "Security Deposit",
      method: "Bank Transfer",
      status: "Completed",
      reference: "TXN789456120",
    },
    {
      id: "PAY-005",
      date: "01/04/2024",
      amount: "AED 7,083",
      type: "Monthly Rent",
      method: "Bank Transfer",
      status: "Completed",
      reference: "TXN789456119",
    },
  ],
  upcomingPayments: [
    {
      id: "UP-001",
      date: "01/08/2024",
      amount: "AED 7,083",
      type: "Monthly Rent",
      status: "Pending",
    },
    {
      id: "UP-002",
      date: "01/09/2024",
      amount: "AED 7,083",
      type: "Monthly Rent",
      status: "Scheduled",
    },
  ],
}

export default function PaymentsPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "Scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">Track your rental payments and upcoming dues</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Download className="w-4 h-4 mr-2" />
          Download Statement
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" />
              <h3 className="font-semibold">Total Paid</h3>
            </div>
            <p className="text-2xl font-bold">{paymentData.summary.totalPaid}</p>
            <p className="text-green-100 text-sm">This year</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6" />
              <h3 className="font-semibold">Next Payment</h3>
            </div>
            <p className="text-2xl font-bold">{paymentData.summary.nextPayment}</p>
            <p className="text-blue-100 text-sm">Due {paymentData.summary.nextDueDate}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6" />
              <h3 className="font-semibold">Next Due Date</h3>
            </div>
            <p className="text-2xl font-bold">{paymentData.summary.nextDueDate}</p>
            <p className="text-purple-100 text-sm">Monthly rent</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-semibold">Outstanding</h3>
            </div>
            <p className="text-2xl font-bold">{paymentData.summary.outstandingBalance}</p>
            <p className="text-orange-100 text-sm">All clear!</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Upcoming Payments</CardTitle>
          <p className="text-gray-600">Your scheduled payment obligations</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {paymentData.upcomingPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{payment.type}</h4>
                    <p className="text-sm text-gray-600">Due: {payment.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{payment.amount}</p>
                    <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500">
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Recent Payments</CardTitle>
          <p className="text-gray-600">Your payment transaction history</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {paymentData.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{payment.type}</h4>
                    <p className="text-sm text-gray-600">
                      {payment.date} • {payment.method}
                    </p>
                    <p className="text-xs text-gray-500">Ref: {payment.reference}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{payment.amount}</p>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(payment.status)}
                      <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
