import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react'
import { uploadFileApi, getFileUrlApi, deleteFileApi } from '@/api/filesApi'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadComplete: (url: string) => void
  currentUrl?: string
  label?: string
  accept?: string
  disabled?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  currentUrl,
  label = 'Upload File',
  accept = 'image/*',
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const fileId = await uploadFileApi(file)
      const url: any = await getFileUrlApi(fileId)
      setUploadedUrl(fileId)
      console.log('url', url)
      onUploadComplete(url.data?.path || url.url || url.data?.url || url)
      toast.success('File uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      if (uploadedUrl) {
        console.log('uploadedUrl', uploadedUrl)
        await deleteFileApi(uploadedUrl as string)
        toast.success('File deleted successfully')
        setUploadedUrl(null)
        setPreview(null)
        onUploadComplete('')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file')
    } finally {
      setUploading(false)
      setPreview(null)
      setUploadedUrl(null)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <Label
            htmlFor={`file-upload-${label}`}
            className={`cursor-pointer ${
              disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Button
              type="button"
              variant="outline"
              disabled={disabled || uploading}
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {preview ? 'Change File' : 'Choose File'}
                </>
              )}
            </Button>
          </Label>
        </div>
        {preview && (
          <div className="relative">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {uploadedUrl && (
                <div className="absolute top-1 right-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600 bg-white rounded-full" />
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      {preview && !uploadedUrl && (
        <p className="text-xs text-yellow-600">Preview only - upload in progress</p>
      )}
    </div>
  )
}

