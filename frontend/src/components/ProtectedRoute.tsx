"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export default function ProtectedRoute({ children, requiredRole, requiredFeature }: any) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      if (requiredRole && !authService.hasRole(requiredRole)) {
        router.push("/unauthorized");
        return;
      }

      if (requiredFeature) {
        try {
          const { permissions } = await authService.getPermissions();
          if (!authService.hasFeature(requiredFeature, permissions)) {
            router.push("/unauthorized");
            return;
          }
        } catch (error) {
          router.push("/login");
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [requiredRole, requiredFeature, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
