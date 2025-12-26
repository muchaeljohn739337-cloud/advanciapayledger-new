"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, QrCode, CheckCircle, Copy, Download, AlertCircle } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

interface SetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntry: string;
}

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleInitiateSetup = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(\\/api/totp/setup\, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \Bearer \\,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup 2FA");
      }

      setSetupData(data);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to initiate 2FA setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(\\/api/totp/verify\, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \Bearer \\,
        },
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "secret" | "backup") => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;
    
    const content = \Advancia Pay - 2FA Backup Codes\n\nGenerated: \\n\n\\n\nKeep these codes safe and secure. Each can only be used once.\;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \dvancia-pay-backup-codes-\.txt\;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupCodesSaved(true);
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">Two-Factor Authentication Setup</h1>
              <p className="text-indigo-100 text-sm">Secure your account with 2FA</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-between items-center mt-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={\w-8 h-8 rounded-full flex items-center justify-center font-bold \\}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={\lex-1 h-1 mx-2 \\}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Introduction */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Enable 2FA?</h2>
                <p className="text-gray-600 mb-6">
                  Two-factor authentication adds an extra layer of security to your account by
                  requiring a verification code from your phone in addition to your password.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  What you'll need:
                </h3>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• An authenticator app (Google Authenticator, Authy, or similar)</li>
                  <li>• Your smartphone or tablet</li>
                  <li>• About 2-3 minutes to complete setup</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Once enabled, you'll need both your password and a code
                  from your authenticator app to sign in.
                </p>
              </div>

              <button
                onClick={handleInitiateSetup}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
              >
                {isLoading ? "Setting up..." : "Get Started"}
              </button>
            </div>
          )}

          {/* Step 2: Scan QR Code */}
          {currentStep === 2 && setupData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan QR Code</h2>
                <p className="text-gray-600">
                  Open your authenticator app and scan this QR code, or enter the manual key.
                </p>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center bg-gray-50 p-8 rounded-lg">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <img
                    src={setupData.qrCode}
                    alt="2FA QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* Manual Entry Option */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2 font-medium">Can't scan? Enter manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm font-mono">
                    {setupData.manualEntry}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setupData.manualEntry, "secret")}
                    className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedSecret && (
                  <p className="text-xs text-green-600 mt-1">✓ Copied to clipboard</p>
                )}
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
              >
                I've Scanned the Code
              </button>
            </div>
          )}

          {/* Step 3: Verify Code */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Setup</h2>
                <p className="text-gray-600">
                  Enter the 6-digit code from your authenticator app to verify everything is working.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setVerificationCode(value);
                  }}
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent tracking-widest"
                  placeholder="000000"
                />
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
              >
                {isLoading ? "Verifying..." : "Verify & Enable 2FA"}
              </button>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to QR Code
              </button>
            </div>
          )}

          {/* Step 4: Backup Codes */}
          {currentStep === 4 && setupData && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">2FA Enabled Successfully!</h2>
                <p className="text-gray-600">
                  Save your backup codes in a secure location. You'll need them if you lose access to your authenticator app.
                </p>
              </div>

              {/* Backup Codes */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Your Backup Codes
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded border border-gray-300">
                      <code className="text-sm font-mono">{code}</code>
                    </div>
                  ))}
                </div>
                <button
                  onClick={downloadBackupCodes}
                  className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Backup Codes
                </button>
                {backupCodesSaved && (
                  <p className="text-xs text-green-600 mt-2 text-center">✓ Backup codes downloaded</p>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Important:</strong> Store these codes in a safe place. Each code can only be used once. Without them, you may lose access to your account if you lose your phone.
                </p>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="backup-confirm"
                  checked={backupCodesSaved}
                  onChange={(e) => setBackupCodesSaved(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="backup-confirm" className="text-sm text-gray-700">
                  I have saved my backup codes in a secure location
                </label>
              </div>

              <button
                onClick={handleComplete}
                disabled={!backupCodesSaved}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Complete Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
