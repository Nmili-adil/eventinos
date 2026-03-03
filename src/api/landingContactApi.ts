import { api } from "@/lib/apiClient";
import type { ContactFormData } from "@/schema/contactFormSchema";

/**
 * Public (no-auth) endpoint for landing page contact form submissions.
 * Sends a POST request without authorization headers.
 */
export const submitContactForm = async (data: ContactFormData) => {
  const response = await api.post("/contacts/public", data, {
    headers: {
      "Content-Type": "application/json",
    },
    // Explicitly omit auth — this is a public endpoint
    transformRequest: [
      (data, headers) => {
        delete headers["Authorization"];
        return JSON.stringify(data);
      },
    ],
  });
  return response.data;
};
