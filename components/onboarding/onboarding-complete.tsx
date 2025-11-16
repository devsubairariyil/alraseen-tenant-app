"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function OnboardingComplete() {
  const router = useRouter()

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingCompleted", "true")
    }
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6 animate-bounce">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-3">All Set!</h2>
        <p className="text-xl text-gray-600">
          Your profile is now complete. Welcome to Alraseen!
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <p className="text-gray-700 mb-6">
          You can now access all features of the tenant portal, including:
        </p>
        <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">View and manage your properties</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Track payments and refunds</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Submit maintenance requests</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Access important documents</span>
          </li>
        </ul>
        <Button onClick={handleContinue} className="w-full h-12 text-base font-semibold">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
