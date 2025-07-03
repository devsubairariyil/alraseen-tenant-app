"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Home, MapPin, Calendar, DollarSign, Users, Car, Download, Eye, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"

interface LeaseData {
  rentalAgreement: {
    leaseId: string
    propertyName: string
    flatNumber: string
    location: string
    rentAmount: number
    securityDeposit: number
    leaseStartDate: string
    leaseEndDate: string
    leaseStatus: string
    currency: string
    sharingType: string
    numberOfOccupants: number
  }
  parkingList: Array<{
    parkingId: string
    slotNumber: string
    numberPlate: string
    model: string
    parkingFee: number
    includedInRent: boolean
  }>
  houseHoldMembers: Array<{
    memberId: string
    name: string
    relationship: string
    emiratesIdNo: string
    nationality: string
  }>
}

export default function LeaseDetails() {
  const [leaseData, setLeaseData] = useState<LeaseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchLeaseData()
  }, [])

  const fetchLeaseData = async () => {
    try {
      const response = await apiClient.getMyLeases()
      setLeaseData(response.data)
    } catch (err) {
      setError("Failed to load lease details")
      console.error("Error fetching lease data:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "EXPIRED":
        return "bg-red-100 text-red-800"
      case "TERMINATION_INITIATED":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isLeaseExpiringSoon = (endDate: string) => {
    const expiry = new Date(endDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 60 && diffDays > 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || leaseData.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lease Information</h3>
          <p className="text-gray-600 mb-4">{error || "No active lease agreements found."}</p>
          <Button onClick={fetchLeaseData} variant="outline">
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Properties</h2>
          <p className="text-gray-600 text-sm md:text-base">Your current rental agreements and property details</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Download Agreement
        </Button>
      </div>

      {leaseData.map((lease, index) => (
        <Card
          key={lease.rentalAgreement.leaseId}
          className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden"
        >
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold">{lease.rentalAgreement.propertyName}</CardTitle>
                <p className="text-blue-100 mt-1 text-sm md:text-base">Unit {lease.rentalAgreement.flatNumber}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Badge className={`${getStatusColor(lease.rentalAgreement.leaseStatus)} w-fit`}>
                  {lease.rentalAgreement.leaseStatus.replace("_", " ")}
                </Badge>
                {isLeaseExpiringSoon(lease.rentalAgreement.leaseEndDate) && (
                  <Badge className="bg-yellow-100 text-yellow-800 w-fit">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Expiring Soon
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Property Details */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Property Information</h3>
                  <div className="flex items-start gap-3 text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                    <p className="text-sm md:text-base">{lease.rentalAgreement.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Sharing Type</p>
                      <p className="font-semibold text-sm md:text-base">{lease.rentalAgreement.sharingType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Occupants</p>
                      <p className="font-semibold text-sm md:text-base">{lease.rentalAgreement.numberOfOccupants}</p>
                    </div>
                  </div>
                </div>

                {/* Parking Information */}
                {lease.parkingList && lease.parkingList.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-sm md:text-base">Parking Details</h4>
                    <div className="space-y-2">
                      {lease.parkingList.map((parking) => (
                        <div key={parking.parkingId} className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Car className="w-4 h-4 text-purple-500" />
                            <span className="font-semibold text-sm">Slot {parking.slotNumber}</span>
                            {parking.includedInRent && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Included</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {parking.model} - {parking.numberPlate}
                          </p>
                          {!parking.includedInRent && (
                            <p className="text-xs text-gray-600">
                              Fee: {lease.rentalAgreement.currency} {parking.parkingFee}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial & Lease Info */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 md:p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                    <h4 className="text-base md:text-lg font-bold">Financial Details</h4>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-100 text-sm md:text-base">Annual Rent</span>
                      <span className="font-bold text-sm md:text-base">
                        {lease.rentalAgreement.currency} {lease.rentalAgreement.rentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-100 text-sm md:text-base">Security Deposit</span>
                      <span className="font-bold text-sm md:text-base">
                        {lease.rentalAgreement.currency} {lease.rentalAgreement.securityDeposit.toLocaleString()}
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
                        {new Date(lease.rentalAgreement.leaseStartDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Lease End</p>
                      <p className="font-semibold text-sm md:text-base">
                        {new Date(lease.rentalAgreement.leaseEndDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Household Members */}
                {lease.houseHoldMembers && lease.houseHoldMembers.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-sm md:text-base">Household Members</h4>
                    <div className="space-y-2">
                      {lease.houseHoldMembers.slice(0, 2).map((member) => (
                        <div key={member.memberId} className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm">{member.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {member.relationship}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{member.nationality}</p>
                        </div>
                      ))}
                      {lease.houseHoldMembers.length > 2 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{lease.houseHoldMembers.length - 2} more members
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full sm:w-auto">
                <Eye className="w-4 h-4 mr-2" />
                View Agreement
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
  )
}
