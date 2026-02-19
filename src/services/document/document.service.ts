import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/v1/public/upload-document`;

export const uploadDocument = async (file: File, type: string, legalId?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (legalId) {
        formData.append('legalId', legalId);
    }

    try {
        const response = await axios.post(API_BASE_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data && response.data.filename) {
            return response.data.filename;
        } else {
            throw new Error('Upload failed: No filename returned');
        }
    } catch (error) {
        console.error('Error uploading document:', error);
        throw error;
    }
};
