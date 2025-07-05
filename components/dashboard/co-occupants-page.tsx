"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Plus,
  Calendar,
  AlertTriangle,
  User,
  Globe,
  BadgeIcon as IdCard,
  RefreshCw,
  Edit,
  UserX,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Clock,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import type { LeaseDetailsResponse, HouseholdMember } from "@/lib/types/api-responses"
import type { CreateHouseholdMemberRequest, UpdateHouseholdMemberRequest } from "@/lib/types/api-requests"

const relationships = ["Spouse", "Child", "Parent", "Sibling", "Relative", "Friend", "Other"]

const nationalities = [
  "UAE",
  "Saudi Arabia",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "India",
  "Pakistan",
  "Bangladesh",
  "Philippines",
  "Egypt",
  "Jordan",
  "Lebanon",
  "Syria",
  "Palestine",
  "Sudan",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Other",
]

// Status configuration
const getStatusConfig = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      }
    case "PENDING":
      return {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      }
    case "LEFT":
      return {
        label: "Left",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: UserX,
      }
    default:
      return {
        label: "Unknown",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: User,
      }
  }
}

export default function CoOccupantsPage() {
  const [leases, setLeases] = useState<LeaseDetailsResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null)
  const [uploadingEmiratesId, setUploadingEmiratesId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateHouseholdMemberRequest>({
    name: "",
    email: "",
    phone: "",
    relationship: "",
    emiratesIdNo: "",
    emiratesIdExpiry: "",
    nationality: "",
    documentPath: "",
    joiningDate: "",
  })

  const [editFormData, setEditFormData] = useState<UpdateHouseholdMemberRequest>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await apiClient.getMyLeases()
      setLeases(response.data || [])
    } catch (err) {
      setError("Failed to load data")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.relationship ||
      !formData.emiratesIdNo ||
      !formData.emiratesIdExpiry ||
      !formData.nationality ||
      !formData.joiningDate
    ) {
      return
    }

    try {
      setIsSubmitting(true)
      await apiClient.createHouseholdMember(formData)

      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        phone: "",
        relationship: "",
        emiratesIdNo: "",
        emiratesIdExpiry: "",
        nationality: "",
        documentPath: "",
        joiningDate: "",
      })
      setIsCreateDialogOpen(false)

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error("Error creating household member:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return

    try {
      setIsSubmitting(true)
      await apiClient.updateHouseholdMember(editingMember.memberId, editFormData)

      // Close dialog and refresh data
      setIsEditDialogOpen(false)
      setEditingMember(null)
      setEditFormData({})
      await fetchData()
    } catch (err) {
      console.error("Error updating household member:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsLeft = async (memberId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0]
      await apiClient.updateHouseholdMember(memberId, {
        status: "LEFT",
        leavingDate: today,
      })
      await fetchData()
    } catch (err) {
      console.error("Error marking member as left:", err)
    }
  }

  const handleEditMember = (member: HouseholdMember) => {
    setEditingMember(member)
    setEditFormData({
      name: member.name,
      email: member.email,
      phone: member.mobile,
      relationship: member.relationship,
      emiratesIdNo: member.emiratesIdNo,
      emiratesIdExpiry: member.emiratesIdExpiry,
      nationality: member.nationality,
      joiningDate: member.joiningDate,
    })
    setIsEditDialogOpen(true)
  }

  const handleEmiratesIdUpload = async (event: React.ChangeEvent<HTMLInputElement>, memberId?: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      if (memberId) {
        setUploadingEmiratesId(memberId)
      }

      // Upload file first
      const uploadResponse = await apiClient.uploadFile(file, "ID_PROOF")
      const referenceId = uploadResponse.data

      if (referenceId) {
        if (memberId) {
          // Update existing member's Emirates ID
          await apiClient.updateHouseholdMember(memberId, {
            documentPath: referenceId,
          })
          await fetchData()
        } else {
          // Set for new member form
          setFormData((prev) => ({ ...prev, documentPath: referenceId }))
        }
      }
    } catch (err) {
      console.error("Error uploading Emirates ID:", err)
    } finally {
      setUploadingEmiratesId(null)
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

  const getIdStatus = (expiryDate: string) => {
    if (isIdExpired(expiryDate)) {
      return { status: "Expired", color: "bg-red-100 text-red-800", icon: AlertCircle }
    } else if (isIdExpiringSoon(expiryDate)) {
      return { status: "Expiring Soon", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle }
    } else {
      return { status: "Valid", color: "bg-green-100 text-green-800", icon: CheckCircle }
    }
  }

  const getAllHouseholdMembers = () => {
    const allMembers: (HouseholdMember & { propertyName?: string; flatNumber?: string })[] = []

    leases.forEach((lease) => {
      lease.houseHoldMembers?.forEach((member) => {
        allMembers.push({
          ...member,
          propertyName: lease.rentalAgreement.propertyName,
          flatNumber: lease.rentalAgreement.flatNumber,
        })
      })
    })

    return allMembers
  }

  const allMembers = getAllHouseholdMembers()
  const activeMembers = allMembers.filter((member) => member.status === "ACTIVE")
  const pendingMembers = allMembers.filter((member) => member.status === "PENDING")
  const leftMembers = allMembers.filter((member) => member.status === "LEFT")

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Co-Occupants</h2>
          <p className="text-gray-600 text-sm md:text-base">Manage household members and co-occupants</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Household Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emiratesIdNo">Emirates ID Number</Label>
                    <Input
                      id="emiratesIdNo"
                      value={formData.emiratesIdNo}
                      onChange={(e) => setFormData((prev) => ({ ...prev, emiratesIdNo: e.target.value }))}
                      placeholder="784-XXXX-XXXXXXX-X"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emiratesIdExpiry">Emirates ID Expiry</Label>
                    <Input
                      id="emiratesIdExpiry"
                      type="date"
                      value={formData.emiratesIdExpiry}
                      onChange={(e) => setFormData((prev) => ({ ...prev, emiratesIdExpiry: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Select
                      value={formData.nationality}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, nationality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalities.map((nationality) => (
                          <SelectItem key={nationality} value={nationality}>
                            {nationality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, joiningDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Emirates ID Document</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleEmiratesIdUpload(e)}
                      className="hidden"
                      id="emirates-id-upload-new"
                    />
                    <label
                      htmlFor="emirates-id-upload-new"
                      className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Upload Emirates ID</p>
                      </div>
                    </label>
                  </div>
                  {formData.documentPath && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Emirates ID document uploaded successfully</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Member"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Total Members</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{allMembers.length}</p>
            <p className="text-blue-100 text-xs md:text-sm">All household members</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Active Members</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{activeMembers.length}</p>
            <p className="text-green-100 text-xs md:text-sm">Currently residing</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Pending Members</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{pendingMembers.length}</p>
            <p className="text-yellow-100 text-xs md:text-sm">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserX className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Left Members</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{leftMembers.length}</p>
            <p className="text-red-100 text-xs md:text-sm">No longer residing</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Members */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Active Co-Occupants</CardTitle>
          <p className="text-gray-600">Currently residing household members</p>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Members</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : activeMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Members</h3>
              <p className="text-gray-600 mb-4">Add household members to manage co-occupants.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMembers.map((member) => {
                const idStatus = getIdStatus(member.emiratesIdExpiry)
                const StatusIcon = idStatus.icon
                const memberStatus = getStatusConfig(member.status)
                const MemberStatusIcon = memberStatus.icon

                return (
                  <div
                    key={member.memberId}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{member.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {member.relationship}
                            </Badge>
                            <Badge className={`text-xs border ${memberStatus.color}`}>
                              <MemberStatusIcon className="w-3 h-3 mr-1" />
                              {memberStatus.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditMember(member)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsLeft(member.memberId)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserX className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="text-xs">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-xs">{member.mobile}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IdCard className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-600">Emirates ID:</span>
                        <span className="font-mono text-xs">{member.emiratesIdNo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">Expiry:</span>
                        <span>{new Date(member.emiratesIdExpiry).toLocaleDateString()}</span>
                        <Badge className={idStatus.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {idStatus.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Nationality:</span>
                        <span>{member.nationality}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">Joined:</span>
                        <span>{new Date(member.joiningDate).toLocaleDateString()}</span>
                      </div>
                      {member.propertyName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600">Property:</span>
                          <span>
                            {member.propertyName} - Unit {member.flatNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Emirates ID Document:</span>
                        <div className="flex gap-2">
                          {member.documentPath ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(member.documentPath, "_blank")}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          ) : null}
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleEmiratesIdUpload(e, member.memberId)}
                              className="hidden"
                              id={`emirates-id-upload-${member.memberId}`}
                              disabled={uploadingEmiratesId === member.memberId}
                            />
                            <label
                              htmlFor={`emirates-id-upload-${member.memberId}`}
                              className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                            >
                              {uploadingEmiratesId === member.memberId ? (
                                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <Upload className="w-3 h-3 mr-1" />
                              )}
                              {member.documentPath ? "Update" : "Upload"}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Pending Co-Occupants</CardTitle>
            <p className="text-gray-600">Members awaiting approval</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingMembers.map((member) => {
                const memberStatus = getStatusConfig(member.status)
                const MemberStatusIcon = memberStatus.icon

                return (
                  <div key={member.memberId} className="border border-yellow-200 rounded-xl p-4 bg-yellow-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{member.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {member.relationship}
                            </Badge>
                            <Badge className={`text-xs border ${memberStatus.color}`}>
                              <MemberStatusIcon className="w-3 h-3 mr-1" />
                              {memberStatus.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditMember(member)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="text-xs">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-xs">{member.mobile}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IdCard className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-600">Emirates ID:</span>
                        <span className="font-mono text-xs">{member.emiratesIdNo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Nationality:</span>
                        <span>{member.nationality}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">Joined:</span>
                        <span>{new Date(member.joiningDate).toLocaleDateString()}</span>
                      </div>
                      {member.propertyName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600">Property:</span>
                          <span>
                            {member.propertyName} - Unit {member.flatNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Left Members */}
      {leftMembers.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Previous Co-Occupants</CardTitle>
            <p className="text-gray-600">Members who have left the property</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leftMembers.map((member) => {
                const memberStatus = getStatusConfig(member.status)
                const MemberStatusIcon = memberStatus.icon

                return (
                  <div key={member.memberId} className="border border-gray-200 rounded-xl p-4 bg-gray-50 opacity-75">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-700">{member.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {member.relationship}
                            </Badge>
                            <Badge className={`text-xs border ${memberStatus.color}`}>
                              <MemberStatusIcon className="w-3 h-3 mr-1" />
                              {memberStatus.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Email:</span>
                        <span className="text-xs">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>Phone:</span>
                        <span className="text-xs">{member.mobile}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IdCard className="w-4 h-4" />
                        <span>Emirates ID:</span>
                        <span className="font-mono text-xs">{member.emiratesIdNo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>Nationality:</span>
                        <span>{member.nationality}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined:</span>
                        <span>{new Date(member.joiningDate).toLocaleDateString()}</span>
                      </div>
                      {member.leavingDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Left:</span>
                          <span>{new Date(member.leavingDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {member.propertyName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Property:</span>
                          <span>
                            {member.propertyName} - Unit {member.flatNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Household Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="edit-relationship">Relationship</Label>
                <Select
                  value={editFormData.relationship || ""}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, relationship: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((rel) => (
                      <SelectItem key={rel} value={rel}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editFormData.phone || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-emiratesIdNo">Emirates ID Number</Label>
                <Input
                  id="edit-emiratesIdNo"
                  value={editFormData.emiratesIdNo || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, emiratesIdNo: e.target.value }))}
                  placeholder="784-XXXX-XXXXXXX-X"
                />
              </div>
              <div>
                <Label htmlFor="edit-emiratesIdExpiry">Emirates ID Expiry</Label>
                <Input
                  id="edit-emiratesIdExpiry"
                  type="date"
                  value={editFormData.emiratesIdExpiry || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, emiratesIdExpiry: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nationality">Nationality</Label>
                <Select
                  value={editFormData.nationality || ""}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, nationality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalities.map((nationality) => (
                      <SelectItem key={nationality} value={nationality}>
                        {nationality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-joiningDate">Joining Date</Label>
                <Input
                  id="edit-joiningDate"
                  type="date"
                  value={editFormData.joiningDate || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, joiningDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
