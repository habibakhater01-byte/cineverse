const { z } = require("zod");

const email = z.string().trim().toLowerCase().email("Enter a valid email");
const password = z.string().min(6, "Password must be at least 6 characters").max(100);

const registerSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(30),
  email,
  password,
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({ email });

const resetPasswordSchema = z
  .object({
    email,
    otp: z.string().trim().length(6, "OTP must be 6 digits"),
    new_password: password,
    new_password_confirmation: z.string(),
  })
  .refine((d) => d.new_password === d.new_password_confirmation, {
    message: "Passwords do not match",
    path: ["new_password_confirmation"],
  });

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };