"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Phone,
  Shield,
  Zap,
  Flame,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Building,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { apiClient } from "@/lib/api"

interface EmergencyContact {
  contactId?: string
  name: string
  relationship: string
  mobile: string
  email: string
}

const emergencyServices = {
  primary: [
    {
      id: "emergency-911",
      name: "Emergency Services",
      number: "999",
      description: "Police, Fire, Ambulance",
      icon: Shield,
      color: "from-red-500 to-red-600",
      available: "24/7",
    },
    {
      id: "property-emergency",
      name: "Property Emergency Hotline",
      number: "+971 4 123 4567",
      description: "Building emergencies, security issues",
      icon: Building,
      color: "from-blue-500 to-blue-600",
      available: "24/7",
    },
  ],
  utilities: [
    {
      id: "dewa-emergency",
      name: "DEWA Emergency",
      number: "+971 4 601 9999",
      description: "Electricity and water emergencies",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      available: "24/7",
    },
    {
      id: "gas-emergency",
      name: "Gas Emergency",
      number: "+971 4 316 5555",
      description: "Gas leaks and related emergencies",
      icon: Flame,
      color: "from-orange-500 to-red-500",
      available: "24/7",
    },
  ],
}

export default function EmergencyContactsPage() {
  const [personalContacts, setPersonalContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [formData, setFormData] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    mobile: "",
    email: "",
  })

  useEffect(() => {
    fetchEmergencyContacts()
  }, [])

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTenantDetails()
      setPersonalContacts(response.data.emergencyContact || [])
    } catch (err) {
      setError("Failed to load emergency contacts")
      console.error("Error fetching emergency contacts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, "_self")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingContact?.contactId) {
        await apiClient.updateEmergencyContact(editingContact.contactId, formData)
      } else {
        await apiClient.addEmergencyContact(formData)
      }

      setFormData({ name: "", relationship: "", mobile: "", email: "" })
      setEditingContact(null)
      setIsDialogOpen(false)
      await fetchEmergencyContacts()
    } catch (err) {
      console.error("Error saving emergency contact:", err)
    }
  }

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact)
    setFormData(contact)
    setIsDialogOpen(true)
  }

  const handleDelete = async (contactId: string) => {
    try {
      await apiClient.deleteEmergencyContact(contactId)
      await fetchEmergencyContacts()
    } catch (err) {
      console.error("Error deleting emergency contact:", err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Emergency Contacts</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Important numbers and emergency procedures for your safety
          </p>
        </div>
        <Button onClick={fetchEmergencyContacts} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Emergency Alert */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">In Case of Emergency</h2>
          <p className="text-red-100 mb-6">For immediate life-threatening emergencies, always call 999 first</p>
          <Button
            size="lg"
            className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-8"
            onClick={() => handleCall("999")}
          >
            <Phone className="w-5 h-5 mr-2" />
            Call 999 Now
          </Button>
        </CardContent>
      </Card>

      {/* Personal Emergency Contacts */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Personal Emergency Contacts
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingContact(null)
                    setFormData({ name: "", relationship: "", mobile: "", email: "" })
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={formData.relationship}
                      onChange={(e) => setFormData((prev) => ({ ...prev, relationship: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingContact ? "Update" : "Add"} Contact</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {personalContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalContacts.map((contact) => (
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
                      <Button size="sm" variant="outline" onClick={() => handleCall(contact.mobile)}>
                        <Phone className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(contact)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => contact.contactId && handleDelete(contact.contactId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Personal Contacts</h3>
              <p className="text-gray-600 mb-4">
                Add your personal emergency contacts for quick access during emergencies.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Official Emergency Services */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Official Emergency Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emergencyServices.primary.map((contact) => {
            const Icon = contact.icon
            return (
              <Card
                key={contact.id}
                className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${contact.color} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {contact.available}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">{contact.number}</p>
                    <Button
                      className={`bg-gradient-to-r ${contact.color} hover:opacity-90`}
                      onClick={() => handleCall(contact.number)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Utility Emergency Services */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Utility Emergency Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emergencyServices.utilities.map((contact) => {
            const Icon = contact.icon
            return (
              <Card
                key={contact.id}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${contact.color} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">{contact.number}</p>
                    <Button variant="outline" onClick={() => handleCall(contact.number)}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Important Information */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold mb-4">Important Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Building Address
              </h4>
              <p className="text-blue-100">
                Marina Heights, Tower A<br />
                Dubai Marina, Dubai, UAE
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Your Unit
              </h4>
              <p className="text-blue-100">
                Floor 15, Unit 1502
                <br />
                Building A
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white/20 rounded-xl">
            <p className="text-sm text-blue-100">
              <strong>Remember:</strong> In any emergency, your safety is the top priority. When in doubt, evacuate
              first and call for help. Keep this information easily accessible and share it with family members and
              guests.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
