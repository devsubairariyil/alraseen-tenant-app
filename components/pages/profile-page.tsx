import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Smartphone, BadgeIcon as IdCard, Calendar, Car, CheckCircle, MoreHorizontal } from "lucide-react"

const userDetails = {
  name: "Ravishanker Lalchand",
  email: "ravispanish@gmail.com",
  mobile: "002 1090268",
  emiratesId: "78419800549202-4",
  idExpiry: "07/07/2026",
  parking: "Yes",
  emiratesIdStatus: "Valid",
  nationality: "Indian",
}

export default function ProfilePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Profile Hero Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-16 md:-translate-y-32 translate-x-16 md:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-white/5 rounded-full translate-y-12 md:translate-y-24 -translate-x-12 md:-translate-x-24"></div>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
            <div className="relative flex-shrink-0">
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/30 shadow-2xl">
                <AvatarFallback className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                  R
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{userDetails.name}</h1>
              <p className="text-blue-100 text-base md:text-lg mb-4">Verified Tenant</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 md:gap-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">Active Lease</Badge>
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                  {userDetails.emiratesIdStatus}
                </Badge>
              </div>
            </div>

            <Button
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Contact Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Contact Information</h3>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                  <p className="text-gray-900 font-semibold text-sm md:text-base truncate">{userDetails.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Mobile Number</p>
                  <p className="text-gray-900 font-semibold text-sm md:text-base">{userDetails.mobile}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Identity & Documents</h3>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <IdCard className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Emirates ID</p>
                  <p className="text-gray-900 font-semibold font-mono text-xs md:text-sm break-all">
                    {userDetails.emiratesId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">ID Expiry Date</p>
                  <p className="text-gray-900 font-semibold text-sm md:text-base">{userDetails.idExpiry}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Property Details</h3>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Parking Available</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-semibold text-sm md:text-base">{userDetails.parking}</p>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Included</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl overflow-hidden text-white">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Account Status</h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-green-100 text-sm md:text-base">Emirates ID Status</span>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">{userDetails.emiratesIdStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-100 text-sm md:text-base">Account Type</span>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">Premium Tenant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-100 text-sm md:text-base">Lease Status</span>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
