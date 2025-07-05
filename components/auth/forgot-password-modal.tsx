"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await apiClient.forgotPassword({ email })
      setSuccess(true)
    } catch (err) {
      setError("Failed to send reset link. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setError("")
    setSuccess(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {success ? "Reset Link Sent" : "Forgot Password"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {success
              ? "We've sent a password reset link to your email address."
              : "Enter your email address and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <p className="text-center text-gray-600">
              Please check your email and follow the instructions to reset your password.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-transparent"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
