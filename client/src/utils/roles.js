// Returns the dashboard address for each role
export const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'driver') return '/driver';
  return '/parent';
};