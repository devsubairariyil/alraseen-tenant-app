import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus, Calendar, DollarSign, FileText, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

const refundData = {
  summary: {
    totalRefunds: "AED 3,500",
    pendingRefunds: "AED 500",
    processedRefunds: "AED 3,000",
    averageProcessingTime: "5-7 days",
  },
  refunds: [
    {
      id: "REF-001",
      date: "15/07/2024",
      amount: "AED 500",
      type: "Utility Deposit Refund",
      reason: "End of lease - unused utilities",
      status: "Processing",
      requestDate: "10/07/2024",
      expectedDate: "20/07/2024",
      reference: "REF789456123",
    },
    {
      id: "REF-002",
      date: "01/06/2024",
      amount: "AED 1,500",
      type: "Security Deposit Refund",
      reason: "Property handover completed",
      status: "Completed",
      requestDate: "25/05/2024",
      expectedDate: "05/06/2024",
      reference: "REF789456122",
    },
    {
      id: "REF-003",
      date: "15/03/2024",
      amount: "AED 1,500",
      type: "Security Deposit Refund",
      reason: "Previous property - Downtown Residence",
      status: "Completed",
      requestDate: "10/03/2024",
      expectedDate: "20/03/2024",
      reference: "REF789456121",
    },
    {
      id: "REF-004",
      date: "20/01/2024",
      amount: "AED 300",
      type: "Overpayment Refund",
      reason: "Rent overpayment adjustment",
      status: "Rejected",
      requestDate: "15/01/2024",
      expectedDate: "25/01/2024",
      reference: "REF789456120",
      rejectionReason: "Insufficient documentation provided",
    },
  ],
}

export default function RefundsPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "Processing":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refunds</h1>
          <p className="text-gray-600">Track your refund requests and processing status</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Request Refund
        </Button>
      </div>

      {/* Refund Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6" />
              <h3 className="font-semibold">Total Refunds</h3>
            </div>
            <p className="text-2xl font-bold">{refundData.summary.totalRefunds}</p>
            <p className="text-blue-100 text-sm">All time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6" />
              <h3 className="font-semibold">Pending</h3>
            </div>
            <p className="text-2xl font-bold">{refundData.summary.pendingRefunds}</p>
            <p className="text-yellow-100 text-sm">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6" />
              <h3 className="font-semibold">Processed</h3>
            </div>
            <p className="text-2xl font-bold">{refundData.summary.processedRefunds}</p>
            <p className="text-green-100 text-sm">Completed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-6 h-6" />
              <h3 className="font-semibold">Processing Time</h3>
            </div>
            <p className="text-2xl font-bold">{refundData.summary.averageProcessingTime}</p>
            <p className="text-purple-100 text-sm">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* How to Request Refund */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold mb-4">How to Request a Refund</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">1. Submit Request</h4>
              <p className="text-indigo-100 text-sm">Fill out the refund request form with required details</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">2. Processing</h4>
              <p className="text-indigo-100 text-sm">We review your request within 2-3 business days</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">3. Completion</h4>
              <p className="text-indigo-100 text-sm">Approved refunds are processed within 5-7 days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund History */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Refund History</CardTitle>
          <p className="text-gray-600">Track all your refund requests and their status</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {refundData.refunds.map((refund) => (
              <div key={refund.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{refund.type}</h4>
                      <p className="text-sm text-gray-600">{refund.reason}</p>
                      <p className="text-xs text-gray-500 mt-1">Ref: {refund.reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{refund.amount}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getStatusIcon(refund.status)}
                      <Badge className={getStatusColor(refund.status)}>{refund.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Request Date</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      {refund.requestDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Expected Date</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      {refund.expectedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Processed Date</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      {refund.status === "Completed" ? refund.date : "Pending"}
                    </p>
                  </div>
                </div>

                {refund.status === "Rejected" && refund.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {refund.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {refund.status === "Processing" && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
