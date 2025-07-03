// app/template.tsx

"use client";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

function Template({ children }: { children: React.ReactNode }) {
  const { authStore } = useStore();
  const router = useRouter();
  useLayoutEffect(() => {
    getSession()
      .then(sessionInfo => {
        if (sessionInfo && sessionInfo.user) {
          authStore.setCurrentSessionUser(sessionInfo.user);
        } else {
          authStore.setCurrentSessionUser(undefined);
        }
      })
  }, [router]);
 
  return <>{children}</>;
}

export default observer(Template)