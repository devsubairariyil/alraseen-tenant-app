"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Upload, CheckCircle2, Phone, Mail, User as UserIcon } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { TenantDetailsResponse, EmergencyContact } from "@/lib/types/api-responses"
import type { EmergencyContactRequest } from "@/lib/types/api-requests"

interface ProfileCompletionModalProps {
  tenantData: TenantDetailsResponse | null
  onComplete: () => void
}

export default function ProfileCompletionModal({ tenantData, onComplete }: ProfileCompletionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"emirates" | "emergency">("emirates")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Emirates ID form state
  const [emiratesForm, setEmiratesForm] = useState({
    emiratesIdNo: "",
    emiratesIdExpiry: "",
  })
  const [emiratesIdFile, setEmiratesIdFile] = useState<File | null>(null)
  const [isUploadingEmiratesId, setIsUploadingEmiratesId] = useState(false)

  // Emergency contact form state
  const [emergencyForm, setEmergencyForm] = useState<EmergencyContactRequest>({
    name: "",
    relationship: "",
    mobile: "",
    email: "",
  })

  // Check if Emirates ID is missing or expired
  const isEmiratesIdMissing = !tenantData?.emiratesIdNo || !tenantData?.emiratesIdExpiry
  const isEmiratesIdExpired = tenantData?.emiratesIdExpiry 
    ? new Date(tenantData.emiratesIdExpiry) < new Date() 
    : false

  // Check if emergency contacts are missing
  const hasNoEmergencyContacts = !tenantData?.emergencyContacts || tenantData.emergencyContacts.length === 0

  // Determine what needs to be completed
  const needsEmiratesIdUpdate = isEmiratesIdMissing || isEmiratesIdExpired
  const needsEmergencyContact = hasNoEmergencyContacts

  useEffect(() => {
    if (tenantData && (needsEmiratesIdUpdate || needsEmergencyContact)) {
      setIsOpen(true)
      // Set initial tab based on what's needed
      if (needsEmiratesIdUpdate) {
        setActiveTab("emirates")
      } else if (needsEmergencyContact) {
        setActiveTab("emergency")
      }
    }

    // Pre-fill existing data if available
    if (tenantData) {
      setEmiratesForm({
        emiratesIdNo: tenantData.emiratesIdNo || "",
        emiratesIdExpiry: tenantData.emiratesIdExpiry ? tenantData.emiratesIdExpiry.split('T')[0] : "",
      })
    }
  }, [tenantData, needsEmiratesIdUpdate, needsEmergencyContact])

  const handleEmiratesIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEmiratesIdFile(file)
    }
  }

  const handleSubmitEmiratesId = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      // Validate expiry date is in the future
      const expiryDate = new Date(emiratesForm.emiratesIdExpiry)
      if (expiryDate < new Date()) {
        setError("Emirates ID expiry date must be in the future")
        setIsSubmitting(false)
        return
      }

      // Upload Emirates ID document if provided
      let emiratesIdReference = tenantData?.emiratesIdDocument
      if (emiratesIdFile) {
        setIsUploadingEmiratesId(true)
        const uploadResponse = await apiClient.uploadFile(emiratesIdFile, "EMIRATES_ID")
        emiratesIdReference = uploadResponse.data
        setIsUploadingEmiratesId(false)
      }

      // Update profile with Emirates ID details
      await apiClient.updateTenantProfile({
        emiratesIdNo: emiratesForm.emiratesIdNo,
        emiratesIdExpiry: emiratesForm.emiratesIdExpiry,
      })

      // Update Emirates ID document if uploaded
      if (emiratesIdFile && emiratesIdReference) {
        await apiClient.updateUserDocument({
          type: "EMIRATES_ID",
          documentReference: emiratesIdReference,
        })
      }

      setSuccess("Emirates ID updated successfully!")
      
      // If emergency contact is also needed, move to that tab
      if (needsEmergencyContact) {
        setTimeout(() => {
          setActiveTab("emergency")
          setSuccess("")
        }, 1500)
      } else {
        // Complete the process
        setTimeout(() => {
          onComplete()
          setIsOpen(false)
        }, 1500)
      }
    } catch (err) {
      console.error("Error updating Emirates ID:", err)
      setError("Failed to update Emirates ID. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEmergencyContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      await apiClient.addEmergencyContact(emergencyForm)
      setSuccess("Emergency contact added successfully!")
      
      // If Emirates ID was also needed and already completed, or only emergency contact was needed
      if (!needsEmiratesIdUpdate || success.includes("Emirates ID")) {
        setTimeout(() => {
          onComplete()
          setIsOpen(false)
        }, 1500)
      }
    } catch (err) {
      console.error("Error adding emergency contact:", err)
      setError("Failed to add emergency contact. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tenantData || (!needsEmiratesIdUpdate && !needsEmergencyContact)) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Please complete the following required information to continue using the tenant portal.
          </DialogDescription>
        </DialogHeader>

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap">
          {needsEmiratesIdUpdate && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {isEmiratesIdMissing ? "Emirates ID Missing" : "Emirates ID Expired"}
            </Badge>
          )}
          {needsEmergencyContact && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              No Emergency Contact
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "emirates" | "emergency")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emirates" disabled={!needsEmiratesIdUpdate}>
              Emirates ID
              {!needsEmiratesIdUpdate && <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="emergency" disabled={!needsEmergencyContact}>
              Emergency Contact
              {!needsEmergencyContact && <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          {/* Emirates ID Tab */}
          <TabsContent value="emirates" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isEmiratesIdMissing 
                  ? "Your Emirates ID information is missing. Please provide your Emirates ID details."
                  : "Your Emirates ID has expired. Please update your Emirates ID details."}
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmitEmiratesId} className="space-y-4">
              <div>
                <Label htmlFor="emiratesIdNo">Emirates ID Number *</Label>
                <Input
                  id="emiratesIdNo"
                  value={emiratesForm.emiratesIdNo}
                  onChange={(e) => setEmiratesForm((prev) => ({ ...prev, emiratesIdNo: e.target.value }))}
                  placeholder="784-XXXX-XXXXXXX-X"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="emiratesIdExpiry">Expiry Date *</Label>
                <Input
                  id="emiratesIdExpiry"
                  type="date"
                  value={emiratesForm.emiratesIdExpiry}
                  onChange={(e) => setEmiratesForm((prev) => ({ ...prev, emiratesIdExpiry: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="emiratesIdFile">Upload Emirates ID Document</Label>
                <div className="mt-2">
                  <Input
                    id="emiratesIdFile"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleEmiratesIdFileChange}
                    disabled={isSubmitting || isUploadingEmiratesId}
                  />
                  {emiratesIdFile && (
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {emiratesIdFile.name}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isUploadingEmiratesId}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Emirates ID"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Emergency Contact Tab */}
          <TabsContent value="emergency" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have any emergency contacts. Please add at least one emergency contact for safety purposes.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmitEmergencyContact} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    value={emergencyForm.name}
                    onChange={(e) => setEmergencyForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={emergencyForm.relationship}
                  onChange={(e) => setEmergencyForm((prev) => ({ ...prev, relationship: e.target.value }))}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="mobile"
                    value={emergencyForm.mobile}
                    onChange={(e) => setEmergencyForm((prev) => ({ ...prev, mobile: e.target.value }))}
                    placeholder="+971 50 123 4567"
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={emergencyForm.email}
                    onChange={(e) => setEmergencyForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Emergency Contact"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-gray-600 text-center pt-4 border-t bg-blue-50/50 -mx-6 px-6 py-3 rounded-b-lg">
          <p className="font-medium">This information helps us serve you better and ensure your safety.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
