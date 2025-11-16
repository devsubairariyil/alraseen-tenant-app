"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { useState } from "react"

interface PaymentReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  payment: {
    receiptId: string
    receiptNumber: string
    date: string
    propertyName: string
    flatNumber: string
    tenantName: string
    staffName: string
    totalAmount: number
    currency: string
    method: string
    paymentReason: string
    referenceNumber?: string
    depositAccountName: string
    receiptStatus: string
    bankName?: string
    chequeNumber?: string
  } | null
}

export default function PaymentReceiptModal({ isOpen, onClose, payment }: PaymentReceiptModalProps) {
  const [downloading, setDownloading] = useState(false)

  if (!payment) return null

  const handleDownload = async () => {
    if (!payment) return

    try {
      setDownloading(true)
      
      // Download receipt from server
      const blob = await apiClient.downloadPaymentReceipt(payment.receiptId)
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Payment_Receipt_${payment.receiptNumber}_${formatDate(payment.date).replace(/\//g, "-")}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading receipt:", error)
      alert("Failed to download receipt. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-medium">Receipt #{payment.receiptNumber}</span>
              </div>
              <div className="bg-green-400/90 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-green-900">{payment.receiptStatus}</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Details</h1>
            <p className="text-purple-100 text-sm">{formatDate(payment.date)}</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Amount Card - Prominent Display */}
        <div className="mx-6 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Amount Paid</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {formatCurrency(payment.totalAmount, payment.currency)}
              </p>
              <p className="text-sm text-gray-600 mt-3 px-4 py-2 bg-purple-50 rounded-full inline-block">
                {payment.paymentReason}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-6 space-y-6">
          {/* Property Information */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Property Name</p>
                <p className="text-sm font-semibold text-gray-900">{payment.propertyName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Unit Number</p>
                <p className="text-sm font-semibold text-gray-900">{payment.flatNumber}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                <p className="text-sm font-semibold text-gray-900">{payment.method.replace("_", " ")}</p>
              </div>
              {payment.referenceNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                  <p className="text-sm font-semibold text-gray-900">{payment.referenceNumber}</p>
                </div>
              )}
              {payment.chequeNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cheque Number</p>
                  <p className="text-sm font-semibold text-gray-900">{payment.chequeNumber}</p>
                </div>
              )}
              {payment.bankName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                  <p className="text-sm font-semibold text-gray-900">{payment.bankName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tenant & Staff Information */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              People Involved
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tenant Name</p>
                <p className="text-sm font-semibold text-gray-900">{payment.tenantName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Processed By</p>
                <p className="text-sm font-semibold text-gray-900">{payment.staffName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button - Modern Style */}
        <div className="px-6 pb-6">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-5 h-5" />
            <span className="text-lg">{downloading ? "Downloading PDF..." : "Download Official Receipt"}</span>
          </Button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Download the official PDF receipt for your records
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
