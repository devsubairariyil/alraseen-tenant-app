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
}

// Emergency Contact Request Types
export interface EmergencyContactRequest {
  name: string
  relationship: string
  mobile: string
  email: string
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
  documentType: string
  referenceId: string
}

// File Upload Request Types
export interface FileUploadRequest {
  file: File
  fileCategory: string
  imageOwner: string
}
