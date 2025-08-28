"use client";
import React, { useEffect, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Calendar,
  Camera,
  Info,
  Loader2,
  Mail,
  Save,
  Edit3,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, ProfileFormData } from "@/app/(dashboard)/profile/page";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { UserModel } from "@/models/user/user.response";

interface Props {
  tabValue: string;
  handleAvatarClick: () => void;
  user?: UserModel | null;
  imagePreview: string | null;
  form: ReturnType<typeof useForm<ProfileFormData>>;
  imageData: Image | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileSubmit: (values: ProfileFormData) => void;
  fileInputRef: React.LegacyRef<HTMLInputElement> | undefined;
}

export default function ProfileTab({
  tabValue,
  fileInputRef,
  onProfileSubmit,
  imagePreview,
  imageData,
  form,
  handleImageUpload,
  user,
  handleAvatarClick,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  const {
    control,
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset,
  } = form;

  // Handle edit mode toggle
  const handleEditModeToggle = () => {
    if (editMode) {
      reset();
      setEditMode(false);
    } else {
      // Enter edit mode
      setEditMode(true);
    }
  };

  // Handle form submission - Fixed to ensure proper async handling
  const handleFormSubmit = async (values: ProfileFormData) => {
    try {
      console.log("Form submitted with values:", values); // Debug log
      await onProfileSubmit(values);
      setEditMode(false); // Exit edit mode after successful submission
    } catch (error) {
      console.error("Form submission error:", error);
      // Keep edit mode active if there's an error
    }
  };

  return (
    <TabsContent value={tabValue}>
      <div className="grid gap-6 md:grid-cols-12">
        {/* Profile Banner Section - Enhanced for theme compatibility */}
        <Card className="md:col-span-12 overflow-hidden border-enhanced">
          <div className="h-24 bg-gradient-to-r from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 items-start">
              {/* Profile Image Upload - Only clickable in edit mode */}
              <div
                className={`relative group z-10 ${
                  editMode ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={editMode ? handleAvatarClick : undefined}
                role={editMode ? "button" : undefined}
              >
                {/* Avatar */}
                <Avatar
                  className={`h-28 w-28 border-4 border-background dark:border-card shadow-md transition-all ${
                    editMode ? "group-hover:border-primary/30" : ""
                  }`}
                >
                  <AvatarImage
                    src={
                      imagePreview ||
                      (user?.profileUrl
                        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profileUrl}`
                        : "")
                    }
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary dark:bg-primary/20">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Hover Camera Icon Overlay - Only show in edit mode */}
                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}

                {/* Hidden File Input */}
                <Input
                  ref={fileInputRef}
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isSubmitting || !editMode}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-12 md:pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{user?.name.trim()}</h2>
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`
                    badge ${
                      user?.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800"
                        : "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                    }
                  `}
                    >
                      {user?.status || "PENDING"}
                    </Badge>

                    {/* Edit Mode Toggle Button */}
                    <Button
                      variant={editMode ? "outline" : "secondary"}
                      size="sm"
                      onClick={handleEditModeToggle}
                      disabled={isSubmitting}
                      className="gap-1.5"
                    >
                      {editMode ? (
                        <>
                          <X className="h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {user?.email || "username@example.com"}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently"}
                  </div>
                </div>

                {imageData && editMode && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                      <Info className="h-4 w-4" />
                      New profile image selected - Click Save Changes to update
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Form */}
        <Card className="md:col-span-12 border-enhanced">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  {editMode
                    ? " Edit your account information and profile details."
                    : " View your account information and profile details."}
                </CardDescription>
              </div>

              {/* Edit Mode Indicator */}
              {editMode && (
                <Badge variant="secondary" className="gap-1">
                  <Edit3 className="h-3 w-3" />
                  Edit Mode
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="mb-5">
            <Form {...form}>
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            autoComplete="email"
                            readOnly // Username is always readonly
                            disabled={isSubmitting}
                            placeholder="username@example.com"
                            className={!editMode ? "bg-muted/50" : ""}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <FormControl>
                          <Input
                            id="name"
                            autoComplete="name"
                            readOnly={!editMode}
                            disabled={isSubmitting}
                            placeholder="Name"
                            className={!editMode ? "bg-muted/50" : ""}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="status">Status</FormLabel>
                        <FormControl>
                          <Input
                            id="status"
                            readOnly
                            disabled={isSubmitting}
                            className="bg-muted/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Save Button - Only show in edit mode */}
                {editMode && (
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditModeToggle}
                      disabled={isSubmitting}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="gap-1 btn-primary"
                      disabled={isSubmitting || (!imageData && !isDirty)}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
