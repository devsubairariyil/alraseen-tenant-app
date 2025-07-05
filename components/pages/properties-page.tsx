"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Home, MapPin, Calendar, DollarSign, Bed, Car, Eye, Download, Loader2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { LeaseDetailsResponse } from "@/lib/types/api-responses"

export default function PropertiesPage() {
  const [properties, setProperties] = useState<LeaseDetailsResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await apiClient.getMyLeases()
      setProperties(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "expired":
      case "terminated":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={fetchProperties}>
              <Loader2 className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any rental properties associated with your account.
          </p>
        </div>
      </div>
    )
  }

  // Separate active and inactive properties
  const activeProperties = properties.filter((p) => p.rentalAgreement.leaseStatus.toLowerCase() === "active")
  const inactiveProperties = properties.filter((p) => p.rentalAgreement.leaseStatus.toLowerCase() !== "active")

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage your current and previous rental properties ({properties.length} total)
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Download All Leases
        </Button>
      </div>

      {/* Active Properties */}
      {activeProperties.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Current Properties</h2>
          {activeProperties.map((property) => (
            <Card
              key={property.rentalAgreement.leaseId}
              className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden"
            >
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold">
                      {property.rentalAgreement.propertyName}
                    </CardTitle>
                    <p className="text-blue-100 mt-1 text-sm md:text-base">Active Lease Agreement</p>
                  </div>
                  <Badge
                    className={`bg-white/20 text-white border-white/30 w-fit ${getStatusColor(property.rentalAgreement.leaseStatus)}`}
                  >
                    {property.rentalAgreement.leaseStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  {/* Property Details */}
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                        {property.rentalAgreement.propertyName}
                      </h3>
                      <div className="flex items-start gap-3 text-gray-600 mb-4">
                        <MapPin className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="text-sm md:text-base">
                          {property.rentalAgreement.location}, Unit {property.rentalAgreement.flatNumber}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Home className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-500">Sharing Type</p>
                          <p className="font-semibold text-sm md:text-base">{property.rentalAgreement.sharingType}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Bed className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-500">Occupants</p>
                          <p className="font-semibold text-sm md:text-base">
                            {property.rentalAgreement.numberOfOccupants}
                          </p>
                        </div>
                      </div>

                      {property.parkingList.length > 0 && (
                        <div className="flex items-center gap-2 md:gap-3 col-span-2">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Car className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Parking</p>
                            <p className="font-semibold text-sm md:text-base">
                              {property.parkingList.length} Space{property.parkingList.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lease & Financial Info */}
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 md:p-6 text-white">
                      <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                        <h4 className="text-base md:text-lg font-bold">Rental Information</h4>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between">
                          <span className="text-green-100 text-sm md:text-base">Annual Rent</span>
                          <span className="font-bold text-sm md:text-base">
                            {formatCurrency(property.rentalAgreement.rentAmount, property.rentalAgreement.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-100 text-sm md:text-base">Security Deposit</span>
                          <span className="font-bold text-sm md:text-base">
                            {formatCurrency(
                              property.rentalAgreement.securityDeposit,
                              property.rentalAgreement.currency,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs md:text-sm text-gray-500">Lease Start</p>
                          <p className="font-semibold text-sm md:text-base">
                            {formatDate(property.rentalAgreement.leaseStartDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs md:text-sm text-gray-500">Lease End</p>
                          <p className="font-semibold text-sm md:text-base">
                            {formatDate(property.rentalAgreement.leaseEndDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {property.houseHoldMembers.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 text-sm md:text-base">Household Members</h4>
                        <div className="space-y-2">
                          {property.houseHoldMembers.map((member) => (
                            <div
                              key={member.memberId}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm font-medium">{member.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {member.relationship}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full sm:w-auto">
                    <Eye className="w-4 h-4 mr-2" />
                    View Lease Agreement
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rental History */}
      {inactiveProperties.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Rental History</CardTitle>
            <p className="text-gray-600 text-sm md:text-base">Your previous rental properties</p>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              {inactiveProperties.map((property) => (
                <div
                  key={property.rentalAgreement.leaseId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        {property.rentalAgreement.propertyName}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 truncate">
                        {property.rentalAgreement.location}, Unit {property.rentalAgreement.flatNumber}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {formatDate(property.rentalAgreement.leaseStartDate)} -{" "}
                        {formatDate(property.rentalAgreement.leaseEndDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:text-right gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">
                        {formatCurrency(property.rentalAgreement.rentAmount, property.rentalAgreement.currency)}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(property.rentalAgreement.leaseStatus)}`}
                      >
                        {property.rentalAgreement.leaseStatus}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
