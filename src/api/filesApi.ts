import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

/**
 * Upload a file to the backend
 * @param file - The file to upload
 * @returns Promise with the file ID
 */
export const uploadFileApi = async (file: File): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    })

    // Return the file ID from the response data
    return response.data.data._id
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

    // Return the file path from the response data
    return response.data.data.path
  } catch (error: any) {
    console.error('Error fetching file URL:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch file URL')
  }
}


export const deleteFileApi = async (fileId: string): Promise<void> => {
  try {
    await api.delete(`/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    })
  } catch (error: any) {
    console.error('Error deleting file:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete file')
  }
}
