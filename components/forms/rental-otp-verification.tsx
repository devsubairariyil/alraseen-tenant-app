"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Mail, Shield } from "lucide-react"
import Image from "next/image"

interface RentalOtpVerificationProps {
  email: string
  onVerify: (otp: string) => Promise<void>
  onBack: () => void
  loading: boolean
  error: string
  onResendOtp: () => Promise<void>
}

export default function RentalOtpVerification({
  email,
  onVerify,
  onBack,
  loading,
  error,
  onResendOtp,
}: RentalOtpVerificationProps) {
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      await onVerify(otp)
    }
  }

  const handleResend = async () => {
    setCanResend(false)
    setCountdown(60)
    await onResendOtp()
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <Image
              src="/al-raseen-app-logo.png"
              alt="Al Raseen"
              width={80}
              height={80}
              className="mx-auto rounded-2xl shadow-lg"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              We've sent a 6-digit code to your email address
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                Enter 6-digit code
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  className="pl-10 h-12 text-center text-lg font-mono tracking-widest border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">Didn't receive the code?</p>
            {canResend ? (
              <Button
                variant="link"
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-700 font-medium p-0"
                disabled={loading}
              >
                Resend Code
              </Button>
            ) : (
              <p className="text-sm text-gray-500">Resend code in {countdown} seconds</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
