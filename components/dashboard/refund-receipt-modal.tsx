"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { useState } from "react"
import { RefundData } from "@/lib/types/api-responses"

interface RefundReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  refund: RefundData | null
}

export default function RefundReceiptModal({ isOpen, onClose, refund }: RefundReceiptModalProps) {
  const [downloading, setDownloading] = useState(false)

  if (!refund) return null

  const handleDownload = async () => {
    if (!refund) return

    try {
      setDownloading(true)
      
      // Download receipt from server
      const blob = await apiClient.downloadRefundReceipt(refund.paymentId)
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Refund_Receipt_${refund.voucherNumber || refund.paymentId}_${formatDate(refund.date).replace(/\//g, "-")}.pdf`
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-medium">
                  {refund.voucherNumber ? `Voucher #${refund.voucherNumber}` : `ID: ${refund.paymentId.slice(0, 8)}`}
                </span>
              </div>
              <div className="bg-green-400/90 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-green-900">{refund.paymentStatus}</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Refund Details</h1>
            <p className="text-green-100 text-sm">{formatDate(refund.date)}</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Amount Card - Prominent Display */}
        <div className="mx-6 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Refund Amount</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {formatCurrency(refund.totalAmount, refund.currency)}
              </p>
              <p className="text-sm text-gray-600 mt-3 px-4 py-2 bg-green-50 rounded-full inline-block">
                {refund.category}{refund.subcategory ? ` - ${refund.subcategory}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-6 space-y-6">
          {/* Refund Information */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Refund Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-sm font-semibold text-gray-900">{refund.category}</p>
              </div>
              {refund.subcategory && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Subcategory</p>
                  <p className="text-sm font-semibold text-gray-900">{refund.subcategory}</p>
                </div>
              )}
              {refund.description && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm font-semibold text-gray-900">{refund.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="text-sm font-semibold text-gray-900">{refund.paymentStatus}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(refund.date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Method</p>
                <p className="text-sm font-semibold text-gray-900">{refund.method}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Bank Account</p>
                <p className="text-sm font-semibold text-gray-900">{refund.bankAccountName}</p>
              </div>
              {refund.voucherNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Voucher Number</p>
                  <p className="text-sm font-semibold text-gray-900">{refund.voucherNumber}</p>
                </div>
              )}
              {refund.chequeNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cheque Number</p>
                  <p className="text-sm font-semibold text-gray-900">{refund.chequeNumber}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Base Amount</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(refund.baseAmount, refund.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">VAT Amount</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(refund.vatAmount, refund.currency)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button - Modern Style */}
        <div className="px-6 pb-6">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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
