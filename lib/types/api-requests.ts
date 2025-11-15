// Auth Request Types
export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
  otpAction?: string
}

// Emergency Contact Request Types
export interface EmergencyContactRequest {
  name: string
  relationship: string
  mobile: string
  email: string
}


// Household Member Request Types
export interface CreateHouseholdMemberRequest {
  name: string
  email: string
  phone: string
  relationship: string
  emiratesIdNo: string
  emiratesIdExpiry: string
  nationality: string
  documentPath?: string
  joiningDate: string
}

export interface UpdateHouseholdMemberRequest {
  name?: string
  email?: string
  phone?: string
  relationship?: string
  emiratesIdNo?: string
  emiratesIdExpiry?: string
  nationality?: string
  documentPath?: string
  joiningDate?: string
  leavingDate?: string
  status?: "ACTIVE" | "LEFT"
}

// Work Order Request Types
export interface CreateWorkOrderRequest {
  title: string
  requestedByUserId: string
  requesterType: string
  propertyId: string
  unitId: string
  category: string
  subcategory: string
  description: string
  workOrderStatus: "PENDING"
  priority: string
  assignedToUserId?: string
  requiresLandlordApproval: boolean
  landlordApprovalStatus: "PENDING"
  approvedByLandlordId?: string
  landlordRemarks?: string
  beforeImages: string[]
  remarks?: string
}

// User Document Request Types
export interface UpdateUserDocumentRequest {
  type: string
  documentReference: string
}

// File Upload Request Types
export interface FileUploadRequest {
  file: File
  fileCategory: string
  imageOwner: string
}
// Profile Update Request Types
export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  primaryEmail?: string
  primaryMobile?: string
  emiratesIdNo?: string
  emiratesIdExpiry?: string
  nationality?: string
  documentPath ?: string
  profileImage ?: string
}