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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageViewer } from "@/components/ui/image-viewer"
import {
  Wrench,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building,
  RefreshCw,
  Upload,
  X,
  Zap,
  Droplets,
  Thermometer,
  Wifi,
  Eye,
  XCircle,
  DollarSign,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import type { WorkOrderResponse, LeaseDetailsResponse } from "@/lib/types/api-responses"

const categories = [
  { value: "FINANCE", label: "Finance", icon: DollarSign },
  { value: "DOCUMENT", label: "Document", icon: DollarSign },
  { value: "HVAC", label: "HVAC", icon: Thermometer },
  { value: "PLUMBING", label: "Plumbing", icon: Droplets },
  { value: "FLOORING", label: "Flooring", icon: Wrench },
  { value: "ELECTRICAL", label: "Electrical", icon: Zap },
  { value: "TECHNOLOGY", label: "Technology", icon: Wifi },
  { value: "GENERAL", label: "General", icon: Wrench },
]

const subcategoriesByCategory = {
  FINANCE: [
    { value: "OVERPAYMENT", label: "Overpayment" },
    { value: "REFUND_REQUEST", label: "Refund Request" },
    { value: "PAYMENT_DISPUTE", label: "Payment Dispute" },
    { value: "OTHERS", label: "Others" }
  ],
  DOCUMENT: [
    { value: "LEASE_RENEWAL", label: "Lease Renewal" },
    { value: "DOCUMENT_UPDATE", label: "Document Update" },
    { value: "CERTIFICATE_REQUEST", label: "Certificate Request" },
    { value: "OTHERS", label: "Others" }
  ],
  HVAC: [
    { value: "AC_NOT_COOLING", label: "AC Not Cooling" },
    { value: "HEATER_ISSUE", label: "Heater Issue" },
    { value: "VENTILATION_PROBLEM", label: "Ventilation Problem" },
    { value: "OTHERS", label: "Others" }
  ],
  PLUMBING: [
    { value: "LEAK", label: "Leak" },
    { value: "CLOGGED_DRAIN", label: "Clogged Drain" },
    { value: "WATER_PRESSURE", label: "Water Pressure Issue" },
    { value: "OTHERS", label: "Others" }
  ],
  FLOORING: [
    { value: "DAMAGED_TILES", label: "Damaged Tiles" },
    { value: "CARPET_REPAIR", label: "Carpet Repair" },
    { value: "FFLOOR_CLEANING", label: "Floor Cleaning" },
    { value: "OTHERS", label: "Others" }
  ],
  ELECTRICAL: [
    { value: "POWER_OUTAGE", label: "Power Outage" },
    { value: "FAULTY_WIRING", label: "Faulty Wiring" },
    { value: "LIGHTING_ISSUE", label: "Lighting Issue" },
    { value: "OTHERS", label: "Others" }
  ],
  TECHNOLOGY: [
    { value: "INTERNET_ISSUE", label: "Internet Connectivity" },
    { value: "SMART_HOME", label: "Smart Home Device" },
    { value: "SECURITY_SYSTEM", label: "Security System" },
    { value: "OTHERS", label: "Others" }
  ],
  GENERAL: [
    { value: "MAINTENANCE", label: "General Maintenance" },
    { value: "CLEANING", label: "Cleaning Request" },
    { value: "OTHER", label: "Other Issue" }
  ],
}

const priorities = [
  { value: "LOW", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "HIGH", label: "High", color: "bg-red-100 text-red-800" },
  { value: "URGENT", label: "Urgent", color: "bg-red-200 text-red-900" },
]

export default function MaintenancePage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderResponse[]>([])
  const [leases, setLeases] = useState<LeaseDetailsResponse[]>([])
  const [activeLeases, setActiveLeases] = useState<LeaseDetailsResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [cancellingWorkOrder, setCancellingWorkOrder] = useState<string | null>(null)

  // Image viewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [viewingImages, setViewingImages] = useState<string[]>([])
  const [imageViewerTitle, setImageViewerTitle] = useState("")

  const { user } = useAuth()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    propertyId: "",
    unitId: "",
    category: "",
    subcategory: "",
    description: "",
    priority: "MEDIUM",
    remarks: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch both work orders and leases
      const [workOrdersResponse, leasesResponse] = await Promise.all([
        apiClient.getWorkOrders(),
        apiClient.getMyLeases(),
      ])

      setWorkOrders(workOrdersResponse.data || [])
      setLeases(leasesResponse.data || [])

      // Set default property/unit if there's an active lease
      const activeLeases = leasesResponse.data?.filter((lease) => lease.rentalAgreement.leaseStatus === "ACTIVE") || []
      setActiveLeases(activeLeases)

      if (activeLeases.length > 0) {
        setFormData((prev) => ({
          ...prev,
          propertyId: activeLeases[0].rentalAgreement.propertyId || "",
          unitId: activeLeases[0].rentalAgreement.unitId || activeLeases[0].rentalAgreement.flatId || "",
        }))
      }
    } catch (err) {
      setError("Failed to load data")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await apiClient.getWorkOrders()
      setWorkOrders(response.data || [])
    } catch (err) {
      setError("Failed to load work orders")
      console.error("Error fetching work orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const response = await apiClient.uploadFile(file, "IMAGE")
          return response?.data || null
        } catch (err) {
          console.error("Error uploading file:", file.name, err)
          return null
        }
      })

      const imageIds = await Promise.all(uploadPromises)
      const validImageIds = imageIds.filter((id) => id !== null) as string[]

      if (validImageIds.length > 0) {
        setUploadedImages((prev) => [...(prev || []), ...validImageIds])
      }
    } catch (err) {
      console.error("Error uploading images:", err)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.userId) {
      console.error("User ID not available")
      return
    }

    if (!formData.propertyId || !formData.unitId) {
      console.error("Property ID and Unit ID are required")
      return
    }

    try {
      setIsSubmitting(true)

      const workOrderData = {
        title: formData.title || "Untitled Request",
        requestedByUserId: user.userId,
        requesterType: "TENANT" as const,
        propertyId: formData.propertyId,
        unitId: formData.unitId,
        category: formData.category || "GENERAL",
        subcategory: formData.subcategory || "",
        description: formData.description || "",
        workOrderStatus: "PENDING" as const,
        priority: formData.priority || "MEDIUM",
        requiresLandlordApproval: false, // Always false for tenant requests
        landlordApprovalStatus: "PENDING" as const,
        beforeImages: uploadedImages || [],
        remarks: formData.remarks || "",
      }

      await apiClient.createWorkOrder(workOrderData)

      // Reset form and close dialog
      setFormData({
        title: "",
        propertyId: formData.propertyId, // Keep the property/unit selected
        unitId: formData.unitId,
        category: "",
        subcategory: "",
        description: "",
        priority: "MEDIUM",
        remarks: "",
      })
      setUploadedImages([])
      setIsCreateDialogOpen(false)

      // Refresh work orders
      await fetchWorkOrders()
    } catch (err) {
      console.error("Error creating work order:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelWorkOrder = async (workOrderId: string) => {
    try {
      setCancellingWorkOrder(workOrderId)
      await apiClient.cancelWorkOrder(workOrderId)

      // Refresh work orders to show updated status
      await fetchWorkOrders()
    } catch (err) {
      console.error("Error cancelling work order:", err)
    } finally {
      setCancellingWorkOrder(null)
    }
  }

  const openImageViewer = (images: string[], title: string) => {
    setViewingImages(images)
    setImageViewerTitle(title)
    setImageViewerOpen(true)
  }

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800"

    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status?: string) => {
    if (!status) return <AlertTriangle className="w-4 h-4 text-gray-500" />

    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-100 text-gray-800"

    const priorityObj = priorities.find((p) => p.value === priority)
    return priorityObj?.color || "bg-gray-100 text-gray-800"
  }

  const getCategoryIcon = (category?: string) => {
    if (!category) return <Wrench className="w-5 h-5" />

    const categoryObj = categories.find((c) => c.value === category)
    const Icon = categoryObj?.icon || Wrench
    return <Icon className="w-5 h-5" />
  }

  const calculateSummary = () => {
    if (!workOrders || workOrders.length === 0) {
      return {
        totalRequests: 0,
        openRequests: 0,
        completedRequests: 0,
      }
    }

    const totalRequests = workOrders.length
    const openRequests = workOrders.filter(
      (wo) => wo && !["COMPLETED", "CANCELLED"].includes(wo.workOrderStatus?.toUpperCase() || ""),
    ).length
    const completedRequests = workOrders.filter((wo) => wo && wo.workOrderStatus?.toUpperCase() === "COMPLETED").length

    return {
      totalRequests,
      openRequests,
      completedRequests,
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  const summary = calculateSummary()

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Requests</h2>
          <p className="text-gray-600 text-sm md:text-base">Submit and track your property requests</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={activeLeases.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="property">Property</Label>
                  <Select
                    value={`${formData.propertyId}-${formData.unitId}`}
                    onValueChange={(value) => {
                      const [propertyId, unitId] = value.split("-")
                      setFormData((prev) => ({ ...prev, propertyId, unitId }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLeases.map((lease) => (
                        <SelectItem
                          key={lease.rentalAgreement.leaseId}
                          value={`${lease.rentalAgreement.propertyId}-${lease.rentalAgreement.unitId || lease.rentalAgreement.flatId}`}
                        >
                          {lease.rentalAgreement.propertyName} - Unit {lease.rentalAgreement.flatNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value, subcategory: "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value }))}
                      disabled={!formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.category && subcategoriesByCategory[formData.category as keyof typeof subcategoriesByCategory]?.map((subcategory) => (
                          <SelectItem key={subcategory.value} value={subcategory.value}>
                            {subcategory.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the issue"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="remarks">Additional Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Any additional information"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Upload Images</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload images</p>
                      </div>
                    </label>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {uploadedImages.map((imageId, index) => (
                        <div key={index} className="relative bg-gray-100 p-2 rounded">
                          <span className="text-xs text-gray-600">Image {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Show message if no active leases */}
      {activeLeases.length === 0 && (
        <Card className="border-0 shadow-lg bg-yellow-50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">No Active Lease</h3>
                <p className="text-yellow-700 text-sm">You need an active lease to create requests.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Total Requests</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{summary.totalRequests}</p>
            <p className="text-blue-100 text-xs md:text-sm">All time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Open Requests</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{summary.openRequests}</p>
            <p className="text-yellow-100 text-xs md:text-sm">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="font-semibold text-sm md:text-base">Completed</h3>
            </div>
            <p className="text-xl md:text-2xl font-bold">{summary.completedRequests}</p>
            <p className="text-green-100 text-xs md:text-sm">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders List */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Requests</CardTitle>
          <p className="text-gray-600">Track the status of your requests</p>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any requests yet.</p>
              {activeLeases.length > 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Request
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {workOrders.map((workOrder) => {
                if (!workOrder) return null

                const hasBeforeImages = workOrder.beforeImages && workOrder.beforeImages.length > 0
                const hasAfterImages = workOrder.afterImages && workOrder.afterImages.length > 0
                const isPending = workOrder.workOrderStatus?.toUpperCase() === "PENDING"
                const isCancelling = cancellingWorkOrder === workOrder.workOrderId

                return (
                  <div
                    key={workOrder.workOrderId || Math.random()}
                    className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                          {getCategoryIcon(workOrder.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-sm md:text-base">
                              {workOrder.title || "Untitled Request"}
                            </h4>
                            {workOrder.priority && (
                              <Badge className={getPriorityColor(workOrder.priority)}>{workOrder.priority}</Badge>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mb-2">
                            {workOrder.description || "No description provided"}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            {workOrder.category && <span>Category: {workOrder.category}</span>}
                            {workOrder.subcategory && <span>• {workOrder.subcategory}</span>}
                            {hasBeforeImages && <span>• {workOrder.beforeImages.length} before image(s)</span>}
                            {hasAfterImages && <span>• {workOrder.afterImages.length} after image(s)</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 mb-2 justify-end">
                          {getStatusIcon(workOrder.workOrderStatus)}
                          <Badge className={getStatusColor(workOrder.workOrderStatus)}>
                            {workOrder.workOrderStatus?.replace("_", " ") || "Unknown"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Updated {workOrder.updatedAt ? formatDate(workOrder.updatedAt) : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-gray-500">Created</p>
                          <p className="font-semibold">
                            {workOrder.createdAt ? formatDate(workOrder.createdAt) : "N/A"}
                          </p>
                        </div>
                      </div>
                      {workOrder.assignedToName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-gray-500">Assigned to</p>
                            <p className="font-semibold">{workOrder.assignedToName}</p>
                          </div>
                        </div>
                      )}
                      {workOrder.propertyName && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-gray-500">Property</p>
                            <p className="font-semibold">
                              {workOrder.propertyName}
                              {workOrder.flatNumber && ` - Unit ${workOrder.flatNumber}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {workOrder.remarks && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Remarks:</strong> {workOrder.remarks}
                        </p>
                      </div>
                    )}

                    {workOrder.landlordRemarks && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Landlord Remarks:</strong> {workOrder.landlordRemarks}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {hasBeforeImages && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openImageViewer(workOrder.beforeImages, "Before Images")}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Before Images ({workOrder.beforeImages.length})
                        </Button>
                      )}

                      {hasAfterImages && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openImageViewer(workOrder.afterImages, "After Images")}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          After Images ({workOrder.afterImages.length})
                        </Button>
                      )}

                      {isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleCancelWorkOrder(workOrder.id)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Request
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Viewer */}
      <ImageViewer
        images={viewingImages}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        title={imageViewerTitle}
      />
    </div>
  )
}