import type { ApiResponse, DocumentItem, HouseholdMember, PaginatedLeasesResponse, PaginatedPaymentResponse, PaginatedRefundResponse, PaginatedWorkOrderResponse } from "./types/api-responses"
import type {
  LoginResponse,
  TenantDetailsResponse,
  LeaseDetailsResponse,
  WorkOrderResponse,
  FileUploadResponse,
} from "./types/api-responses"
import type {
  LoginRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  EmergencyContactRequest,
  CreateWorkOrderRequest,
  UpdateUserDocumentRequest,
  UpdateProfileRequest,
  CreateHouseholdMemberRequest,
  UpdateHouseholdMemberRequest,
} from "./types/api-requests"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

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
      localStorage.removeItem("userData")
      localStorage.removeItem("onboardingCompleted")
    }
  }

  private handleUnauthorized() {
    this.clearToken()
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        this.handleUnauthorized()
        throw new Error("Unauthorized - Please login again")
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        this.handleUnauthorized()
      }
      throw error
    }
  }
  async getAvailableProperties(): Promise<ApiResponse<any>> {
    return this.request<any>("/assets-info/properties")
  }

  async submitRentalInterest(data: any): Promise<ApiResponse<any>> {
    return this.request<any>("/guest/submit-rent-interest", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
  // Auth endpoints
  async login(request: LoginRequest) {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        userType: "TENANT"
      }),
    })

    if (response.data.accessToken) {
      this.setToken(response.data.accessToken)
    }

    return response
  }

  async requestOtp(email: string): Promise<ApiResponse<void>> {
    return this.request<void>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }
  async verifyOtp(request: VerifyOtpRequest) {
    const response = await this.request<LoginResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(request),
    })

    if (response.data.accessToken) {
      this.setToken(response.data.accessToken)
    }

    return response
  }

  async forgotPassword(request: ForgotPasswordRequest) {
    return this.request<{ message: string }>("/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }



  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" })
    } finally {
      this.clearToken()
    }
  }

  async changePassword(request: ChangePasswordRequest) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

    async validatePasswordResetToken(token: string) {
    return this.request<{ message: string }>("/auth/validate-reset-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ token: token, newPassword: password }),
    })
  }

  // Tenant endpoints
  async getTenantDetails() {
    return this.request<TenantDetailsResponse>("/tenants/my-details")
  }

  async getMyLeases() {
    return this.request<PaginatedLeasesResponse>("/tenants/my-leases?page=0&pageSize=100")
  }

  async getMyRefunds(leaseId: string) {
    return this.request<PaginatedRefundResponse>("/tenants/my-refunds?page=0&pageSize=100&leaseId=" + leaseId)
  }

  async downloadRefundReceipt(expenseId: string): Promise<Blob> {
    const url = `${this.baseURL}/expenses/receipt?expenseId=${expenseId}`
    const headers: Record<string, string> = {}

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (response.status === 401) {
        this.handleUnauthorized()
        throw new Error("Unauthorized - Please login again")
      }

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      return response.blob()
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        this.handleUnauthorized()
      }
      throw error
    }
  }
 async getMyDocuments() {
    return this.request<DocumentItem[]>("/documents")
  }
  // Payment endpoints
  async getMyPayments(leaseId: string) {
    return this.request<PaginatedPaymentResponse>("/tenants/my-payments?page=0&pageSize=100&leaseId=" + leaseId)
  }

  async downloadPaymentReceipt(receiptId: string): Promise<Blob> {
    const url = `${this.baseURL}/collections/receipt?receiptId=${receiptId}`
    const headers: Record<string, string> = {}

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (response.status === 401) {
        this.handleUnauthorized()
        throw new Error("Unauthorized - Please login again")
      }

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      return response.blob()
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        this.handleUnauthorized()
      }
      throw error
    }
  }

  // Work Orders endpoints
  async getWorkOrders() {
    return this.request<PaginatedWorkOrderResponse>("/tenants/my-work-orders?page=0&pageSize=100")
  }

   async updateTenantProfile(data: UpdateProfileRequest): Promise<ApiResponse<TenantDetailsResponse>> {
    return this.request<TenantDetailsResponse>("/tenants/self", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }


  async createWorkOrder(request: CreateWorkOrderRequest) {
    return this.request<string>("/work-orders", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }
  async cancelWorkOrder(workOrderId: string) {
    return this.request(`/work-orders/${workOrderId}`, {
      method: "PUT",
      body: JSON.stringify({
        workOrderStatus: 'CANCELLED'
      }),
    })
  }
  // Emergency Contacts
  async addEmergencyContact(request: EmergencyContactRequest) {
    return this.request<{ contactId: string }>("/tenants/emergency-contacts", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async updateEmergencyContact(contactId: string, request: EmergencyContactRequest) {
    return this.request(`/tenants/emergency-contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    })
  }

  async deleteEmergencyContact(contactId: string) {
    return this.request(`/tenants/emergency-contacts/${contactId}`, {
      method: "DELETE",
    })
  }


  // Household Members
  async getHouseholdMembers(leaseId: string) {
    return this.request<HouseholdMember[]>(`/tenants/household-members?leaseId=${leaseId}`)
  }

  async createHouseholdMember(request: CreateHouseholdMemberRequest) {
    return this.request<{ memberId: string }>("/tenants/household-members", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async updateHouseholdMember(memberId: string, request: UpdateHouseholdMemberRequest) {
    return this.request<HouseholdMember>(`/tenants/household-members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    })
  }

  async deleteHouseholdMember(memberId: string) {
    return this.request(`/tenants/household-members/${memberId}`, {
      method: "DELETE",
    })
  }


  // User Document Update
  async updateUserDocument(request: UpdateUserDocumentRequest) {
    return this.request("/users/document", {
      method: "PUT",
      body: JSON.stringify(request),
    })
  }

  // File upload
  async uploadFile(file: File, category: string): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileCategory", category)
    formData.append("imageOwner", "tenant")

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/files/upload`, {
        method: "POST",
        headers,
        body: formData,
      })

      if (response.status === 401) {
        this.handleUnauthorized()
        throw new Error("Unauthorized - Please login again")
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      return response.json() as Promise<FileUploadResponse>
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        this.handleUnauthorized()
      }
      throw error
    }
  }

  // Utility method to get file URL from reference ID
  getFileUrl(referenceId: string): string {
    return `${this.baseURL}/files/${referenceId}`
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export type { ApiResponse }
