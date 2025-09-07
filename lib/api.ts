import type { ApiResponse, DocumentItem, HouseholdMember } from "./types/api-responses"
import type {
  LoginResponse,
  TenantDetailsResponse,
  LeaseDetailsResponse,
  PaymentResponse,
  RefundResponse,
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
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
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

  // Tenant endpoints
  async getTenantDetails() {
    return this.request<TenantDetailsResponse>("/tenants/my-details")
  }

  async getMyLeases() {
    return this.request<LeaseDetailsResponse[]>("/tenants/my-leases")
  }

  async getMyRefunds(leaseId: string) {
    return this.request<RefundResponse[]>("/tenants/my-refunds?leaseId=" + leaseId)
  }
 async getMyDocuments() {
    return this.request<DocumentItem[]>("/documents")
  }
  // Payment endpoints
  async getMyPayments(leaseId: string) {
    return this.request<PaymentResponse[]>("/tenants/my-payments?leaseId=" + leaseId)
  }

  // Work Orders endpoints
  async getWorkOrders() {
    return this.request<WorkOrderResponse[]>("/tenants/my-work-orders")
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
}

export const apiClient = new ApiClient(API_BASE_URL)
export type { ApiResponse }
