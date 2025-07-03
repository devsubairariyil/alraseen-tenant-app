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
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface WorkOrderData {
  workOrderId: string
  title: string
  requestedByUserId: string
  requesterType: string
  propertyId: string
  unitId: string
  category: string
  subcategory: string
  description: string
  workOrderStatus: string
  priority: string
  assignedToUserId: string
  requiresLandlordApproval: boolean
  landlordApprovalStatus: string
  approvedByLandlordId: string
  landlordRemarks: string
  beforeImages: string[]
  afterImages: string[]
  remarks: string
  createdAt: string
  updatedAt: string
  propertyName?: string
  flatNumber?: string
  assignedToName?: string
}

const categories = [
  { value: "HVAC", label: "HVAC", icon: Thermometer },
  { value: "PLUMBING", label: "Plumbing", icon: Droplets },
  { value: "ELECTRICAL", label: "Electrical", icon: Zap },
  { value: "TECHNOLOGY", label: "Technology", icon: Wifi },
  { value: "GENERAL", label: "General", icon: Wrench },
]

const priorities = [
  { value: "LOW", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "HIGH", label: "High", color: "bg-red-100 text-red-800" },
  { value: "URGENT", label: "Urgent", color: "bg-red-200 text-red-900" },
]

export default function MaintenancePage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const { user } = useAuth()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    description: "",
    priority: "MEDIUM",
    requiresLandlordApproval: false,
    remarks: "",
  })

  useEffect(() => {
    fetchWorkOrders()
  }, [])

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
          const response = await apiClient.uploadFile(file, "MAINTENANCE")
          return response?.referenceId || response?.fileId || null
        } catch (err) {
          console.error("Error uploading file:", file.name, err)
          return null
        }
      })

      const imageIds = await Promise.all(uploadPromises)
      const validImageIds = imageIds.filter((id) => id !== null)

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

    try {
      setIsSubmitting(true)

      const workOrderData = {
        title: formData.title || "Untitled Request",
        requestedByUserId: user.userId,
        requesterType: "TENANT",
        propertyId: "placeholder-property-id",
        unitId: "placeholder-unit-id",
        category: formData.category || "GENERAL",
        subcategory: formData.subcategory || "",
        description: formData.description || "",
        workOrderStatus: "PENDING" as const,
        priority: formData.priority || "MEDIUM",
        requiresLandlordApproval: formData.requiresLandlordApproval || false,
        landlordApprovalStatus: "PENDING" as const,
        beforeImages: uploadedImages || [],
        remarks: formData.remarks || "",
      }

      await apiClient.createWorkOrder(workOrderData)

      // Reset form and close dialog
      setFormData({
        title: "",
        category: "",
        subcategory: "",
        description: "",
        priority: "MEDIUM",
        requiresLandlordApproval: false,
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
        return <AlertTriangle className="w-4 h-4 text-red-500" />
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Maintenance Requests</h2>
          <p className="text-gray-600 text-sm md:text-base">Submit and track your property maintenance requests</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchWorkOrders} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Maintenance Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
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
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="Specific type of issue"
                    required
                  />
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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="landlordApproval"
                    checked={formData.requiresLandlordApproval}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requiresLandlordApproval: e.target.checked }))}
                  />
                  <Label htmlFor="landlordApproval">Requires landlord approval</Label>
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
          <CardTitle className="text-xl font-bold text-gray-900">Maintenance Requests</CardTitle>
          <p className="text-gray-600">Track the status of your maintenance requests</p>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchWorkOrders} variant="outline">
                Try Again
              </Button>
            </div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance Requests</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any maintenance requests yet.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workOrders.map((workOrder) => {
                if (!workOrder) return null

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
                            {workOrder.beforeImages && workOrder.beforeImages.length > 0 && (
                              <span>• {workOrder.beforeImages.length} image(s)</span>
                            )}
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
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {workOrder.beforeImages && workOrder.beforeImages.length > 0 && (
                        <Button variant="outline" size="sm">
                          View Images ({workOrder.beforeImages.length})
                        </Button>
                      )}
                      {workOrder.workOrderStatus &&
                        !["COMPLETED", "CANCELLED"].includes(workOrder.workOrderStatus.toUpperCase()) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            Cancel Request
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
    </div>
  )
}
