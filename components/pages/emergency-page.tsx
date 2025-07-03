"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Shield, Zap, Flame, AlertTriangle, MapPin, Clock, Users, Building } from "lucide-react"

const emergencyContacts = {
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
  building: [
    {
      id: "security",
      name: "Building Security",
      number: "+971 50 123 4567",
      description: "24/7 security desk",
      icon: Shield,
      color: "from-gray-500 to-gray-600",
      available: "24/7",
    },
    {
      id: "maintenance-emergency",
      name: "Emergency Maintenance",
      number: "+971 50 987 6543",
      description: "Urgent repairs and maintenance",
      icon: AlertTriangle,
      color: "from-purple-500 to-purple-600",
      available: "24/7",
    },
    {
      id: "concierge",
      name: "Concierge Service",
      number: "+971 4 555 7890",
      description: "General assistance and information",
      icon: Users,
      color: "from-green-500 to-green-600",
      available: "6 AM - 10 PM",
    },
  ],
}

const emergencyProcedures = [
  {
    title: "Fire Emergency",
    icon: Flame,
    color: "from-red-500 to-orange-500",
    steps: [
      "Immediately evacuate the building",
      "Use stairs, never elevators",
      "Call 999 once you're safe",
      "Meet at the designated assembly point",
      "Contact building management",
    ],
  },
  {
    title: "Medical Emergency",
    icon: Shield,
    color: "from-blue-500 to-cyan-500",
    steps: [
      "Call 999 for ambulance",
      "Provide first aid if trained",
      "Stay with the person until help arrives",
      "Contact building security",
      "Notify family/emergency contacts",
    ],
  },
  {
    title: "Utility Emergency",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    steps: [
      "Turn off main switches if safe",
      "Evacuate if gas leak suspected",
      "Call DEWA emergency hotline",
      "Contact building management",
      "Document the issue with photos",
    ],
  },
  {
    title: "Security Issue",
    icon: AlertTriangle,
    color: "from-purple-500 to-pink-500",
    steps: [
      "Ensure your immediate safety",
      "Call 999 if serious threat",
      "Contact building security",
      "Document the incident",
      "Report to property management",
    ],
  },
]

export default function EmergencyPage() {
  const handleCall = (number: string) => {
    window.open(`tel:${number}`, "_self")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Contacts</h1>
        <p className="text-gray-600">Important numbers and emergency procedures for your safety</p>
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

      {/* Primary Emergency Contacts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Primary Emergency Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emergencyContacts.primary.map((contact) => {
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

      {/* Utility Emergency Contacts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Utility Emergency Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emergencyContacts.utilities.map((contact) => {
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

      {/* Building Contacts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Building Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {emergencyContacts.building.map((contact) => {
            const Icon = contact.icon
            return (
              <Card
                key={contact.id}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${contact.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{contact.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{contact.description}</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {contact.available}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 mb-3">{contact.number}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => handleCall(contact.number)}
                    >
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

      {/* Emergency Procedures */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Procedures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emergencyProcedures.map((procedure, index) => {
            const Icon = procedure.icon
            return (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${procedure.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6" />
                    <CardTitle className="text-lg">{procedure.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ol className="space-y-3">
                    {procedure.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0 mt-0.5">
                          {stepIndex + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </li>
                    ))}
                  </ol>
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
