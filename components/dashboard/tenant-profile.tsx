"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  Mail,
  Phone,
  BadgeIcon as IdCard,
  Calendar,
  Globe,
  Users,
  AlertCircle,
  CheckCircle,
  Camera,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import { apiClient } from "@/lib/api"

interface TenantData {
  tenantId: string
  firstName: string
  lastName: string
  primaryEmail: string
  primaryMobile: string
  emiratesIdNo: string
  emiratesIdExpiry: string
  nationality: string
  profileImage?: string
  emergencyContacts: Array<{
    contactId: string
    name: string
    relationship: string
    mobile: string
    email: string
  }>
  houseHoldMembers: Array<{
    memberId: string
    name: string
    relationship: string
    emiratesIdNo: string
    emiratesIdExpiry: string
    nationality: string
  }>
}

interface EmergencyContact {
  contactId?: string
  name: string
  relationship: string
  mobile: string
  email: string
}

export default function TenantProfile() {
  const [tenantData, setTenantData] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [emergencyForm, setEmergencyForm] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    mobile: "",
    email: "",
  })

  useEffect(() => {
    fetchTenantData()
  }, [])

  const fetchTenantData = async () => {
    try {
      const response = await apiClient.getTenantDetails()
      setTenantData(response.data)
    } catch (err) {
      setError("Failed to load tenant details")
      console.error("Error fetching tenant data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)

      // Upload file first
      const uploadResponse = await apiClient.uploadFile(file, "PROFILE_IMAGE")
      const referenceId = uploadResponse.referenceId || uploadResponse.fileId

      if (referenceId) {
        // Update profile with the reference ID
        await apiClient.updateUserDocument({
          documentType: "PROFILE_IMAGE",
          referenceId: referenceId,
        })

        // Refresh tenant data
        await fetchTenantData()
      }
    } catch (err) {
      console.error("Error uploading profile image:", err)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleEmergencyContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingContact?.contactId) {
        // Update existing contact
        await apiClient.updateEmergencyContact(editingContact.contactId, emergencyForm)
      } else {
        // Add new contact
        await apiClient.addEmergencyContact(emergencyForm)
      }

      // Reset form and close dialog
      setEmergencyForm({ name: "", relationship: "", mobile: "", email: "" })
      setEditingContact(null)
      setIsEmergencyDialogOpen(false)

      // Refresh data
      await fetchTenantData()
    } catch (err) {
      console.error("Error saving emergency contact:", err)
    }
  }

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact)
    setEmergencyForm(contact)
    setIsEmergencyDialogOpen(true)
  }

  const handleDeleteContact = async (contactId: string) => {
    try {
      await apiClient.deleteEmergencyContact(contactId)
      await fetchTenantData()
    } catch (err) {
      console.error("Error deleting emergency contact:", err)
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !tenantData) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchTenantData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
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

  const idStatus = getIdStatus(tenantData.emiratesIdExpiry)
  const StatusIcon = idStatus.icon

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Profile Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-2xl md:rounded-3xl overflow-hidden">
        <CardContent className="p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-16 md:-translate-y-32 translate-x-16 md:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-white/5 rounded-full translate-y-12 md:translate-y-24 -translate-x-12 md:-translate-x-24"></div>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
            <div className="relative flex-shrink-0">
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/30 shadow-2xl">
                <AvatarImage
                  src={tenantData.profileImage || "/placeholder.svg"}
                  alt={`${tenantData.firstName} ${tenantData.lastName}`}
                />
                <AvatarFallback className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                  {tenantData.firstName.charAt(0)}
                  {tenantData.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image-upload"
                  disabled={isUploadingImage}
                />
                <label
                  htmlFor="profile-image-upload"
                  className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 hover:bg-blue-600 rounded-full border-4 border-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  {isUploadingImage ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  )}
                </label>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {tenantData.firstName} {tenantData.lastName}
              </h1>
              <p className="text-blue-100 text-base md:text-lg mb-4">Verified Tenant</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 md:gap-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">Active Tenant</Badge>
                <Badge className={`${idStatus.color} border-white/30`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  Emirates ID {idStatus.status}
                </Badge>
              </div>
            </div>

            <Button
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-shrink-0"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Contact Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                <p className="text-gray-900 font-semibold text-sm md:text-base truncate">{tenantData.primaryEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">Mobile Number</p>
                <p className="text-gray-900 font-semibold text-sm md:text-base">{tenantData.primaryMobile}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">Nationality</p>
                <p className="text-gray-900 font-semibold text-sm md:text-base">{tenantData.nationality}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-purple-500" />
              Identity & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <IdCard className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">Emirates ID</p>
                <p className="text-gray-900 font-semibold font-mono text-xs md:text-sm break-all">
                  {tenantData.emiratesIdNo}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">ID Expiry Date</p>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 font-semibold text-sm md:text-base">
                    {new Date(tenantData.emiratesIdExpiry).toLocaleDateString()}
                  </p>
                  <Badge className={idStatus.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {idStatus.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Emergency Contacts
              </CardTitle>
              <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingContact(null)
                      setEmergencyForm({ name: "", relationship: "", mobile: "", email: "" })
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingContact ? "Edit" : "Add"} Emergency Contact</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEmergencyContactSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={emergencyForm.name}
                        onChange={(e) => setEmergencyForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        value={emergencyForm.relationship}
                        onChange={(e) => setEmergencyForm((prev) => ({ ...prev, relationship: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input
                        id="mobile"
                        value={emergencyForm.mobile}
                        onChange={(e) => setEmergencyForm((prev) => ({ ...prev, mobile: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={emergencyForm.email}
                        onChange={(e) => setEmergencyForm((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsEmergencyDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingContact ? "Update" : "Add"} Contact</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenantData.emergencyContacts && tenantData.emergencyContacts.length > 0 ? (
              tenantData.emergencyContacts.map((contact) => (
                <div key={contact.contactId} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {contact.relationship}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{contact.mobile}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditContact(contact)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteContact(contact.contactId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Emergency Contacts</h3>
                <p className="text-gray-600 mb-4">Add emergency contacts for safety and security purposes.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Household Members */}
        {tenantData.houseHoldMembers && tenantData.houseHoldMembers.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Household Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenantData.houseHoldMembers.map((member) => (
                  <div key={member.memberId} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {member.relationship}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Emirates ID: {member.emiratesIdNo}</p>
                    <p className="text-sm text-gray-600">Nationality: {member.nationality}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
