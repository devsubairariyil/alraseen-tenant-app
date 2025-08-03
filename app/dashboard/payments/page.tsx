"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Building,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { formatCurrency, formatDate, getDisplayId } from "@/lib/utils"
import PaymentReceiptModal from "@/components/dashboard/payment-receipt-modal"

interface PaymentData {
  receiptId: string
  leaseId: string
  propertyName: string
  flatNumber: string
  receiptNumber: string
  amount: number
  currency: string
  paymentReason: string
  date: string
  method: string
  receiptStatus: string
  chequeNumber?: string
  remarks?: string
  staffName?: string
  bankName?: string
  chequeImageUrl?: string
}

interface LeaseInfo {
  leaseId: string
  propertyName: string
  flatNumber: string
  leaseStartDate: string
  leaseEndDate: string
}

export default function PaymentsPage() {
  const [leases, setLeases] = useState<LeaseInfo[]>([])
  const [paymentsMap, setPaymentsMap] = useState<Record<string, PaymentData[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [expandedLeaseIds, setExpandedLeaseIds] = useState<string[]>([])

  useEffect(() => {
    fetchLeases()
  }, [])

  const fetchLeases = async () => {
    try {
      setLoading(true)
      const leaseResponse = await apiClient.getMyLeases()
      const leases = leaseResponse.data.map((l: any) => ({
        leaseId: l.rentalAgreement.leaseId,
        propertyName: l.rentalAgreement.propertyName,
        flatNumber: l.rentalAgreement.flatNumber,
        leaseStartDate: l.rentalAgreement.leaseStartDate,
        leaseEndDate: l.rentalAgreement.leaseEndDate,
      }))
      setLeases(leases)

      const paymentsData: Record<string, PaymentData[]> = {}
      for (const lease of leases) {
        const paymentRes = await apiClient.getMyPayments(lease.leaseId)
        paymentsData[lease.leaseId] = paymentRes.data || []
      }
      setPaymentsMap(paymentsData)
    } catch (err) {
      console.error("Failed to load leases/payments", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (leaseId: string) => {
    setExpandedLeaseIds((prev) =>
      prev.includes(leaseId) ? prev.filter((id) => id !== leaseId) : [...prev, leaseId]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLEARED":
        return "bg-green-100 text-green-800"
      case "PENDING":
      case "PDC_DEPOSITED":
        return "bg-yellow-100 text-yellow-800"
      case "CANCELLED":
      case "BOUNCED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewReceipt = (payment: PaymentData) => {
    setSelectedPayment(payment)
    setIsReceiptModalOpen(true)
  }

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Payments</h2>
        <Button onClick={fetchLeases} variant="outline">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {leases.map((lease) => (
        <Card key={lease.leaseId} className="shadow-xl rounded-2xl border-0">
          <CardHeader className="flex flex-row justify-between items-center cursor-pointer" onClick={() => toggleExpand(lease.leaseId)}>
            <div>
              <CardTitle className="text-lg">{lease.propertyName} - Unit {lease.flatNumber}</CardTitle>
              <p className="text-sm text-gray-500">{formatDate(lease.leaseStartDate)} to {formatDate(lease.leaseEndDate)}</p>
            </div>
            {expandedLeaseIds.includes(lease.leaseId) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </CardHeader>
          {expandedLeaseIds.includes(lease.leaseId) && (
            <CardContent className="space-y-4">
              {(paymentsMap[lease.leaseId] || []).length === 0 ? (
                <p className="text-gray-600 text-sm">No payments found.</p>
              ) : (
                paymentsMap[lease.leaseId].map((payment) => (
                  <div
                    key={payment.receiptId}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{payment.paymentReason} - {payment.receiptNumber}</h4>
                        <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                        <p className="text-sm text-gray-500">Method: {payment.method}</p>
                        {payment.chequeNumber && <p className="text-sm text-gray-500">Cheque: {payment.chequeNumber}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                        <Badge className={getStatusColor(payment.receiptStatus)}>{payment.receiptStatus}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {payment.receiptStatus === "CLEARED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReceipt(payment)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View Receipt
                        </Button>
                      )}
                      {payment.chequeImageUrl && (
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" /> View Cheque
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          )}
        </Card>
      ))}

      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedPayment}
      />
    </div>
  )
}
