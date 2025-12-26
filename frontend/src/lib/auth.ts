// Authentication utilities

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  usdBalance?: string;
  btcBalance?: string;
  ethBalance?: string;
  emailVerified: boolean;
  totpEnabled: boolean;
}

export const authService = {
  // Get auth token
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  },

  // Get user data
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Logout
  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  },

  // Fetch with auth
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    // Auto logout on 401
    if (response.status === 401) {
      this.logout();
      throw new Error("Session expired");
    }

    return response;
  },

  // Get user profile
  async getProfile() {
    const response = await this.fetchWithAuth("/api/user/profile");
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  // Get user permissions
  async getPermissions() {
    const response = await this.fetchWithAuth("/api/user/permissions");
    if (!response.ok) throw new Error("Failed to fetch permissions");
    return response.json();
  },

  // Check feature access
  hasFeature(feature: string, permissions?: Record<string, boolean>): boolean {
    if (!permissions) return false;
    return permissions[feature] === true;
  },

  // Check role
  hasRole(requiredRole: string, userRole?: string): boolean {
    const user = this.getUser();
    const role = userRole || user?.role;
    if (!role) return false;

    const roleHierarchy: Record<string, number> = {
      SUPER_ADMIN: 100,
      ADMIN: 80,
      DOCTOR: 60,
      MODERATOR: 50,
      USER: 10,
      GUEST: 0,
    };

    return (roleHierarchy[role] || 0) >= (roleHierarchy[requiredRole] || 0);
  },
};

export default authService;
