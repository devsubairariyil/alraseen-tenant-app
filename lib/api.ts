const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

interface ApiResponse<T> {
  data: T
  status: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{
      accessToken: string
      userId: string
      email: string
      firstName: string
      lastName: string
      role: string
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.data.accessToken) {
      this.setToken(response.data.accessToken)
    }

    return response
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" })
    this.clearToken()
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    })
  }

  // Tenant endpoints
  async getTenantDetails() {
    return this.request<{
      tenantId: string
      firstName: string
      lastName: string
      primaryEmail: string
      primaryMobile: string
      emiratesIdNo: string
      emiratesIdExpiry: string
      nationality: string
      profileImage?: string
      emergencyContacts: Array<{
        contactId: string
        name: string
        relationship: string
        mobile: string
        email: string
      }>
      houseHoldMembers: Array<{
        memberId: string
        name: string
        relationship: string
        emiratesIdNo: string
        emiratesIdExpiry: string
        nationality: string
      }>
    }>("/tenants/my-details")
  }

  async getMyLeases() {
    return this.request<
      Array<{
        rentalAgreement: {
          leaseId: string
          propertyName: string
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
        parkingList: Array<{
          parkingId: string
          slotNumber: string
          numberPlate: string
          model: string
          parkingFee: number
          includedInRent: boolean
        }>
        houseHoldMembers: Array<{
          memberId: string
          name: string
          relationship: string
          emiratesIdNo: string
          nationality: string
        }>
      }>
    >("/tenants/my-leases")
  }

  async getMyRefunds() {
    return this.request<
      Array<{
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
      }>
    >("/tenants/my-refunds")
  }

  // Payment endpoints
  async getMyPayments() {
    return this.request<
      Array<{
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
      }>
    >("/tenants/my-payments")
  }

  // Work Orders endpoints
  async getWorkOrders() {
    return this.request<
      Array<{
        workOrderId: string
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
      }>
    >("/work-orders")
  }

  async createWorkOrder(workOrder: {
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
  }) {
    return this.request<{ workOrderId: string }>("/work-orders", {
      method: "POST",
      body: JSON.stringify(workOrder),
    })
  }

  // Emergency Contacts
  async addEmergencyContact(contact: {
    name: string
    relationship: string
    mobile: string
    email: string
  }) {
    return this.request<{ contactId: string }>("/tenants/emergency-contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    })
  }

  async updateEmergencyContact(
    contactId: string,
    contact: {
      name: string
      relationship: string
      mobile: string
      email: string
    },
  ) {
    return this.request(`/tenants/emergency-contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(contact),
    })
  }

  async deleteEmergencyContact(contactId: string) {
    return this.request(`/tenants/emergency-contacts/${contactId}`, {
      method: "DELETE",
    })
  }

  // User Document Update
  async updateUserDocument(document: {
    documentType: string
    referenceId: string
  }) {
    return this.request("/users/document", {
      method: "POST",
      body: JSON.stringify(document),
    })
  }

  // File upload
  async uploadFile(file: File, category: string) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileCategory", category)
    formData.append("imageOwner", "tenant")

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export type { ApiResponse }
