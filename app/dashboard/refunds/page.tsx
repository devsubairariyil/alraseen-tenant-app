"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RefreshCw,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { formatCurrency, formatDate, getDisplayId } from "@/lib/utils"
import { TenantRefundRequestModal } from "@/components/dashboard/TenantRefundRequestModal"
import { toast } from "@/hooks/use-toast"

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
  leaseId: string
  propertyName: string
  flatNumber: string
}

interface LeaseInfo {
  leaseId: string
  propertyName: string
  flatNumber: string
  startDate?: string
  endDate?: string
  unitId?: string
  propertyId?: string
}

export default function RefundsPage() {
  const [leases, setLeases] = useState<LeaseInfo[]>([])
  const [refundsMap, setRefundsMap] = useState<Record<string, RefundData[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedLeaseIds, setExpandedLeaseIds] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLease, setSelectedLease] = useState<LeaseInfo | null>(null)

  useEffect(() => {
    fetchRefundData()
  }, [])

  const fetchRefundData = async () => {
    try {
      setLoading(true)
      setError("")
      const leaseResponse = await apiClient.getMyLeases()
      const leases = leaseResponse.data.map((l: any) => ({
        leaseId: l.rentalAgreement.leaseId,
        propertyName: l.rentalAgreement.propertyName,
        flatNumber: l.rentalAgreement.flatNumber,
        startDate: l.rentalAgreement.leaseStartDate,
        endDate: l.rentalAgreement.leaseEndDate,
        unitId: l.rentalAgreement.flatId,
        propertyId: l.rentalAgreement.propertyId,
      }))
      setLeases(leases)

      const refundsData: Record<string, RefundData[]> = {}
      for (const lease of leases) {
        const res = await apiClient.getMyRefunds(lease.leaseId)
        refundsData[lease.leaseId] = res.data || []
      }
      setRefundsMap(refundsData)
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

  const toggleExpand = (leaseId: string) => {
    setExpandedLeaseIds((prev) =>
      prev.includes(leaseId) ? prev.filter((id) => id !== leaseId) : [...prev, leaseId]
    )
  }

  const handleOpenModal = (lease: LeaseInfo) => {
    setSelectedLease(lease)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedLease(null)
  }

  const handleRefundSubmitted = async (values: any) => {
    setLoading(true)
    
    try{
       await fetchRefundData()
       toast({  
        title: "Refund Request Submitted",
          description:
          "Your refund request has been received. You can track this request in the 'My Requests' page until a staff member begins processing it. Once an admin adds the refund to the system, it will appear here.",
        })
    }finally {
        setLoading(false)
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

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Refunds</h2>
          <p className="text-gray-600 text-sm md:text-base">Track your refund requests and processing status</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRefundData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {leases.length > 0 && (
            <Button
              onClick={() => handleOpenModal(leases[0])}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Request Refund
            </Button>
          )}
        </div>
      </div>

      {leases.length === 0 ? (
        <Card className="border-0 shadow-md bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">No Refunds Found</CardTitle>
            <p className="text-gray-500">You haven't requested any refunds yet.</p>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchRefundData} variant="outline">
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        leases.map((lease) => {
          const refunds = refundsMap[lease.leaseId] || []
          const total = refunds.reduce((sum, r) => sum + r.amount, 0)
          return (
            <Card key={lease.leaseId} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader onClick={() => toggleExpand(lease.leaseId)} className="cursor-pointer flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {lease.propertyName} - Unit {lease.flatNumber}
                  </CardTitle>
                  <p className="text-gray-600">
                    Tenure: {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                  </p>
                </div>
                {expandedLeaseIds.includes(lease.leaseId) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CardHeader>
              {expandedLeaseIds.includes(lease.leaseId) && (
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Total Refunds: {formatCurrency(total, refunds[0]?.currency || "AED")}
                  </p>
                  {refunds.length === 0 ? (
                    <div className="text-center text-gray-500 italic">No refund records for this lease</div>
                  ) : (
                    refunds.map((refund) => (
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
                    ))
                  )}
                </CardContent>
              )}
            </Card>
          )
        })
      )}

      {selectedLease && (
        <TenantRefundRequestModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          leaseId={leases[0].leaseId}
          unitId={leases[0].unitId || ""}
          propertyId={leases[0].propertyId || ""}
          onSubmitted={handleRefundSubmitted}
        />
      )}
    </div>
  )
}