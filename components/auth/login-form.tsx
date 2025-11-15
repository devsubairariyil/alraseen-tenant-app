"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Phone,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  CheckCircle,
  Building2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import { checkOnboardingRequired } from "@/lib/check-onboarding"
import Image from "next/image"
import Link from "next/link"
import OtpVerification from "./otp-verification"
import ForgotPasswordModal from "./forgot-password-modal"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showOtp, setShowOtp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<{
    message: string
    email: string
    propertyName: string
  } | null>(null)

  const { login } = useAuth()
  const router = useRouter()

  // Check for rental interest success message on component mount
  useEffect(() => {
    const storedSuccess = sessionStorage.getItem("rentalInterestSuccess")
    if (storedSuccess) {
      try {
        const successData = JSON.parse(storedSuccess)
        setSuccessMessage(successData)
        // Clear the message from sessionStorage
        sessionStorage.removeItem("rentalInterestSuccess")

        // Auto-dismiss the success message after 10 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 10000)
      } catch (error) {
        console.error("Failed to parse success message:", error)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Clear onboarding completion flag on new login
      if (typeof window !== "undefined") {
        localStorage.removeItem("onboardingCompleted")
      }

      const response = await apiClient.login({ email, password })

      if (response.data.loginStatus === "OTP_PENDING") {
        setShowOtp(true)
      } else if (response.data.accessToken != undefined) {
        await login(email, password)
        
        // Check if onboarding is required
        try {
          const tenantData = await apiClient.getTenantDetails()
          console.log("Tenant Data Response:", tenantData.data)
          const needsOnboarding = checkOnboardingRequired(tenantData.data)
          console.log("Needs Onboarding:", needsOnboarding)
          
          if (needsOnboarding) {
            router.push("/onboarding")
          } else {
            router.push("/dashboard")
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error)
          // Fallback to dashboard if there's an error
          router.push("/dashboard")
        }
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerification = async (otp: string) => {
    setLoading(true)
    setError("")

    try {
      // Clear onboarding completion flag on new login via OTP
      if (typeof window !== "undefined") {
        localStorage.removeItem("onboardingCompleted")
      }

      const response = await apiClient.verifyOtp({ email, otp })
      if (response.data.accessToken) {
        // Store user data
        localStorage.setItem("userData", JSON.stringify(response.data))
        apiClient.setToken(response.data.accessToken)
        
        // Check if onboarding is required
        try {
          const tenantData = await apiClient.getTenantDetails()
          const needsOnboarding = checkOnboardingRequired(tenantData.data)
          
          if (needsOnboarding) {
            router.push("/onboarding")
          } else {
            router.push("/dashboard")
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error)
          // Fallback to dashboard if there's an error
          router.push("/dashboard")
        }
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowOtp(false)
    setError("")
  }

  if (showOtp) {
    return (
      <OtpVerification
        email={email}
        onVerify={handleOtpVerification}
        onBack={handleBackToLogin}
        loading={loading}
        error={error}
      />
    )
  }

  return (
    <>
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto">
                <Image
                  src="/al-raseen-app-logo.png"
                  alt="Alraseen Real Estate"
                  width={80}
                  height={80}
                  className="mx-auto rounded-2xl shadow-lg"
                />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">Sign in to your Alraseen tenant portal</CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {/* Success Message for Rental Interest Submission */}
              {successMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="space-y-2">
                      <p className="font-medium">{successMessage.message}</p>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3" />
                          <span>Email: {successMessage.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-3 h-3" />
                          <span>Property: {successMessage.propertyName}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSuccessMessage(null)}
                        className="text-green-700 hover:text-green-800 p-0 h-auto font-normal"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot your password?
                </button>
              </div>

              {/* New Tenant Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600 font-medium">New to Al Raseen?</p>
                  <Link href="/rental-interest">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium bg-transparent h-12"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Submit Rental Interest
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Company Information */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 items-center">
          <div className="max-w-lg mx-auto space-y-8">
            {/* Company Header */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                <Image src="/al-raseen-letter-logo.png" alt="Al Raseen" width={40} height={40} className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold">Al Raseen Properties</h2>
              <p className="text-blue-100 text-lg">Your Trusted Property Partner in Dubai</p>
            </div>

            {/* Contact Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>

              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Office Address</h4>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Office 1204, Business Bay Tower
                    <br />
                    Business Bay, Dubai
                    <br />
                    United Arab Emirates
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Phone Numbers</h4>
                  <p className="text-blue-100 text-sm">Office: +971 4 123 4567</p>
                  <p className="text-blue-100 text-sm">Mobile: +971 50 123 4567</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email Addresses</h4>
                  <p className="text-blue-100 text-sm">General: info@alraseen.ae</p>
                  <p className="text-blue-100 text-sm">Support: support@alraseen.ae</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Business Hours</h4>
                  <div className="text-blue-100 text-sm space-y-1">
                    <p>Sunday - Thursday: 9:00 AM - 6:00 PM</p>
                    <p>Friday - Saturday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <h4 className="font-semibold mb-2">Looking for a Property?</h4>
              <p className="text-blue-100 text-sm mb-4">
                Our experienced team is here to help you find your perfect home in Dubai.
              </p>
              <Link href="/rental-interest">
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 font-medium">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Submit Rental Interest
                </Button>
              </Link>
            </div>

            {/* Quick Contact */}
            <div className="text-center space-y-3">
              <p className="text-blue-100 text-sm">Need immediate assistance?</p>
              <div className="flex justify-center space-x-4">
                <a
                  href="tel:+971501234567"
                  className="flex items-center space-x-2 text-blue-200 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call Now</span>
                </a>
                <a
                  href="mailto:support@alraseen.ae"
                  className="flex items-center space-x-2 text-blue-200 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal open={showForgotPassword} onOpenChange={setShowForgotPassword} />
    </>
  )
}
