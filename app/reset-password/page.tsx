"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<null | boolean>(null);
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setTokenValid(false);
    }
    // eslint-disable-next-line
  }, []);

  const validateToken = async (token: string) => {
    try {
      const res = await apiClient.validatePasswordResetToken(token);
      // If API returns success, token is valid
      setTokenValid(true);
    } catch (error) {
      setTokenValid(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
  await apiClient.resetPassword(token, newPassword);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now log in.",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Password Reset Failed",
        description: "There was an error resetting your password. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        {tokenValid === null ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : tokenValid === false ? (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold mb-2 text-red-600">Invalid or Expired Token</h2>
            <p className="text-center">The link you followed is invalid or has expired. Please request a new password reset link or return to login.</p>
            <Button onClick={() => router.push("/")} className="mt-2">Back to Login</Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
