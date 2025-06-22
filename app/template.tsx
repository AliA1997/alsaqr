// app/template.tsx

"use client";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const unprotectedRoutes = ['/', '/explore', '/search'];

  useEffect(() => {
    // if(!(session && session.user) && !unprotectedRoutes.some(unR => unR === pathname)) {
    //   dispatch(toggleLoginModal(true));
    //   redirect('/');
    // }
  }, [session])
 
  return <>{children}</>;
}
