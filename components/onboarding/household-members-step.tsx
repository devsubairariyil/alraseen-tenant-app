"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Users, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { useOnboarding } from "@/lib/onboarding-context"
import { toast } from "sonner"
import type { CreateHouseholdMemberRequest } from "@/lib/types/api-requests"

const relationships = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Relative",
  "Friend",
  "Partner",
  "Other",
]

const nationalities = [
  "UAE",
  "Saudi Arabia",
  "India",
  "Pakistan",
  "Philippines",
  "Egypt",
  "Jordan",
  "Lebanon",
  "Syria",
  "Bangladesh",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Other",
]

export function HouseholdMembersStep() {
  const { tenantData, markStepComplete, goToNextStep, refreshTenantData } = useOnboarding()
  const [submitting, setSubmitting] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [emiratesIdExpiry, setEmiratesIdExpiry] = useState<Date | undefined>()
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState<Omit<CreateHouseholdMemberRequest, "emiratesIdExpiry" | "joiningDate">>({
    name: "",
    email: "",
    phone: "",
    relationship: "",
    emiratesIdNo: "",
    nationality: "",
  })

  const leaseOccupants = tenantData?.activeLease?.numberOfOccupants || 0
  const householdSize = (tenantData?.houseHoldMembers?.length || 0) + 1
  const remainingMembers = leaseOccupants - householdSize

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSkip = () => {
    setSkipping(true)
    markStepComplete("household-members")
    goToNextStep()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone || !formData.relationship || 
        !formData.emiratesIdNo || !emiratesIdExpiry || !formData.nationality || !joiningDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      
      const memberData: CreateHouseholdMemberRequest = {
        ...formData,
        emiratesIdExpiry: format(emiratesIdExpiry, "yyyy-MM-dd"),
        joiningDate: format(joiningDate, "yyyy-MM-dd"),
      }

      await apiClient.createHouseholdMember(memberData)
      
      // Refresh data to get updated household count
      await refreshTenantData()
      
      toast.success("Household member added successfully!")
      
      // The context will automatically recalculate if more members are needed
      // For now, we mark as complete and move forward
      markStepComplete("household-members")
      goToNextStep()
    } catch (error) {
      console.error("Error adding household member:", error)
      toast.error("Failed to add household member. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Household Members</h2>
        <p className="text-gray-600">
          Your lease allows {leaseOccupants} occupants. Please add the remaining {remainingMembers} member(s)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-8">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Full name as per Emirates ID"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="h-12"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+971 50 123 4567"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="h-12"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="relationship" className="text-sm font-medium">
              Relationship <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.relationship} onValueChange={(value) => handleChange("relationship", value)}>
              <SelectTrigger className="h-12">
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

          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-sm font-medium">
              Nationality <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.nationality} onValueChange={(value) => handleChange("nationality", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map((nat) => (
                  <SelectItem key={nat} value={nat}>
                    {nat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emiratesId" className="text-sm font-medium">
            Emirates ID Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="emiratesId"
            placeholder="784-XXXX-XXXXXXX-X"
            value={formData.emiratesIdNo}
            onChange={(e) => handleChange("emiratesIdNo", e.target.value)}
            className="h-12"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate" className="text-sm font-medium">
              Emirates ID Expiry <span className="text-red-500">*</span>
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
            <Label htmlFor="joiningDate" className="text-sm font-medium">
              Joining Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !joiningDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {joiningDate ? format(joiningDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={joiningDate} onSelect={setJoiningDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={submitting || skipping}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Member...
            </>
          ) : (
            "Add Household Member"
          )}
        </Button>

        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-12 text-base font-semibold" 
          onClick={handleSkip}
          disabled={submitting || skipping}
        >
          Skip for Now
        </Button>
      </form>
    </div>
  )
}
