export interface UserRequest {
  search?: string;
  status?: string;
  roles?: string[];
  pageNo?: number;
  pageSize?: number;
}

export interface CreateUser {
  name: string;
  email: string;
  status: string; // e.g. "active" | "inactive"
  role: string; // e.g. "Admin" | "Editor" | "Viewer"
}

export interface UpdateUser {
  name?: string;
  email?: string;
  status?: string; // e.g. "active" | "inactive"
  role?: string; // e.g. "Admin" | "Editor" | "Viewer"
}
