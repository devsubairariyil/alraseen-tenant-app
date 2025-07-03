import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, MapPin, Calendar, DollarSign, Bed, Bath, Square, Car, Eye, Download } from "lucide-react"

const propertyData = {
  current: {
    id: "PROP-001",
    name: "Marina Heights Apartment",
    address: "Dubai Marina, Tower A, Floor 15, Unit 1502",
    type: "2 Bedroom Apartment",
    rent: "AED 85,000",
    period: "Annual",
    leaseStart: "01/01/2024",
    leaseEnd: "31/12/2024",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sq ft",
    parking: "1 Space",
    amenities: ["WiFi", "Electricity", "Water", "Gym", "Pool", "Security"],
    status: "Active",
  },
  previous: [
    {
      id: "PROP-002",
      name: "Downtown Residence",
      address: "Downtown Dubai, Building B, Unit 801",
      period: "2022-2023",
      rent: "AED 75,000",
      status: "Completed",
    },
    {
      id: "PROP-003",
      name: "JBR Beach Apartment",
      address: "Jumeirah Beach Residence, Block C",
      period: "2021-2022",
      rent: "AED 90,000",
      status: "Completed",
    },
  ],
}

export default function PropertiesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage your current and previous rental properties</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Download Lease
        </Button>
      </div>

      {/* Current Property */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold">Current Property</CardTitle>
              <p className="text-blue-100 mt-1 text-sm md:text-base">Active Lease Agreement</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 w-fit">{propertyData.current.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Property Details */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{propertyData.current.name}</h3>
                <div className="flex items-start gap-3 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm md:text-base">{propertyData.current.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bed className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Bedrooms</p>
                    <p className="font-semibold text-sm md:text-base">{propertyData.current.bedrooms}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bath className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Bathrooms</p>
                    <p className="font-semibold text-sm md:text-base">{propertyData.current.bathrooms}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Square className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Area</p>
                    <p className="font-semibold text-sm md:text-base">{propertyData.current.area}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Parking</p>
                    <p className="font-semibold text-sm md:text-base">{propertyData.current.parking}</p>
                  </div>
                </div>
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
                    <span className="font-bold text-sm md:text-base">{propertyData.current.rent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-100 text-sm md:text-base">Payment Period</span>
                    <span className="font-bold text-sm md:text-base">{propertyData.current.period}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Lease Start</p>
                    <p className="font-semibold text-sm md:text-base">{propertyData.current.leaseStart}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Lease End</p>
                    <p className="font-semibold text-sm md:text-base">{propertyData.current.leaseEnd}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm md:text-base">Included Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {propertyData.current.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
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

      {/* Previous Properties */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Previous Properties</CardTitle>
          <p className="text-gray-600 text-sm md:text-base">Your rental history</p>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {propertyData.previous.map((property) => (
              <div
                key={property.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">{property.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{property.address}</p>
                    <p className="text-xs md:text-sm text-gray-500">{property.period}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:text-right gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{property.rent}</p>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs">
                      {property.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
