import { UserRequest } from "@/models/user/user.request";
import { AllUsers, UserModel } from "@/models/user/user.response";
import axios from "axios";

// Standardized mock users
export const mockUsers: UserModel[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "ADMIN",
    profileUrl: "",
    status: "ACTIVE",
    createdAt: "2024-01-15T09:30:00Z",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    role: "DEVELOPER",
    profileUrl: "",
    status: "INACTIVE",
    createdAt: "2023-11-22T14:45:00Z",
  },
  {
    id: "3",
    name: "Charlie Nguyen",
    email: "charlie.nguyen@example.com",
    role: "ADMIN",
    profileUrl: "",
    status: "ACTIVE",
    createdAt: "2024-03-10T07:20:00Z",
  },
  {
    id: "4",
    name: "Diana Lopez",
    email: "diana.lopez@example.com",
    role: "USER",
    profileUrl: "",
    status: "ACTIVE",
    createdAt: "2024-02-05T12:00:00Z",
  },
  {
    id: "5",
    name: "Ethan Wang",
    email: "ethan.wang@example.com",
    role: "USER",
    profileUrl: "",
    status: "INACTIVE",
    createdAt: "2023-12-30T16:15:00Z",
  },
  {
    id: "6",
    name: "Fiona Patel",
    email: "fiona.patel@example.com",
    role: "USER",
    profileUrl: "",
    status: "ACTIVE",
    createdAt: "2024-04-01T10:05:00Z",
  },
  {
    id: "7",
    name: "George Kim",
    email: "george.kim@example.com",
    role: "ADMIN",
    profileUrl: "",
    status: "INACTIVE",
    createdAt: "2023-10-18T08:50:00Z",
  },
  {
    id: "8",
    name: "Hannah Davis",
    email: "hannah.davis@example.com",
    role: "USER",
    profileUrl: "",
    status: "ACTIVE",
    createdAt: "2024-01-22T13:40:00Z",
  },
  {
    id: "9",
    name: "Ivan Martinez",
    email: "ivan.martinez@example.com",
    role: "USER",
    profileUrl: "",
    status: "INACTIVE",
    createdAt: "2023-09-29T11:30:00Z",
  },
  {
    id: "10",
    name: "Julia Thompson",
    email: "julia.thompson@example.com",
    role: "USER",
    profileUrl: "",
    status: "ACTIVE",
    createdAt: "2024-03-28T15:25:00Z",
  },
];

export async function getUsersService(request: UserRequest): Promise<AllUsers> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Default pagination
    const pageNo = request?.pageNo ?? 1;
    const pageSize = request?.pageSize ?? 10;

    // Optional filtering by search or status
    let filteredUsers = mockUsers;

    if (request.search) {
      filteredUsers = filteredUsers.filter((u) =>
        u.name.toLowerCase().includes(request?.search?.toLowerCase() || "")
      );
    }

    if (request.status) {
      filteredUsers = filteredUsers.filter((u) => u.status === request?.status);
    }

    // Pagination
    const startIndex = (pageNo - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Return paginated data + metadata
    return {
      content: paginatedUsers,
      total: filteredUsers.length,
      pageNo,
      pageSize,
      totalPages: Math.ceil(filteredUsers.length / pageSize),
    };
  } catch (error) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch users.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching users.",
        rawError: error,
      };
    }
  }
}

export const getUserByIdService = (id: string) => {
  try {
    const user = mockUsers.find((user) => user.id === id);
    return user;
  } catch (error: any) {
    // Axios error handling (optional for mock)
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch user by id.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching user by id.",
        rawError: error,
      };
    }
  }
};

export async function createUserService(
  newUser: Omit<UserModel, "id" | "createdAt">
): Promise<UserModel> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a new unique ID (string)
    const newId = (mockUsers.length + 1).toString();

    // Build user object
    const user: UserModel = {
      ...newUser,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    // Push into in-memory array (mock DB)
    mockUsers.push(user);

    return user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to create user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while creating user.",
        rawError: error,
      };
    }
  }
}

// 📝 Mock update user
export async function updateUserService(
  id: string,
  updates: Partial<Omit<UserModel, "id" | "createdAt">>
): Promise<UserModel> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find user by id
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      throw { errorMessage: `User with id ${id} not found.` };
    }

    // Update fields (don't allow id/createdAt overwrite)
    const updatedUser: UserModel = {
      ...mockUsers[index],
      ...updates,
      id: mockUsers[index].id,
      createdAt: mockUsers[index].createdAt,
    };

    // Save back into array
    mockUsers[index] = updatedUser;

    return updatedUser;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to update user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while updating user.",
        rawError: error,
      };
    }
  }
}

// 🗑️ Mock delete user
export async function deleteUserService(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      throw { errorMessage: `User with id ${id} not found.` };
    }

    // Remove from array
    mockUsers.splice(index, 1);

    return {
      success: true,
      message: `User with id ${id} deleted successfully.`,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to delete user.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while deleting user.",
        rawError: error,
      };
    }
  }
}

export async function getUsersProfileService(): Promise<UserModel> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate delay
  return mockUsers[0]; // Alice Johnson (or whichever you want)
}
