import type { TenantDetailsResponse } from "./types/api-responses"

/**
 * Checks if the tenant needs to complete onboarding steps
 * Returns true if onboarding is required, false otherwise
 */
export function checkOnboardingRequired(tenantData: TenantDetailsResponse | null): boolean {
  if (!tenantData) {
    console.log("Onboarding Check: No tenant data")
    return false
  }

  // Check if onboarding was already completed
  let onboardingCompleted = false
  if (typeof window !== "undefined") {
    const completed = localStorage.getItem("onboardingCompleted")
    onboardingCompleted = completed === "true"
    console.log("Onboarding Check: localStorage onboardingCompleted =", completed)
  }

  // Check Emirates ID
  const isEmiratesIdMissing = !tenantData.tenantItem.emiratesIdNo || !tenantData.tenantItem.emiratesIdExpiry
  const isEmiratesIdExpired = tenantData.tenantItem.emiratesIdExpiryStatus === "EXPIRED"

  // Check Emergency Contacts - field might be undefined or empty array
  const hasEmergencyContacts = 
    tenantData.emergencyContacts !== undefined && 
    tenantData.emergencyContacts.length > 0

  // Check Household Members vs Lease Occupants
  const leaseOccupants = tenantData.activeLease?.numberOfOccupants || 0
  const householdSize = (tenantData.houseHoldMembers?.length || 0) + 1 // +1 for the tenant themselves

  const needsOnboarding =
    (isEmiratesIdMissing || isEmiratesIdExpired) ||
    !hasEmergencyContacts ||
    (leaseOccupants > 1 && householdSize < leaseOccupants)

  console.log("Onboarding Check Details:", {
    emiratesIdNo: tenantData.tenantItem.emiratesIdNo,
    emiratesIdExpiry: tenantData.tenantItem.emiratesIdExpiry,
    emiratesIdStatus: tenantData.tenantItem.emiratesIdExpiryStatus,
    emergencyContacts: tenantData.emergencyContacts,
    houseHoldMembers: tenantData.houseHoldMembers,
    isEmiratesIdMissing,
    isEmiratesIdExpired,
    hasEmergencyContacts,
    leaseOccupants,
    householdSize,
    needsOnboarding,
    onboardingCompleted,
    finalResult: needsOnboarding && !onboardingCompleted
  })

  // Only skip onboarding if it was explicitly completed
  return needsOnboarding && !onboardingCompleted
}
