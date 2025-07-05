"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Upload, Eye, Download, Lock, User, BadgeIcon as IdCard } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { UpdateProfileRequest, ChangePasswordRequest } from "@/lib/types/api-requests"
import { TenantDetailsResponse } from "@/lib/types/api-responses"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  tenantData: TenantDetailsResponse
  onUpdate: () => void
}

export default function EditProfileModal({ isOpen, onClose, tenantData, onUpdate }: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingId, setIsUploadingId] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState<UpdateProfileRequest>({
    firstName: tenantData.firstName,
    lastName: tenantData.lastName,
    primaryEmail: tenantData.primaryEmail,
    primaryMobile: tenantData.primaryMobile,
    emiratesIdNo: tenantData.emiratesIdNo,
    emiratesIdExpiry: tenantData.emiratesIdExpiry,
    nationality: tenantData.nationality,
  })

  interface PasswordChangeType{
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
  // Password Form State
  const [passwordForm, setPasswordForm] = useState<PasswordChangeType>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Document Preview State
  const [documentPreview, setDocumentPreview] = useState<{
    isOpen: boolean
    url: string
    type: "pdf" | "image" | "unknown"
    imageError: boolean
  }>({
    isOpen: false,
    url: "",
    type: "unknown",
    imageError: false,
  })

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await apiClient.updateTenantProfile(personalForm)
      setSuccess("Profile updated successfully!")
      onUpdate()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to update profile. Please try again.")
      console.error("Error updating profile:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      await apiClient.changePassword({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setSuccess("Password changed successfully!")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to change password. Please check your current password.")
      console.error("Error changing password:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleIdDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingId(true)
      setError("")

      // Upload file first
      const uploadResponse = await apiClient.uploadFile(file, "ID_PROOF")
      const referenceId = uploadResponse.data

      if (referenceId) {
        // Update profile with the reference ID
        await apiClient.updateTenantProfile({
          
          documentPath: referenceId,
        })

        setSuccess("Emirates ID document uploaded successfully!")
        onUpdate()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      setError("Failed to upload Emirates ID document")
      console.error("Error uploading Emirates ID:", err)
    } finally {
      setIsUploadingId(false)
    }
  }

  const getFileType = (url: string): "pdf" | "image" | "unknown" => {
    const extension = url.split(".").pop()?.toLowerCase()
    if (extension === "pdf") return "pdf"
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) return "image"
    return "unknown"
  }

  const handleViewDocument = (url: string) => {
    const fileType = getFileType(url)
    setDocumentPreview({
      isOpen: true,
      url,
      type: fileType,
      imageError: false,
    })
  }

  const handleDownloadDocument = (url: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = `Emirates_ID_${tenantData.firstName}_${tenantData.lastName}`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageError = () => {
    setDocumentPreview((prev) => ({ ...prev, imageError: true }))
  }

  const isIdExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90 && diffDays > 0
  }

  const isIdExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  const getIdStatus = (expiryDate: string) => {
    if (isIdExpired(expiryDate)) {
      return { status: "Expired", color: "bg-red-100 text-red-800", icon: AlertCircle }
    } else if (isIdExpiringSoon(expiryDate)) {
      return { status: "Expiring Soon", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle }
    } else {
      return { status: "Valid", color: "bg-green-100 text-green-800", icon: CheckCircle }
    }
  }

  const idStatus = getIdStatus(personalForm.emiratesIdExpiry || tenantData.emiratesIdExpiry)
  const StatusIcon = idStatus.icon

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <IdCard className="w-4 h-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={personalForm.firstName}
                          onChange={(e) => setPersonalForm((prev) => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={personalForm.lastName}
                          onChange={(e) => setPersonalForm((prev) => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryEmail">Email Address</Label>
                        <Input
                          id="primaryEmail"
                          type="email"
                          value={personalForm.primaryEmail}
                          onChange={(e) => setPersonalForm((prev) => ({ ...prev, primaryEmail: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="primaryMobile">Mobile Number</Label>
                        <Input
                          id="primaryMobile"
                          value={personalForm.primaryMobile}
                          onChange={(e) => setPersonalForm((prev) => ({ ...prev, primaryMobile: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={personalForm.nationality}
                        onChange={(e) => setPersonalForm((prev) => ({ ...prev, nationality: e.target.value }))}
                        required
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Emirates ID Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emiratesIdNo">Emirates ID Number</Label>
                          <Input
                            id="emiratesIdNo"
                            value={personalForm.emiratesIdNo}
                            onChange={(e) => setPersonalForm((prev) => ({ ...prev, emiratesIdNo: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="emiratesIdExpiry">Emirates ID Expiry Date</Label>
                          <div className="space-y-2">
                            <Input
                              id="emiratesIdExpiry"
                              type="date"
                              value={personalForm.emiratesIdExpiry}
                              onChange={(e) =>
                                setPersonalForm((prev) => ({ ...prev, emiratesIdExpiry: e.target.value }))
                              }
                              required
                            />
                            <Badge className={idStatus.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {idStatus.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Profile"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emirates ID Document</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tenantData.emiratesIdDocument && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Current Emirates ID Document</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(tenantData.emiratesIdDocument!)}
                            className="text-xs px-2 py-1 h-7"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadDocument(tenantData.emiratesIdDocument!)}
                            className="text-xs px-2 py-1 h-7"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Uploaded: {new Date(tenantData.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Upload New Emirates ID Document</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleIdDocumentUpload}
                        className="hidden"
                        id="emirates-id-upload"
                        disabled={isUploadingId}
                      />
                      <label
                        htmlFor="emirates-id-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <div className="text-center">
                          {isUploadingId ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm text-gray-600">Uploading...</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={8}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Changing..." : "Change Password"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog
        open={documentPreview.isOpen}
        onOpenChange={() => setDocumentPreview((prev) => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Emirates ID Document Preview</DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-6 pt-0">
            <div className="bg-gray-50 rounded-lg p-4 h-[60vh] flex items-center justify-center">
              {documentPreview.type === "pdf" ? (
                <iframe src={documentPreview.url} className="w-full h-full rounded border" title="Document Preview" />
              ) : documentPreview.type === "image" ? (
                documentPreview.imageError ? (
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Unable to load image preview</p>
                    <Button variant="outline" onClick={() => window.open(documentPreview.url, "_blank")}>
                      Open in New Tab
                    </Button>
                  </div>
                ) : (
                  <img
                    src={documentPreview.url || "/placeholder.svg"}
                    alt="Document Preview"
                    className="max-w-full max-h-full object-contain rounded"
                    crossOrigin="anonymous"
                    onError={handleImageError}
                  />
                )
              ) : (
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                  <Button variant="outline" onClick={() => window.open(documentPreview.url, "_blank")}>
                    Open in New Tab
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 p-6 pt-0">
            <Button variant="outline" onClick={() => handleDownloadDocument(documentPreview.url)}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={() => window.open(documentPreview.url, "_blank")}>
              Open in New Tab
            </Button>
            <Button onClick={() => setDocumentPreview((prev) => ({ ...prev, isOpen: false }))}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
