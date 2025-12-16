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