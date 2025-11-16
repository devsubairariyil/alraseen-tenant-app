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

  // Check Emirates ID
  const isEmiratesIdMissing = !tenantData.tenantItem.emiratesIdNo || !tenantData.tenantItem.emiratesIdExpiry
  const isEmiratesIdExpired = tenantData.tenantItem.emiratesIdExpiryStatus === "EXPIRED"
  // API returns documentPath, not emiratesIdDocument
  const isEmiratesIdDocumentMissing = !tenantData.tenantItem.documentPath || tenantData.tenantItem.documentPath.trim() === ""

  // Check Emergency Contacts - field might be undefined or empty array
  const hasEmergencyContacts = 
    tenantData.emergencyContact !== undefined && 
    tenantData.emergencyContact.length > 0

  // Check Household Members vs Lease Occupants
  const leaseOccupants = tenantData.activeLease?.numberOfOccupants || 0
  const householdSize = (tenantData.houseHoldMembers?.length || 0) + 1 // +1 for the tenant themselves

  const needsOnboarding =
    (isEmiratesIdMissing || isEmiratesIdExpired || isEmiratesIdDocumentMissing) ||
    !hasEmergencyContacts ||
    (leaseOccupants > 1 && householdSize < leaseOccupants)

  console.log("Onboarding Check Details:", {
    emiratesIdNo: tenantData.tenantItem.emiratesIdNo,
    emiratesIdExpiry: tenantData.tenantItem.emiratesIdExpiry,
    documentPath: tenantData.tenantItem.documentPath,
    emiratesIdStatus: tenantData.tenantItem.emiratesIdExpiryStatus,
    emergencyContact: tenantData.emergencyContact,
    houseHoldMembers: tenantData.houseHoldMembers,
    isEmiratesIdMissing,
    isEmiratesIdExpired,
    isEmiratesIdDocumentMissing,
    hasEmergencyContacts,
    leaseOccupants,
    householdSize,
    needsOnboarding,
  })

  return needsOnboarding
}
