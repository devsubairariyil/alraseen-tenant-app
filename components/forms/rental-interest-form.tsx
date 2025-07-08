"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, Phone, Mail, Plus, Trash2, ArrowLeft, Building2, MapPin } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { PropertyInfo } from "@/lib/types/api-responses"
import Image from "next/image"
import Link from "next/link"
import RentalOtpVerification from "./rental-otp-verification"

interface ParkingInfo {
  model: string
  plate: string
}

interface HouseholdMember {
  name: string
  email: string
  phone: string
  relationship: string
}

interface RentalInterestFormData {
  firstName: string
  lastName: string
  primaryEmail: string
  primaryMobile: string
  nationality: string
  alternateEmail: string
  alternateMobile: string
  propertyId: string
  propertyName: string
  unitType: string
  bathrooms: string
  balcony: boolean
  expectedStartDate: string
  tenure: string
  minRentAmount: string
  maxRentAmount: string
  parking: ParkingInfo[]
  householdMembers: HouseholdMember[]
}

export default function RentalInterestForm() {
  const [formData, setFormData] = useState<RentalInterestFormData>({
    firstName: "",
    lastName: "",
    primaryEmail: "",
    primaryMobile: "",
    nationality: "",
    alternateEmail: "",
    alternateMobile: "",
    propertyId: "",
    propertyName: "",
    unitType: "",
    bathrooms: "",
    balcony: false,
    expectedStartDate: "",
    tenure: "",
    minRentAmount: "",
    maxRentAmount: "",
    parking: [],
    householdMembers: [],
  })

  const [properties, setProperties] = useState<PropertyInfo[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [error, setError] = useState("")
  const [otpError, setOtpError] = useState("")

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true)
        const response = await apiClient.getAvailableProperties()
        if (response.data) {
          setProperties(response.data)
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err)
        setError("Failed to load properties. Please refresh the page.")
      } finally {
        setLoadingProperties(false)
      }
    }

    fetchProperties()
  }, [])

  const handleInputChange = (
    field: keyof RentalInterestFormData,
    value: string | boolean | ParkingInfo[] | HouseholdMember[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePropertyChange = (propertyId: string) => {
    const selectedProperty = properties.find((p) => p.propertyId === propertyId)
    setFormData((prev) => ({
      ...prev,
      propertyId,
      propertyName: selectedProperty?.propertyName || "",
    }))
  }

  const addParkingSlot = () => {
    setFormData((prev) => ({
      ...prev,
      parking: [...prev.parking, { model: "", plate: "" }],
    }))
  }

  const removeParkingSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parking: prev.parking.filter((_, i) => i !== index),
    }))
  }

  const updateParkingSlot = (index: number, field: keyof ParkingInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      parking: prev.parking.map((parking, i) => (i === index ? { ...parking, [field]: value } : parking)),
    }))
  }

  const addHouseholdMember = () => {
    setFormData((prev) => ({
      ...prev,
      householdMembers: [...prev.householdMembers, { name: "", email: "", phone: "", relationship: "" }],
    }))
  }

  const removeHouseholdMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      householdMembers: prev.householdMembers.filter((_, i) => i !== index),
    }))
  }

  const updateHouseholdMember = (index: number, field: keyof HouseholdMember, value: string) => {
    setFormData((prev) => ({
      ...prev,
      householdMembers: prev.householdMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member,
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // First, request OTP for email verification
      await apiClient.requestOtp(formData.primaryEmail)
      setShowOtpVerification(true)
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async (otp: string) => {
    try {
      setIsLoading(true)
      // Verify OTP
      await apiClient.verifyOtp({ email: formData.primaryEmail, otp:otp, otpAction: 'EMAIL_VERIFICATION' })

      // If OTP is verified, submit the rental interest
      const cleanedData = {
        ...formData,
        parking: formData.parking.filter((p) => p.model.trim() && p.plate.trim()),
        householdMembers: formData.householdMembers.filter((m) => m.name.trim()),
      }

      const response = await apiClient.submitRentalInterest(cleanedData)

      if (response) {
        setIsSubmitted(true)
      } else {
        setOtpError( "Failed to submit rental interest. Please try again.")
      }
    } catch (err: any) {
      setOtpError(err.message || "Invalid verification code. Please try again.")
    }finally{
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await apiClient.requestOtp(formData.primaryEmail)
      setOtpError("")
    } catch (err: any) {
      setOtpError(err.message || "Failed to resend verification code.")
    }
  }

  const handleBackFromOtp = () => {
    setShowOtpVerification(false)
    setOtpError("")
  }

  if (showOtpVerification) {
    return (
      <RentalOtpVerification
        email={formData.primaryEmail}
        onVerify={handleOtpVerification}
        onBack={handleBackFromOtp}
        loading={isLoading}
        error={otpError}
        onResendOtp={handleResendOtp}
      />
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your rental interest has been submitted successfully. Our team will contact you within 24 hours.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>+971 4 123 4567</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>info@alraseen.ae</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Back to Home
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <Image
            src="/al-raseen-app-logo.png"
            alt="Al Raseen"
            width={200}
            height={60}
            className="h-16 w-auto mx-auto mb-4"
          />
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rental Interest Form
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Tell us about your property requirements and we'll help you find the perfect home
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">Primary Email *</Label>
                    <Input
                      id="primaryEmail"
                      type="email"
                      value={formData.primaryEmail}
                      onChange={(e) => handleInputChange("primaryEmail", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">We'll send a verification code to this email</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryMobile">Primary Mobile *</Label>
                    <Input
                      id="primaryMobile"
                      type="tel"
                      value={formData.primaryMobile}
                      onChange={(e) => handleInputChange("primaryMobile", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alternateEmail">Alternate Email</Label>
                    <Input
                      id="alternateEmail"
                      type="email"
                      value={formData.alternateEmail}
                      onChange={(e) => handleInputChange("alternateEmail", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternateMobile">Alternate Mobile</Label>
                    <Input
                      id="alternateMobile"
                      type="tel"
                      value={formData.alternateMobile}
                      onChange={(e) => handleInputChange("alternateMobile", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Property Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyId">Property *</Label>
                    {loadingProperties ? (
                      <div className="flex items-center justify-center h-10 border rounded-md">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading properties...</span>
                      </div>
                    ) : (
                      <Select value={formData.propertyId} onValueChange={handlePropertyChange} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.propertyId} value={property.propertyId}>
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <div>
                                  <div className="font-medium">{property.propertyName}</div>
                                  <div className="text-xs text-gray-500 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {property.location} • {property.totalUnits - property.occupiedUnits} units available
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitType">Unit Type *</Label>
                    <Select value={formData.unitType} onValueChange={(value) => handleInputChange("unitType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="1br">1 Bedroom</SelectItem>
                        <SelectItem value="2br">2 Bedroom</SelectItem>
                        <SelectItem value="3br">3 Bedroom</SelectItem>
                        <SelectItem value="4br">4 Bedroom</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="2">2 Bathrooms</SelectItem>
                        <SelectItem value="3">3 Bathrooms</SelectItem>
                        <SelectItem value="4">4 Bathrooms</SelectItem>
                        <SelectItem value="5+">5+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure *</Label>
                    <Select value={formData.tenure} onValueChange={(value) => handleInputChange("tenure", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="3years">3 Years</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="balcony"
                    checked={formData.balcony}
                    onCheckedChange={(checked) => handleInputChange("balcony", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="balcony">Balcony Required</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minRentAmount">Minimum Rent (AED/Year) *</Label>
                    <Input
                      id="minRentAmount"
                      type="number"
                      value={formData.minRentAmount}
                      onChange={(e) => handleInputChange("minRentAmount", e.target.value)}
                      placeholder="e.g., 50000"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRentAmount">Maximum Rent (AED/Year) *</Label>
                    <Input
                      id="maxRentAmount"
                      type="number"
                      value={formData.maxRentAmount}
                      onChange={(e) => handleInputChange("maxRentAmount", e.target.value)}
                      placeholder="e.g., 80000"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedStartDate">Expected Start Date *</Label>
                  <Input
                    id="expectedStartDate"
                    type="date"
                    value={formData.expectedStartDate}
                    onChange={(e) => handleInputChange("expectedStartDate", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Parking Information (Optional) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parking Information (Optional)</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addParkingSlot} disabled={isLoading}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Parking
                  </Button>
                </div>
                {formData.parking.map((parking, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`parking-model-${index}`}>Car Model</Label>
                      <Input
                        id={`parking-model-${index}`}
                        value={parking.model}
                        onChange={(e) => updateParkingSlot(index, "model", e.target.value)}
                        placeholder="e.g., Toyota Camry"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`parking-plate-${index}`}>Plate Number</Label>
                      <Input
                        id={`parking-plate-${index}`}
                        value={parking.plate}
                        onChange={(e) => updateParkingSlot(index, "plate", e.target.value)}
                        placeholder="e.g., ABC123"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeParkingSlot(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Household Members (Optional) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Household Members (Optional)</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addHouseholdMember} disabled={isLoading}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                {formData.householdMembers.map((member, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`member-name-${index}`}>Name</Label>
                      <Input
                        id={`member-name-${index}`}
                        value={member.name}
                        onChange={(e) => updateHouseholdMember(index, "name", e.target.value)}
                        placeholder="Full name"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`member-email-${index}`}>Email</Label>
                      <Input
                        id={`member-email-${index}`}
                        type="email"
                        value={member.email}
                        onChange={(e) => updateHouseholdMember(index, "email", e.target.value)}
                        placeholder="Email address"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`member-phone-${index}`}>Phone</Label>
                      <Input
                        id={`member-phone-${index}`}
                        type="tel"
                        value={member.phone}
                        onChange={(e) => updateHouseholdMember(index, "phone", e.target.value)}
                        placeholder="Phone number"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`member-relationship-${index}`}>Relationship</Label>
                      <Select
                        value={member.relationship}
                        onValueChange={(value) => updateHouseholdMember(index, "relationship", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeHouseholdMember(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3"
                disabled={isLoading || !formData.propertyId}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Verification Code...
                  </>
                ) : (
                  "Continue with Email Verification"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
