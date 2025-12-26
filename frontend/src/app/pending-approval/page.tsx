"use client";
export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pending Approval</h1>
        <p className="text-gray-600 mb-6">
          Your account has been created successfully! An administrator will review and approve your account shortly.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left rounded">
          <p className="text-blue-700 text-sm">
            <strong>✓ Account created</strong><br />
            <strong>⏳ Awaiting admin approval</strong><br />
            <strong>📧 Email notification on approval</strong>
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          You will receive an email notification once your account is approved. This usually takes 1-2 business days.
        </p>
        <div className="space-y-3">
          <a href="/login" className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition">
            Back to Login
          </a>
          <a href="/contact" className="block w-full py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
