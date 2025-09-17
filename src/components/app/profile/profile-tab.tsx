"use client";
import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { UserModel } from "@/models/user/user.response";
import { UpdateUserForm } from "@/models/user/user.schema";
import { Image } from "@/app/(dashboard)/profile/page";

interface Props {
  tabValue: string;
  handleAvatarClick: () => void;
  user?: UserModel | null;
  imagePreview: string | null;
  form: ReturnType<typeof useForm<UpdateUserForm>>;
  imageData: Image | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileSubmit: (values: UpdateUserForm) => void;
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
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = form;

  const handleEditModeToggle = () => {
    if (editMode) {
      reset(undefined, { keepDefaultValues: true });
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  const handleFormSubmit = async (values: UpdateUserForm) => {
    try {
      await onProfileSubmit(values);
      setEditMode(false);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <TabsContent value={tabValue}>
      <div className="grid gap-6 md:grid-cols-12">
        {/* Profile Banner */}
        <Card className="md:col-span-12 overflow-hidden border-enhanced">
          <div className="h-24 bg-gradient-to-r from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 items-start">
              <div
                className={`relative group z-10 ${
                  editMode ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={editMode ? handleAvatarClick : undefined}
                role={editMode ? "button" : undefined}
              >
                <Avatar className="h-28 w-28 border-4 border-background dark:border-card shadow-md transition-all">
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

                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}

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

              <div className="flex-1 pt-12 md:pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">
                      {user?.fullName?.trim()}
                    </h2>
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`badge ${
                        user?.userStatus === "ACTIVE"
                          ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800"
                          : "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                      }`}
                    >
                      {user?.userStatus || "PENDING"}
                    </Badge>

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

                <div className="flex flex-col sm:flex-row gap-3 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {user?.email || "username@example.com"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Joined{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Recently"}
                  </div>
                </div>

                {imageData && editMode && (
                  <p className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                    <Info className="h-4 w-4" /> New profile image selected -
                    Click Save Changes
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-12 border-enhanced">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  {editMode
                    ? "Edit your account information and profile details."
                    : "View your account information and profile details."}
                </CardDescription>
              </div>
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="username">Id Card</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly={!editMode}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly={!editMode}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="fullName">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly={!editMode}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="position">Position</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly={!editMode}
                            disabled={isSubmitting}
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
                            {...field}
                            readOnly
                            disabled
                            className="bg-muted/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save Changes
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
