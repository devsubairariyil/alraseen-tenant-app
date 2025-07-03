import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Wrench,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  MessageSquare,
  Camera,
  Zap,
  Droplets,
  Thermometer,
  Wifi,
} from "lucide-react"

const maintenanceData = {
  summary: {
    totalRequests: 12,
    openRequests: 2,
    completedRequests: 9,
    averageResponseTime: "24 hours",
  },
  requests: [
    {
      id: "MNT-001",
      title: "Air Conditioning Not Working",
      description: "The AC unit in the living room is not cooling properly. It's making strange noises.",
      category: "HVAC",
      priority: "High",
      status: "In Progress",
      dateSubmitted: "20/07/2024",
      lastUpdate: "22/07/2024",
      assignedTo: "Ahmed Hassan",
      contactNumber: "+971 50 123 4567",
      estimatedCompletion: "25/07/2024",
      images: 2,
    },
    {
      id: "MNT-002",
      title: "Kitchen Sink Leaking",
      description: "Water is dripping from under the kitchen sink. The leak seems to be getting worse.",
      category: "Plumbing",
      priority: "Medium",
      status: "Scheduled",
      dateSubmitted: "18/07/2024",
      lastUpdate: "19/07/2024",
      assignedTo: "Mohammed Ali",
      contactNumber: "+971 50 987 6543",
      estimatedCompletion: "24/07/2024",
      images: 1,
    },
    {
      id: "MNT-003",
      title: "Bathroom Light Fixture",
      description: "The light fixture in the master bathroom is flickering and needs replacement.",
      category: "Electrical",
      priority: "Low",
      status: "Completed",
      dateSubmitted: "15/07/2024",
      lastUpdate: "17/07/2024",
      assignedTo: "Omar Khalil",
      contactNumber: "+971 50 555 7890",
      estimatedCompletion: "17/07/2024",
      completedDate: "17/07/2024",
      images: 0,
    },
    {
      id: "MNT-004",
      title: "Internet Connection Issues",
      description: "WiFi connection is very slow and keeps disconnecting in the bedroom area.",
      category: "Technology",
      priority: "Medium",
      status: "Completed",
      dateSubmitted: "10/07/2024",
      lastUpdate: "12/07/2024",
      assignedTo: "Tech Support Team",
      contactNumber: "+971 4 123 4567",
      estimatedCompletion: "12/07/2024",
      completedDate: "12/07/2024",
      images: 0,
    },
  ],
}

export default function MaintenancePage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "Scheduled":
        return <Calendar className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "HVAC":
        return <Thermometer className="w-5 h-5" />
      case "Plumbing":
        return <Droplets className="w-5 h-5" />
      case "Electrical":
        return <Zap className="w-5 h-5" />
      case "Technology":
        return <Wifi className="w-5 h-5" />
      default:
        return <Wrench className="w-5 h-5" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Requests</h1>
          <p className="text-gray-600">Submit and track your property maintenance requests</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="w-6 h-6" />
              <h3 className="font-semibold">Total Requests</h3>
            </div>
            <p className="text-2xl font-bold">{maintenanceData.summary.totalRequests}</p>
            <p className="text-blue-100 text-sm">All time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6" />
              <h3 className="font-semibold">Open Requests</h3>
            </div>
            <p className="text-2xl font-bold">{maintenanceData.summary.openRequests}</p>
            <p className="text-yellow-100 text-sm">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6" />
              <h3 className="font-semibold">Completed</h3>
            </div>
            <p className="text-2xl font-bold">{maintenanceData.summary.completedRequests}</p>
            <p className="text-green-100 text-sm">Resolved</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-semibold">Response Time</h3>
            </div>
            <p className="text-2xl font-bold">{maintenanceData.summary.averageResponseTime}</p>
            <p className="text-purple-100 text-sm">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold mb-4">Common Maintenance Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 h-16 flex-col gap-2"
            >
              <Thermometer className="w-6 h-6" />
              <span className="text-sm">HVAC</span>
            </Button>
            <Button
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 h-16 flex-col gap-2"
            >
              <Droplets className="w-6 h-6" />
              <span className="text-sm">Plumbing</span>
            </Button>
            <Button
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 h-16 flex-col gap-2"
            >
              <Zap className="w-6 h-6" />
              <span className="text-sm">Electrical</span>
            </Button>
            <Button
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 h-16 flex-col gap-2"
            >
              <Wrench className="w-6 h-6" />
              <span className="text-sm">General</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Requests */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Recent Requests</CardTitle>
          <p className="text-gray-600">Track the status of your maintenance requests</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {maintenanceData.requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                      {getCategoryIcon(request.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900">{request.title}</h4>
                        <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>#{request.id}</span>
                        <span>•</span>
                        <span>{request.category}</span>
                        {request.images > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Camera className="w-4 h-4" />
                              {request.images} image{request.images > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      {getStatusIcon(request.status)}
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Updated {request.lastUpdate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-gray-500">Submitted</p>
                      <p className="font-semibold">{request.dateSubmitted}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-gray-500">Assigned to</p>
                      <p className="font-semibold">{request.assignedTo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-gray-500">Contact</p>
                      <p className="font-semibold">{request.contactNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-gray-500">{request.status === "Completed" ? "Completed" : "Expected"}</p>
                      <p className="font-semibold">
                        {request.status === "Completed" ? request.completedDate : request.estimatedCompletion}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                  {request.status !== "Completed" && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
