// Base API Response
export interface ApiResponse<T> {
  data: T
  status: string
  message?: string
}

export interface PropertyInfo {
  propertyId: string
  propertyName: string
  location: string
  totalUnits: number
  parkingLots: number
  occupiedUnits: number
  filledParkingSlots: number
  managementFee: number
  numberOfLandlords: number
}

export interface PropertiesResponse {
  data: PropertyInfo[]
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

export interface TenantItem {
  tenantId: string
  firstName: string
  lastName: string
  flatNumber: string
  propertyName: string
  propertyId: string
  memberType: string
  flatId: string
  nationality: string
  emiratesIdNo: string
  emiratesIdExpiry: string
  primaryEmail: string
  primaryMobile: string
  profileImage?: string
  documentPath?: string // Emirates ID document path
  hasParking: boolean
  leaseStartDate: string
  leaseEndDate: string
  leaseStatus: string
  emiratesIdExpiryStatus: string
  emiratesIdDocument?: string // Legacy field, API now uses documentPath
  createdAt?: string
  updatedAt?: string
}

export interface ActiveLease {
  leaseId: string
  tenantId: string
  propertyId: string
  flatId: string
  flatNumber: string
  propertyName: string
  tenantName: string
  location: string
  leaseStartDate: string
  leaseEndDate: string
  leaseStatus: string
  numberOfOccupants: number
  rentAmount: number
  securityDeposit: number
  adminFee: number
  sharingType: string
  currency: string
}

export interface ParkingItem {
  parkingId: string
  tenantId: string
  leaseId: string
  ownerId: string
  model: string
  slotNumber: string
  includedInRent: boolean
  numberPlate: string
  parkingFee: number
  parkingStartDate: string
  parkingEndDate: string
  parkingStatus: string
  currency: string
}

export interface TenantDetailsResponse {
  tenantItem: TenantItem
  activeLease: ActiveLease
  parkingList: ParkingItem[]
  emergencyContact?: EmergencyContact[]
  houseHoldMembers?: HouseholdMember[]
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
export interface PaginatedLeasesResponse {
  leases: LeaseDetailsResponse[];
  currentPage: number;
  totalPages: number;
  totalLeases: number;
}

export interface PaginatedPaymentResponse {
  receipts: PaymentData[];
  currentPage: number;
  totalPages: number;
  totalLeases: number;
}

// Payment Response Types
export interface PaymentData {
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
  totalAmount: number
  baseAmount: number
  vatAmount: number
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
export interface RefundData {
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
export interface PaginatedRefundResponse {
  expenses: RefundData[];
  currentPage: number;
  totalPages: number;
  totalLeases: number;
}

// Work Order Response Types
export interface WorkOrderResponse {
  id: string
  workOrderNumber?: string
  title: string
  requestedByUserId: string
  requestUserName?: string
  requesterType: string
  propertyId: string
  unitId: string
  category: string
  subcategory: string
  description: string
  workOrderStatus: string
  priority: string
  assignedToUserId?: string
  requiresLandlordApproval: boolean
  landlordApprovalStatus: string
  approvedByLandlordId?: string
  landlordRemarks?: string
  beforeImages: string[]
  afterImages: string[]
  remarks?: string
  createdAt: string
  updatedAt?: string
  propertyName?: string
  flatNumber?: string
  assignedToName?: string
}

export interface WorkOrderStatusSummary {
  status: string
  total: number
}

export interface PaginatedWorkOrderResponse {
  workOrders: WorkOrderResponse[]
  workOrderStatus: WorkOrderStatusSummary[]
  pagination: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

// File Upload Response Types
export interface FileUploadResponse {
  status: string
  data: string // This is the reference ID for the uploaded image
}

export interface DocumentItem {
  id: string;
  documentName: string;
  documentOwnerName: string;
  documentOwnerId: string;
  entityId: string;
  purpose: string;
  documentUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
}