"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, FileCheck, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { useOnboarding } from "@/lib/onboarding-context"
import { checkOnboardingRequired } from "@/lib/check-onboarding"
import { toast } from "sonner"

export function EmiratesIdStep() {
  const router = useRouter()
  const { tenantData, markStepComplete, goToNextStep, refreshTenantData, completeOnboarding } = useOnboarding()
  const [emiratesIdNo, setEmiratesIdNo] = useState(tenantData?.tenantItem.emiratesIdNo || "")
  const [emiratesIdExpiry, setEmiratesIdExpiry] = useState<Date | undefined>(
    tenantData?.tenantItem.emiratesIdExpiry ? new Date(tenantData.tenantItem.emiratesIdExpiry) : undefined
  )
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const hasExistingDocument = tenantData?.tenantItem.emiratesIdDocument && 
                               tenantData.tenantItem.emiratesIdDocument.trim() !== ""

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emiratesIdNo || !emiratesIdExpiry) {
      toast.error("Please fill in all required fields")
      return
    }

    // Check if document is required
    if (!hasExistingDocument && !file) {
      toast.error("Please upload your Emirates ID document")
      return
    }

    try {
      setSubmitting(true)

      let documentPath = tenantData?.tenantItem.emiratesIdDocument

      // Upload file if provided
      if (file) {
        setUploading(true)
        const uploadResponse = await apiClient.uploadFile(file, "ID_PROOF")
        documentPath = uploadResponse.data
        setUploading(false)
      }

      // Update tenant profile
      await apiClient.updateTenantProfile({
        emiratesIdNo,
        emiratesIdExpiry: format(emiratesIdExpiry, "yyyy-MM-dd"),
        documentPath,
      })

      toast.success("Emirates ID updated successfully!")
      
      // Refresh tenant data to get latest state
      await refreshTenantData()
      
      // Fetch fresh tenant data to check onboarding status
      const freshTenantData = await apiClient.getTenantDetails()
      
      // Mark this step as complete
      markStepComplete("emirates-id")
      
      // Check if all onboarding is now complete
      const needsMoreOnboarding = checkOnboardingRequired(freshTenantData.data)
      
      if (!needsMoreOnboarding) {
        // All onboarding complete - go to dashboard
        completeOnboarding()
        toast.success("Onboarding completed! Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      } else {
        // More steps remaining - go to next step
        goToNextStep()
      }
    } catch (error) {
      console.error("Error updating Emirates ID:", error)
      toast.error("Failed to update Emirates ID. Please try again.")
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <FileCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Emirates ID Information</h2>
        <p className="text-gray-600">
          {tenantData?.tenantItem.emiratesIdExpiryStatus === "EXPIRED"
            ? "Your Emirates ID has expired. Please update your information."
            : !hasExistingDocument
            ? "Please upload your Emirates ID document to continue."
            : "Please provide your Emirates ID details to continue."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-8">
        <div className="space-y-2">
          <Label htmlFor="emiratesId" className="text-sm font-medium">
            Emirates ID Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="emiratesId"
            placeholder="784-XXXX-XXXXXXX-X"
            value={emiratesIdNo}
            onChange={(e) => setEmiratesIdNo(e.target.value)}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate" className="text-sm font-medium">
            Expiry Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal",
                  !emiratesIdExpiry && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {emiratesIdExpiry ? format(emiratesIdExpiry, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={emiratesIdExpiry}
                onSelect={setEmiratesIdExpiry}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document" className="text-sm font-medium">
            Upload Emirates ID Copy {!hasExistingDocument && <span className="text-red-500">*</span>}
          </Label>
          {hasExistingDocument && (
            <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <FileCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium">Document Already Uploaded</p>
                <p className="text-xs text-green-700">You can upload a new document to replace the existing one.</p>
              </div>
            </div>
          )}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="document"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="document" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {file ? file.name : hasExistingDocument ? "Click to upload a new document" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (max. 10MB)</p>
            </label>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold"
          disabled={submitting || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </div>
  )
}
