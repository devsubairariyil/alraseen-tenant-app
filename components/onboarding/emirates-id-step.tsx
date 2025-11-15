"use client"

import React, { useState } from "react"
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
import { toast } from "sonner"

export function EmiratesIdStep() {
  const { tenantData, markStepComplete, goToNextStep, refreshTenantData } = useOnboarding()
  const [emiratesIdNo, setEmiratesIdNo] = useState(tenantData?.tenantItem.emiratesIdNo || "")
  const [emiratesIdExpiry, setEmiratesIdExpiry] = useState<Date | undefined>(
    tenantData?.tenantItem.emiratesIdExpiry ? new Date(tenantData.tenantItem.emiratesIdExpiry) : undefined
  )
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

    try {
      setSubmitting(true)

      let documentPath = tenantData?.tenantItem.emiratesIdDocument

      // Upload file if provided
      if (file) {
        setUploading(true)
        const uploadResponse = await apiClient.uploadFile(file, "EMIRATES_ID")
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
      await refreshTenantData()
      markStepComplete("emirates-id")
      goToNextStep()
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
            Upload Emirates ID Copy {!tenantData?.tenantItem.emiratesIdDocument && <span className="text-red-500">*</span>}
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="document"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              required={!tenantData?.tenantItem.emiratesIdDocument}
            />
            <label htmlFor="document" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {file ? file.name : "Click to upload or drag and drop"}
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
