"use client";

import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Key, User } from "lucide-react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { UserModel } from "@/models/user/user.response";
import {
  getUsersProfileService,
  updateUserService,
} from "@/services/dashboard/user/user.service";
import { UpdateUsers } from "@/components/shared/modal/user-modal";
import Loading from "@/components/shared/common/loading";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTab from "@/components/app/profile/profile-tab";
import ChangePasswordTab from "@/components/app/profile/change-password-tab";

export const mockUser: UserModel = {
  id: "u-001",
  name: "Jane",
  email: "jane.smith@example.com",
  status: "active",
  role: "ADMIN",
  profileUrl: "https://i.pravatar.cc/150?img=5",
  createdAt: new Date().toISOString(),
};

export interface Image {
  type: string;
  base64: string;
}

const profileFormSchema = z.object({
  name: z.string().optional(),
  profileUrl: z.string().optional(),
  email: z
    .string()
    .email({
      message: "Please enter a valid username address.",
    })
    .optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<Image | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserModel | null>(null);
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "",
      profileUrl: "",
    },
  });

  // Load user profile on component mount
  // replace both useEffects with this one 👇
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        // ✅ use mockUser instead of hitting service
        const response = mockUser;
        console.log("Loaded mock user profile:", response);

        setUser(response);
        // set to context/state if you need

        // Initialize form with user data
        profileForm.reset({
          name: response.name || "",
          email: response.email || "",
          status: response.status || "",
          role: response.role,
          profileUrl: response.profileUrl || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        AppToast({ type: "error", message: "Failed to load profile." });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [profileForm, setUser]);

  // Trigger file input click when avatar is clicked
  // in ProfilePage
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        AppToast({
          type: "error",
          message: "File too large, Image must be less than 5MB.",
        });
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setImageData({
          type: file.type,
          base64: base64,
        });
        setImagePreview(URL.createObjectURL(file));
      } catch (error) {
        console.error("Error converting image to base64", error);

        AppToast({
          type: "error",
          message:
            "Image processing error. Failed to process the image. Please try again.",
        });
      }
    }
  };

  // Function to convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the data:image/jpeg;base64, prefix
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      // ✅ just update the mock locally
      console.log("Updated profile (mock only):", values);

      // update user context
      setUser?.({
        ...mockUser,
        ...values, // merge changes
      });

      AppToast({ type: "success", message: "Profile updated (mock)!" });
    } catch (error) {
      console.error(error);
      AppToast({ type: "error", message: "Failed to update profile (mock)." });
    }
  };

  // Cleanup effect for image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="p-3">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          </div>

          <div className="grid gap-6">
            <Tabs defaultValue="account" className="space-y-4">
              <TabsList>
                <TabsTrigger
                  value="account"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  <span>Password</span>
                </TabsTrigger>
              </TabsList>

              <ProfileTab
                user={user}
                fileInputRef={fileInputRef}
                form={profileForm}
                imageData={imageData}
                onProfileSubmit={onProfileSubmit}
                tabValue="account"
                handleAvatarClick={handleAvatarClick}
                handleImageUpload={handleImageUpload}
                imagePreview={imagePreview}
              />

              <ChangePasswordTab value="password" />
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
