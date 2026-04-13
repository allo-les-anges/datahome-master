// src/app/admin/agencies/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgencyDashboard from "@/components/admin/AgencyDashboard";

export default function AgenciesPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const savedSecret = sessionStorage.getItem('admin_secret');
      
      if (!savedSecret) {
        router.push('/admin');
        return;
      }
      
      try {
        const res = await fetch('/api/admin/check', {
          headers: {
            'x-admin-secret': savedSecret
          }
        });
        
        if (res.ok) {
          setIsAuthorized(true);
        } else {
          sessionStorage.removeItem('admin_auth');
          sessionStorage.removeItem('admin_secret');
          router.push('/admin');
        }
      } catch (err) {
        router.push('/admin');
      }
    };
    
    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-500">Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4">
      <AgencyDashboard />
    </main>
  );
}