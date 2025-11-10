"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Image from "next/image"
import jsPDF from "jspdf"

interface PaymentReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  payment: {
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
  if (!payment) return null

  const loadImageAsBase64 = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        try {
          const dataURL = canvas.toDataURL("image/png")
          resolve(dataURL)
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = () => reject(new Error("Could not load image"))
      img.src = src
    })
  }

  const handleDownload = async () => {
    if (!payment) return

    try {
      // Create new PDF document
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()

      // Set font
      pdf.setFont("helvetica")

      let contentStartY = 0 // Initialize contentStartY here

      try {
        // Try to load and add the logo
        const logoBase64 = await loadImageAsBase64("/al-raseen-letter-logo.png")

        // Calculate logo dimensions (maintain aspect ratio)
        const logoWidth = pageWidth * 0.8 // 80% of page width
        const logoHeight = 20 // Adjust based on your logo's aspect ratio
        const logoX = (pageWidth - logoWidth) / 2

        pdf.addImage(logoBase64, "PNG", logoX, 15, logoWidth, logoHeight)

        // Add title below logo
        pdf.setFontSize(20)
        pdf.setTextColor(0, 0, 0)
        pdf.text("Payment Receipt", pageWidth / 2, 45, { align: "center" })

        // Start content lower
        contentStartY = 65
      } catch (logoError) {
        console.warn("Could not load logo, using text fallback:", logoError)

        // Fallback to text header if logo fails
        pdf.setFontSize(18)
        pdf.setTextColor(60, 60, 150)
        pdf.text("الراصين للعقارات", pageWidth / 2, 25, { align: "center" })

        pdf.setFontSize(16)
        pdf.setTextColor(80, 80, 80)
        pdf.text("ALRASEEN REAL ESTATE", pageWidth / 2, 35, { align: "center" })

        // Add decorative line
        pdf.setDrawColor(60, 60, 150)
        pdf.setLineWidth(0.5)
        pdf.line(20, 42, pageWidth - 20, 42)

        // Add title
        pdf.setFontSize(20)
        pdf.setTextColor(0, 0, 0)
        pdf.text("Payment Receipt", pageWidth / 2, 55, { align: "center" })

        contentStartY = 75
      }

      // Add receipt details section
      pdf.setFontSize(14)
      pdf.setTextColor(60, 60, 60)
      pdf.text("Receipt Details", 20, contentStartY)

      // Add receipt information
      pdf.setFontSize(11)
      pdf.setTextColor(0, 0, 0)

      const startY = contentStartY + 15
      const lineHeight = 8
      let currentY = startY

      const addReceiptLine = (label: string, value: string, isAmount = false) => {
        pdf.setTextColor(100, 100, 100)
        pdf.text(label, 20, currentY)

        if (isAmount) {
          pdf.setTextColor(0, 100, 200) // Blue for amount
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")
        } else {
          pdf.setTextColor(0, 0, 0)
          pdf.setFontSize(11)
          pdf.setFont("helvetica", "normal")
        }

        pdf.text(value, pageWidth - 20, currentY, { align: "right" })
        currentY += lineHeight
      }

      addReceiptLine("Receipt No:", payment.receiptNumber)
      addReceiptLine("Date:", formatDate(payment.date))
      addReceiptLine("Tenant Name:", payment.tenantName)
      addReceiptLine("Property Name:", payment.propertyName)
      addReceiptLine("Flat Number:", payment.flatNumber)
      addReceiptLine("Processed By:", payment.staffName)
      addReceiptLine("Amount:", formatCurrency(payment.totalAmount, payment.currency), true)
      addReceiptLine("Received For:", payment.paymentReason)
      addReceiptLine("Reference:", payment.referenceNumber || "N/A")
      addReceiptLine("Payment Method:", payment.method.replace("_", " "))

      if (payment.chequeNumber) {
        addReceiptLine("Cheque Number:", payment.chequeNumber)
      }

      // Add footer note
      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      pdf.text("This is a computer-generated receipt and does not require a signature.", pageWidth / 2, currentY + 20, {
        align: "center",
      })
      pdf.text("For any queries, please contact Alraseen Real Estate.", pageWidth / 2, currentY + 28, {
        align: "center",
      })

      // Save the PDF
      const fileName = `Payment_Receipt_${payment.receiptNumber}_${formatDate(payment.date).replace(/\//g, "-")}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      // Fallback: create a simple text file
      const receiptText = `
ALRASEEN REAL ESTATE
Payment Receipt

Receipt Details:
Receipt No: ${payment.receiptNumber}
Date: ${formatDate(payment.date)}
Tenant Name: ${payment.tenantName}
Property Name: ${payment.propertyName}
Flat Number: ${payment.flatNumber}
Processed By: ${payment.staffName}
Amount: ${formatCurrency(payment.totalAmount, payment.currency)}
Received For: ${payment.paymentReason}
Reference: ${payment.referenceNumber || "N/A"}
Payment Method: ${payment.method.replace("_", " ")}
${payment.chequeNumber ? `Cheque Number: ${payment.chequeNumber}` : ""}

This is a computer-generated receipt and does not require a signature.
For any queries, please contact Alraseen Real Estate.
    `

      const blob = new Blob([receiptText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Payment_Receipt_${payment.receiptNumber}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-gray-50">
        {/* Header */}
        <div className="bg-white p-8 text-center">
          <div className="mb-6">
            <Image
              src="/al-raseen-letter-logo.png"
              alt="Alraseen Real Estate"
              width={400}
              height={80}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Receipt</h1>
        </div>

        {/* Receipt Content */}
        <div className="bg-white mx-8 mb-8 p-8 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Receipt Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Receipt No:</span>
              <span className="text-gray-900 font-semibold">{payment.receiptNumber}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Date:</span>
              <span className="text-gray-900 font-semibold">{formatDate(payment.date)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Tenant Name:</span>
              <span className="text-gray-900 font-semibold">{payment.tenantName}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Property Name:</span>
              <span className="text-gray-900 font-semibold">{payment.propertyName}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Flat Number:</span>
              <span className="text-gray-900 font-semibold">{payment.flatNumber}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Processed By:</span>
              <span className="text-gray-900 font-semibold">{payment.staffName}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Amount:</span>
              <span className="text-blue-600 font-bold text-lg">
                {formatCurrency(payment.totalAmount, payment.currency)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Received For:</span>
              <span className="text-gray-900 font-semibold">{payment.paymentReason}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Reference:</span>
              <span className="text-gray-900 font-semibold">{payment.referenceNumber || ""}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600 font-medium">Payment Method:</span>
              <span className="text-gray-900 font-semibold">{payment.method.replace("_", " ")}</span>
            </div>

            {payment.chequeNumber && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600 font-medium">Cheque Number:</span>
                <span className="text-gray-900 font-semibold">{payment.chequeNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="px-8 pb-8">
          <Button
            onClick={handleDownload}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Payment Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
