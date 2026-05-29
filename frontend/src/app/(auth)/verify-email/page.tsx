import { VerifyEmailClient } from "@/components/auth/verify-email-client";

export default function VerifyEmailPage({ searchParams }: { searchParams?: { email?: string; otp?: string } }) {
  return <VerifyEmailClient initialEmail={searchParams?.email || ""} initialOtp={searchParams?.otp || ""} />;
}
