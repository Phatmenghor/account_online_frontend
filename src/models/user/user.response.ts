export interface UserModel {
  id: string;
  name: string;
  email: string;
  profileUrl: string;
  status: string; // e.g. "active" | "inactive"
  createdAt: string; // ISO date string
  role: string; // e.g. "Admin" | "Editor" | "Viewer"
}

export interface AllUsers {
  content: UserModel[];
  total: number; // total number of users across all pages
  pageNo: number; // current page number
  pageSize: number; // number of users per page
  totalPages: number; // total number of pages
}
