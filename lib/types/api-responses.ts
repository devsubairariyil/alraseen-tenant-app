// Base API Response
export interface ApiResponse<T> {
  data: T
  status: string
  message?: string
}

// Auth Response Types
export interface LoginResponse {
  accessToken: string
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
  loginStatus: "SUCCESS" | "OTP_PENDING"
}

// Tenant Response Types
export interface EmergencyContact {
  contactId: string
  name: string
  relationship: string
  mobile: string
  email: string
}

export interface HouseholdMember {
  memberId: string
  name: string
  relationship: string
  emiratesIdNo: string
  emiratesIdExpiry: string
  nationality: string
  joiningDate: string
  leavingDate: string
  email: string
  mobile: string
  documentPath: string
  status: string
}

export interface TenantDetailsResponse {
  tenantId: string
  firstName: string
  lastName: string
  primaryEmail: string
  primaryMobile: string
  emiratesIdNo: string
  emiratesIdExpiry: string
  nationality: string
  profileImage?: string
  emergencyContacts: EmergencyContact[]
  houseHoldMembers: HouseholdMember[]
}

// Lease Response Types
export interface ParkingDetails {
  parkingId: string
  slotNumber: string
  numberPlate: string
  model: string
  parkingFee: number
  includedInRent: boolean
}

export interface RentalAgreement {
  leaseId: string
  propertyName: string
  propertyId: string
  flatId: string
  flatNumber: string
  location: string
  rentAmount: number
  securityDeposit: number
  leaseStartDate: string
  leaseEndDate: string
  leaseStatus: string
  currency: string
  sharingType: string
  numberOfOccupants: number
}

export interface LeaseDetailsResponse {
  rentalAgreement: RentalAgreement
  parkingList: ParkingDetails[]
  houseHoldMembers: HouseholdMember[]
}

// Payment Response Types
export interface PaymentResponse {
  propertyId: string
  tenantId: string
  depositAccountId: string
  receiptId: string
  processedByUserId: string
  unitId: string
  propertyName: string
  flatNumber: string
  depositAccountName: string
  tenantName: string
  staffName: string
  receiptNumber: string
  date: string
  amount: number
  currency: string
  payerId: string
  payerName: string
  paymentReason: string
  referenceNumber: string
  method: "CASH" | "CHEQUE" | "BANK_TRANSFER" | "CARD" | "ONLINE"
  chequeNumber: string
  bankName: string
  chequeIssueDate: string
  chequeImageUrl: string
  receiptStatus: "PDC_DEPOSITED" | "CLEARED" | "BOUNCED" | "PENDING" | "CANCELLED"
  createdAt: string
  updatedAt: string
  remarks: string
}

// Refund Response Types
export interface RefundResponse {
  paymentId: string
  amount: number
  category: string
  subcategory: string
  description: string
  paymentStatus: string
  date: string
  currency: string
  receiptNumber?: string
  voucherNumber?: string
}

// Work Order Response Types
export interface WorkOrderResponse {
  id: string
  title: string
  requestedByUserId: string
  requesterType: string
  propertyId: string
  unitId: string
  category: string
  subcategory: string
  description: string
  workOrderStatus: string
  priority: string
  assignedToUserId: string
  requiresLandlordApproval: boolean
  landlordApprovalStatus: string
  approvedByLandlordId: string
  landlordRemarks: string
  beforeImages: string[]
  afterImages: string[]
  remarks: string
  createdAt: string
  updatedAt: string
  propertyName?: string
  flatNumber?: string
  assignedToName?: string
}

// File Upload Response Types
export interface FileUploadResponse {
  status: string
  data: string // This is the reference ID for the uploaded image
}
// Tenant Details Response Type
export interface TenantDetailsResponse {
  tenantId: string
  firstName: string
  lastName: string
  primaryEmail: string
  primaryMobile: string
  emiratesIdNo: string
  emiratesIdExpiry: string
  nationality: string
  profileImage?: string
  emiratesIdDocument?: string
  createdAt: string
  updatedAt: string
}
