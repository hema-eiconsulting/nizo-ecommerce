/**
 * 2Factor.in SMS helper
 * API docs: https://2factor.in/API/V1/
 *
 * Send OTP:
 *   GET https://2factor.in/API/V1/{API_KEY}/SMS/{phone}/{OTP}/{TEMPLATE_NAME}
 *   Template name is optional — omit to use default transactional message.
 */

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.TWOFACTOR_API_KEY;

  if (!apiKey) {
    throw new Error("TWOFACTOR_API_KEY is not configured");
  }

  // 2Factor expects 10-digit Indian mobile number (no country code)
  const mobile = phone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);

  // Use a custom template if defined, otherwise omit (uses 2Factor default)
  const templateName = process.env.TWOFACTOR_TEMPLATE_NAME || "AUTOGEN2";

  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/${otp}/${templateName}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.Status !== "Success") {
    console.error("2Factor SMS error:", data);
    throw new Error(data.Details || "Failed to send OTP via 2Factor");
  }
}
