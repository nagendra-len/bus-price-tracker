// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation - Indian format
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[^\d]/g, ''));
};

// Password validation (minimum 6 characters)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Name validation
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// Price validation
export const isValidPrice = (price: number): boolean => {
  return price > 0 && !isNaN(price);
};

// Route validation
export const isValidRoute = (source: string, destination: string): boolean => {
  return (
    source.trim().length > 0 &&
    destination.trim().length > 0 &&
    source.toLowerCase() !== destination.toLowerCase()
  );
};

// Login form validation
export const validateLoginForm = (emailOrPhone: string, password: string) => {
  const errors: { [key: string]: string } = {};

  if (!emailOrPhone) {
    errors.emailOrPhone = 'Email or phone is required';
  } else if (!isValidEmail(emailOrPhone) && !isValidPhone(emailOrPhone)) {
    errors.emailOrPhone = 'Please enter a valid email or phone number';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// Register form validation
export const validateRegisterForm = (
  name: string,
  emailOrPhone: string,
  password: string,
  confirmPassword: string
) => {
  const errors: { [key: string]: string } = {};

  if (!name) {
    errors.name = 'Name is required';
  } else if (!isValidName(name)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }

  if (!emailOrPhone) {
    errors.emailOrPhone = 'Email or phone is required';
  } else if (!isValidEmail(emailOrPhone) && !isValidPhone(emailOrPhone)) {
    errors.emailOrPhone = 'Please enter a valid email or phone number';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// Alert form validation
export const validateAlertForm = (source: string, destination: string, targetPrice: number) => {
  const errors: { [key: string]: string } = {};

  if (!source) {
    errors.source = 'Source is required';
  }

  if (!destination) {
    errors.destination = 'Destination is required';
  }

  if (!isValidRoute(source, destination)) {
    errors.route = 'Source and destination must be different';
  }

  if (!targetPrice) {
    errors.targetPrice = 'Target price is required';
  } else if (!isValidPrice(targetPrice)) {
    errors.targetPrice = 'Please enter a valid price';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
