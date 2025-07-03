"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { formatCurrency, formatDate, getDisplayId } from "@/lib/utils"

interface RefundData {
  paymentId: string
  amount: number
  category: string
  subcategory: string
  description: string
  paymentStatus: string
  date: string
  currency: string
  receiptNumber?: string
  voucherNumber?: string
}

export default function RefundsPage() {
  const [refundData, setRefundData] = useState<RefundData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRefundData()
  }, [])

  const fetchRefundData = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await apiClient.getMyRefunds()
      setRefundData(response.data || [])
    } catch (err) {
      setError("Failed to load refund details")
      console.error("Error fetching refund data:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "PAID":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const calculateSummary = () => {
    if (!refundData.length) {
      return {
        totalRefunds: 0,
        pendingRefunds: 0,
        completedRefunds: 0,
        currency: "AED",
      }
    }

    const totalRefunds = refundData.reduce((sum, refund) => sum + refund.amount, 0)
    const pendingRefunds = refundData.filter((r) => r.paymentStatus.toUpperCase() === "PENDING").length
    const completedRefunds = refundData.filter((r) =>
      ["COMPLETED", "PAID"].includes(r.paymentStatus.toUpperCase()),
    ).length

    return {
      totalRefunds,
      pendingRefunds,
      completedRefunds,
      currency: refundData[0]?.currency || "AED",
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Refunds</h2>
          <p className="text-gray-600 text-sm md:text-base">Track your refund requests and processing status</p>
        </div>
        <Button onClick={fetchRefundData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Refund Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Total Refunds</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(summary.totalRefunds, summary.currency)}</p>
            <p className="text-blue-100 text-xs md:text-sm">All time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Pending</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{summary.pendingRefunds}</p>
            <p className="text-yellow-100 text-xs md:text-sm">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Completed</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{summary.completedRefunds}</p>
            <p className="text-green-100 text-xs md:text-sm">Processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Refund History */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Refund History</CardTitle>
          <p className="text-gray-600">Track all your refund requests and their status</p>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Refunds</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchRefundData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : refundData.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Refunds Found</h3>
              <p className="text-gray-600 mb-4">You haven't requested any refunds yet.</p>
              <Button onClick={fetchRefundData} variant="outline">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {refundData.map((refund) => (
                <div
                  key={refund.paymentId}
                  className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">
                          {refund.category} - {refund.subcategory}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-600">{refund.description}</p>
                        <p className="text-xs text-gray-500 mt-1">ID: {getDisplayId(refund)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl md:text-2xl font-bold text-gray-900">
                        {formatCurrency(refund.amount, refund.currency)}
                      </p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        {getStatusIcon(refund.paymentStatus)}
                        <Badge className={getStatusColor(refund.paymentStatus)}>{refund.paymentStatus}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Requested: {formatDate(refund.date)}</span>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      {refund.paymentStatus.toUpperCase() === "PENDING" && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          Cancel Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
