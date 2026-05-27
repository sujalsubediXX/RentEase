// Define the ValidationErrors type at the top of the file
export interface ValidationErrors {
  [key: string]: string;
}

// Define RegisterData interface for validation
export interface RegisterData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: 'renter' | 'owner' | 'admin';
  address: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return emailRegex.test(email);
};

export const validateNepaliPhone = (phone: string): boolean => {
  // Nepali phone number format: 98XXXXXXXX, 97XXXXXXXX, 96XXXXXXXX
  const phoneRegex = /^[9][678][0-9]{8}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLoginForm = (email: string, password: string) => {
  const errors: { email?: string; password?: string } = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegisterForm = (data: RegisterData) => {
  const errors: ValidationErrors = {};
  
  // Full Name validation
  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.length < 3) {
    errors.fullName = 'Name must be at least 3 characters';
  } else if (data.fullName.length > 50) {
    errors.fullName = 'Name must be less than 50 characters';
  }
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone number validation
  if (!data.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!validateNepaliPhone(data.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid Nepali phone number (e.g., 98XXXXXXXX, 97XXXXXXXX, 96XXXXXXXX)';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      // Show the first error only for cleaner UI
      errors.password = passwordValidation.errors[0];
    }
  }
  
  // Confirm password validation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Address validation
  if (!data.address.trim()) {
    errors.address = 'Address is required';
  } else if (data.address.length < 5) {
    errors.address = 'Please enter a complete address';
  }
  
  // Role is already selected by default, no need to validate
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Optional: Additional utility validation functions

export const validateProductPrice = (price: number): boolean => {
  return price > 0 && price < 1000000 && !isNaN(price);
};

export const validateRentalDates = (startDate: Date, endDate: Date): { 
  isValid: boolean; 
  error?: string 
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (startDate < today) {
    return {
      isValid: false,
      error: 'Start date cannot be in the past'
    };
  }
  
  if (endDate <= startDate) {
    return {
      isValid: false,
      error: 'End date must be after start date'
    };
  }
  
  const maxRentalDays = 30; // Maximum 30 days rental
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  
  if (daysDiff > maxRentalDays) {
    return {
      isValid: false,
      error: `Rental period cannot exceed ${maxRentalDays} days`
    };
  }
  
  return {
    isValid: true
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .slice(0, 500); // Limit length
};