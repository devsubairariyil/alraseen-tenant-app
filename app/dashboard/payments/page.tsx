"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Building,
  User,
  RefreshCw,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { formatCurrency, formatDate, getDisplayId } from "@/lib/utils"
import PaymentReceiptModal from "@/components/dashboard/payment-receipt-modal"

interface PaymentData {
  propertyId: string
  tenantId: string
  depositAccountId: string
  receiptId: string
  processedByUserId: string
  unitId: string
  propertyName: string
  flatNumber: string
  depositAccountName: string
  tenantName: string
  staffName: string
  receiptNumber: string
  date: string
  amount: number
  currency: string
  payerId: string
  payerName: string
  paymentReason: string
  referenceNumber: string
  method: "CASH" | "CHEQUE" | "BANK_TRANSFER" | "CARD" | "ONLINE"
  chequeNumber: string
  bankName: string
  chequeIssueDate: string
  chequeImageUrl: string
  receiptStatus: "PDC_DEPOSITED" | "CLEARED" | "BOUNCED" | "PENDING" | "CANCELLED"
  createdAt: string
  updatedAt: string
  remarks: string
}

export default function PaymentsPage() {
  const [paymentData, setPaymentData] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await apiClient.getMyPayments()
      setPaymentData(response.data || [])
    } catch (err) {
      setError("Failed to load payment details")
      console.error("Error fetching payment data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewReceipt = (payment: PaymentData) => {
    setSelectedPayment(payment)
    setIsReceiptModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLEARED":
        return "bg-green-100 text-green-800"
      case "PDC_DEPOSITED":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "BOUNCED":
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CLEARED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "PDC_DEPOSITED":
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "BOUNCED":
      case "CANCELLED":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <DollarSign className="w-5 h-5 text-green-500" />
      case "CHEQUE":
        return <FileText className="w-5 h-5 text-blue-500" />
      case "BANK_TRANSFER":
        return <Building className="w-5 h-5 text-purple-500" />
      case "CARD":
      case "ONLINE":
        return <CreditCard className="w-5 h-5 text-orange-500" />
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />
    }
  }

  const calculateSummary = () => {
    if (!paymentData.length) {
      return {
        totalPaid: 0,
        pendingAmount: 0,
        lastPayment: null,
        failedPayments: 0,
        currency: "AED",
      }
    }

    const totalPaid = paymentData
      .filter((p) => p.receiptStatus === "CLEARED")
      .reduce((sum, payment) => sum + payment.amount, 0)

    const pendingAmount = paymentData
      .filter((p) => ["PDC_DEPOSITED", "PENDING"].includes(p.receiptStatus))
      .reduce((sum, payment) => sum + payment.amount, 0)

    const lastPayment = paymentData
      .filter((p) => p.receiptStatus === "CLEARED")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const failedPayments = paymentData.filter((p) => ["BOUNCED", "CANCELLED"].includes(p.receiptStatus)).length

    return {
      totalPaid,
      pendingAmount,
      lastPayment,
      failedPayments,
      currency: paymentData[0]?.currency || "AED",
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  const summary = calculateSummary()

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment History</h2>
          <p className="text-gray-600 text-sm md:text-base">Track your rental payments and transaction history</p>
        </div>
        <Button onClick={fetchPaymentData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Total Paid</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(summary.totalPaid, summary.currency)}</p>
            <p className="text-green-100 text-xs md:text-sm">Cleared payments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Pending</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(summary.pendingAmount, summary.currency)}</p>
            <p className="text-yellow-100 text-xs md:text-sm">Processing</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Last Payment</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">
              {summary.lastPayment ? formatDate(summary.lastPayment.date) : "N/A"}
            </p>
            <p className="text-blue-100 text-xs md:text-sm">
              {summary.lastPayment ? formatCurrency(summary.lastPayment.amount, summary.currency) : "No payments"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Failed</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{summary.failedPayments}</p>
            <p className="text-purple-100 text-xs md:text-sm">Bounced/Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Payment Transactions</CardTitle>
          <p className="text-gray-600">Your complete payment transaction history</p>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Payments</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchPaymentData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : paymentData.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment History</h3>
              <p className="text-gray-600 mb-4">No payment transactions found for your account.</p>
              <Button onClick={fetchPaymentData} variant="outline">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentData.map((payment) => (
                <div
                  key={payment.receiptId}
                  className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        {getMethodIcon(payment.method)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900 text-sm md:text-base">
                            {payment.propertyName} - Unit {payment.flatNumber}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {payment.method.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 mb-1">{payment.paymentReason}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Receipt: {getDisplayId(payment)}</span>
                          {payment.referenceNumber && <span>Reference: {payment.referenceNumber}</span>}
                          {payment.chequeNumber && <span>Cheque: {payment.chequeNumber}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl md:text-2xl font-bold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        {getStatusIcon(payment.receiptStatus)}
                        <Badge className={getStatusColor(payment.receiptStatus)}>
                          {payment.receiptStatus.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-gray-500">Payment Date</p>
                        <p className="font-semibold">{formatDate(payment.date)}</p>
                      </div>
                    </div>
                    {payment.staffName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-gray-500">Processed By</p>
                          <p className="font-semibold">{payment.staffName}</p>
                        </div>
                      </div>
                    )}
                    {payment.bankName && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-gray-500">Bank</p>
                          <p className="font-semibold">{payment.bankName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {payment.remarks && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Remarks:</strong> {payment.remarks}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {payment.receiptStatus === "CLEARED" && (
                      <Button variant="outline" size="sm" onClick={() => handleViewReceipt(payment)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    )}
                    {payment.chequeImageUrl && (
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        View Cheque
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedPayment}
      />
    </div>
  )
}
