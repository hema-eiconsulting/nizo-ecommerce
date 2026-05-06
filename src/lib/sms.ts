// OTP / SMS is not currently used in this application.
// This file is kept as a placeholder for future integration.

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
