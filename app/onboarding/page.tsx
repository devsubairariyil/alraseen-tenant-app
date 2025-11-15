"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { OnboardingProvider, useOnboarding } from "@/lib/onboarding-context"
import { EmiratesIdStep } from "@/components/onboarding/emirates-id-step"
import { EmergencyContactsStep } from "@/components/onboarding/emergency-contacts-step"
import { HouseholdMembersStep } from "@/components/onboarding/household-members-step"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"

function OnboardingContent() {
  const router = useRouter()
  const { steps, currentStepIndex, isOnboardingComplete, completeOnboarding, loading } = useOnboarding()

  useEffect(() => {
    console.log("OnboardingContent - Steps:", steps)
    console.log("OnboardingContent - isOnboardingComplete:", isOnboardingComplete)
    console.log("OnboardingContent - loading:", loading)
    
    if (isOnboardingComplete && !loading) {
      completeOnboarding()
      router.push("/dashboard")
    }
  }, [isOnboardingComplete, loading, router, completeOnboarding, steps])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (steps.length === 0) {
    return null
  }

  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const renderStep = () => {
    switch (currentStep.id) {
      case "emirates-id":
        return <EmiratesIdStep />
      case "emergency-contacts":
        return <EmergencyContactsStep />
      case "household-members":
        return <HouseholdMembersStep />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Alraseen</h1>
              <p className="text-sm text-gray-600 mt-1">Let's complete your profile</p>
            </div>
            <div className="text-sm font-medium text-gray-600">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : index === currentStepIndex
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" fill={index === currentStepIndex ? "white" : "none"} />
                  )}
                </div>
                <p
                  className={`text-xs mt-2 text-center font-medium ${
                    step.completed || index === currentStepIndex ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    step.completed ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="pb-12">{renderStep()}</div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  )
}
