import { User } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function useCheckSession( setState: Function, sessionUser: User | undefined) {
 const { data:session} = useSession();
 const pathname = usePathname();

 async function getSetSession() {
    const sessionInfo = await getSession();

    if (sessionInfo && sessionInfo.user) {
        setState(sessionInfo.user);
    } else {
        setState(undefined);
    }
 }

  useLayoutEffect(() => {
      getSetSession();
  }, [session?.user?.email]);

    return {};
}