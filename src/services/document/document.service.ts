import { axiosServer } from "@/utils/axios";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip data:image/jpeg;base64, prefix
    };
    reader.onerror = reject;
  });
};

export const uploadDocument = async (
  file: File,
  type: string,
  legalId?: string,
): Promise<string> => {
  try {
    const base64 = await fileToBase64(file);

    const response = await axiosServer.post("/api/public/upload", {
      fileBase64: base64,
      fileName: file.name,
      type,
      legalId,
    });

    if (response.data && response.data.filename) {
      return response.data.filename;
    }
    throw new Error("Upload failed: No filename returned");
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};
