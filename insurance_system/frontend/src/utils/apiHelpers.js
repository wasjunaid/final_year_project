// src/utils/apiHelpers.js
export const handleApiError = (error) => {
  // Handle 404 - return empty array
  if (error.response?.data?.status === 404 || error.response?.status === 404) {
    return [];
  }
  
  // For other errors, throw to be caught by calling function
  throw error;
};