"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Loader2, Phone, CheckCircle2, ArrowRight } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useOnboarding } from "@/lib/onboarding-context"
import { toast } from "sonner"
import type { EmergencyContactRequest } from "@/lib/types/api-requests"

const relationships = [
  "Spouse",
  "Parent",
  "Sibling",
  "Child",
  "Friend",
  "Relative",
  "Colleague",
  "Other",
]

export function EmergencyContactsStep() {
  const { markStepComplete, goToNextStep, refreshTenantData, tenantData } = useOnboarding()
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<EmergencyContactRequest>({
    name: "",
    relationship: "",
    mobile: "",
    email: "",
  })

  const existingContacts = tenantData?.emergencyContact || []
  const hasContacts = existingContacts.length > 0

  const handleChange = (field: keyof EmergencyContactRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.relationship || !formData.mobile || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      await apiClient.addEmergencyContact(formData)
      toast.success("Emergency contact added successfully!")
      await refreshTenantData()
      setFormData({ name: "", relationship: "", mobile: "", email: "" })
      setShowForm(false)
    } catch (error) {
      console.error("Error adding emergency contact:", error)
      toast.error("Failed to add emergency contact. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    markStepComplete("emergency-contacts")
    goToNextStep()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Emergency Contact</h2>
        <p className="text-gray-600">
          {hasContacts 
            ? "You can add more emergency contacts or continue" 
            : "Add someone we can reach out to in case of an emergency"}
        </p>
      </div>

      {/* Existing Contacts */}
      {hasContacts && (
        <Card className="mb-6 border-0 shadow-xl bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Your Emergency Contacts ({existingContacts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {existingContacts.map((contact, index) => (
                <div key={contact.contactId || index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {contact.relationship}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{contact.mobile}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Contact Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-12"
              required
            />
          </div>

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
            <Label htmlFor="mobile" className="text-sm font-medium">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="+971 50 123 4567"
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 text-base font-semibold" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Contact
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 bg-white rounded-2xl shadow-xl p-8">
          {hasContacts ? (
            <>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="w-full h-12 text-base font-semibold"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Another Contact
              </Button>
              <Button
                onClick={handleSkip}
                className="w-full h-12 text-base font-semibold"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-12 text-base font-semibold"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Emergency Contact
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
