interface UserSession {
  duz: string;
  htLocation: string;
  userName: string;
  password: string;
  name?: string;
}

export const getSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const setSession = (data: {
  duz: string;
  htLocation: string;
  userName: string;
  password: string;
  name?: string;
}) => {
  if (typeof window === 'undefined') return;
  
  const userData = {
    duz: data.duz,
    htLocation: data.htLocation,
    userName: data.userName,
    password: data.password,
    name: data.name
  };
  
  localStorage.setItem('userData', JSON.stringify(userData));
  document.cookie = `isAuthenticated=true; path=/`;
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('userData');
  document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};
