// POST /api/auth/register
// Day 7: this will save a new parent account to the database
export const registerUser = (req, res) => {
  const { fullName, email, phone } = req.body;

  // We do NOT send the password back - it is private
  res.status(200).json({
    success: true,
    message: 'Register route is working. Saving users will be added on Day 7.',
    received: { fullName, email, phone },
  });
};

// POST /api/auth/login
// Day 7: this will check the email and password and return a JWT token
export const loginUser = (req, res) => {
  const { email } = req.body;

  res.status(200).json({
    success: true,
    message: 'Login route is working. Real login will be added on Day 7.',
    received: { email },
  });
};