"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "./api"
import type { TenantDetailsResponse } from "./types/api-responses"

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
}

interface OnboardingContextType {
  steps: OnboardingStep[]
  currentStepIndex: number
  tenantData: TenantDetailsResponse | null
  loading: boolean
  isOnboardingComplete: boolean
  goToNextStep: () => void
  goToPreviousStep: () => void
  goToStep: (index: number) => void
  markStepComplete: (stepId: string) => void
  refreshTenantData: () => Promise<void>
  completeOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [tenantData, setTenantData] = useState<TenantDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [steps, setSteps] = useState<OnboardingStep[]>([])

  const refreshTenantData = async () => {
    try {
      const response = await apiClient.getTenantDetails()
      setTenantData(response.data)
    } catch (error) {
      console.error("Error fetching tenant data:", error)
      throw error
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await refreshTenantData()
      } catch (error) {
        console.error("Error initializing onboarding:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (tenantData) {
      const requiredSteps = determineRequiredSteps(tenantData)
      console.log("OnboardingContext - Required Steps:", requiredSteps)
      setSteps(requiredSteps)
    }
  }, [tenantData])

  const determineRequiredSteps = (data: TenantDetailsResponse): OnboardingStep[] => {
    const steps: OnboardingStep[] = []

    // Check Emirates ID
    const isEmiratesIdMissing = !data.tenantItem.emiratesIdNo || !data.tenantItem.emiratesIdExpiry
    const isEmiratesIdExpired = data.tenantItem.emiratesIdExpiryStatus === "EXPIRED"
    
    if (isEmiratesIdMissing || isEmiratesIdExpired) {
      steps.push({
        id: "emirates-id",
        title: "Emirates ID",
        description: isEmiratesIdExpired 
          ? "Your Emirates ID has expired. Please update it." 
          : "Please provide your Emirates ID details",
        completed: false,
        required: true,
      })
    }

    // Check Emergency Contacts
    const hasEmergencyContacts = data.emergencyContacts && data.emergencyContacts.length > 0
    if (!hasEmergencyContacts) {
      steps.push({
        id: "emergency-contacts",
        title: "Emergency Contacts",
        description: "Add at least one emergency contact",
        completed: false,
        required: true,
      })
    }

    // Check Household Members vs Lease Occupants
    const leaseOccupants = data.activeLease?.numberOfOccupants || 0
    const householdSize = (data.houseHoldMembers?.length || 0) + 1 // +1 for the tenant themselves
    
    if (leaseOccupants > 1 && householdSize < leaseOccupants) {
      steps.push({
        id: "household-members",
        title: "Household Members",
        description: `Your lease allows ${leaseOccupants} occupants. Please add the remaining ${leaseOccupants - householdSize} member(s)`,
        completed: false,
        required: true,
      })
    }

    console.log("Determined Required Steps:", steps)
    return steps
  }

  // Only consider onboarding complete if we've loaded data and there are either no steps or all steps are completed
  const isOnboardingComplete = !loading && tenantData !== null && (steps.length === 0 || steps.every(step => step.completed))

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index)
    }
  }

  const markStepComplete = (stepId: string) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    )
  }

  const completeOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingCompleted", "true")
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        steps,
        currentStepIndex,
        tenantData,
        loading,
        isOnboardingComplete,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        markStepComplete,
        refreshTenantData,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
