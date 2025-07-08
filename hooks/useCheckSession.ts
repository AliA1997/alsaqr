import { User } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function useCheckSession(setter: Function, sessionUser: User | undefined) {
 const { data:session} = useSession();
 const pathname = usePathname();

 async function getSetSession() {
    const sessionInfo = await getSession();
    if (sessionInfo && sessionInfo.user && sessionUser?.email !== sessionInfo.user?.email) {
        setter(sessionInfo.user);
    } else {
        setter(undefined);
    }
 }

  useLayoutEffect(() => {
      getSetSession();
  }, [session, pathname]);

    return {};
}