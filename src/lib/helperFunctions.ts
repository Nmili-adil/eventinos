export const formatDate = (dateInput: any): string => {
    try {
      if (!dateInput) return 'N/A';
      
      let date: Date;
      
      if (typeof dateInput === 'string') {
        // Try parsing as ISO string first, then as timestamp
        date = new Date(dateInput);
        if (isNaN(date.getTime())) {
          const timestamp = parseInt(dateInput);
          date = new Date(timestamp);
        }
      } else if (dateInput.$date && dateInput.$date.$numberLong) {
        const timestamp = parseInt(dateInput.$date.$numberLong);
        date = new Date(timestamp);
      } else if (dateInput.$numberLong) {
        const timestamp = parseInt(dateInput.$numberLong);
        date = new Date(timestamp);
      } else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return 'N/A';
      }
      
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

const readFileName = (contentDisposition: unknown): string | null => {
  if (typeof contentDisposition !== 'string') return null;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      // Malformed encoding: fall through to the plain filename.
    }
  }
  return /filename="?([^";]+)"?/i.exec(contentDisposition)?.[1]?.trim() ?? null;
};

// Saves a blob response as a file, named by the server when it says so. Browsers
// only expose that header if the API lists it in Access-Control-Expose-Headers.
export const downloadBlob = (
  response: { data: Blob; headers?: Record<string, any> },
  fallbackName: string,
) => {
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = readFileName(response.headers?.['content-disposition']) ?? fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// With responseType "blob", a JSON error body also arrives as a Blob.
export const readBlobErrorMessage = async (error: any): Promise<string | undefined> => {
  const data = error?.response?.data;
  if (!(data instanceof Blob)) return data?.message;
  try {
    return JSON.parse(await data.text())?.message;
  } catch {
    return undefined;
  }
};
