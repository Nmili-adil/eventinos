import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

/**
 * Upload a file to the backend
 * @param file - The file to upload
 * @returns Promise with the file ID
 */
export const uploadFileApi = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    })

    // Assuming the backend returns { id: string } or { _id: string }
    return response.data.id || response.data._id || response.data.data?.id || response.data.data?._id
  } catch (error: any) {
    console.error('Error uploading file:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload file')
  }
}

/**
 * Get file URL by ID
 * @param fileId - The file ID
 * @returns Promise with the file URL
 */
export const getFileUrlApi = async (fileId: string): Promise<string> => {
  try {
    const response = await api.get(`/files/${fileId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    })

    // Assuming the backend returns { url: string } or similar
    return response.data.url || response.data.data?.url || response.data
  } catch (error: any) {
    console.error('Error fetching file URL:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch file URL')
  }
}

