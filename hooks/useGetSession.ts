import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


function useGetSession<T>(sideEffect: Function, authRequired: boolean = true) {
    const { data:session } = useSession();
    const [sideEffectData, setSideEffectData] = useState<T | undefined>(undefined);
    useEffect(
        () => {
            console.log("fetch data based on this session", session);
            console.log(`(session.user as any)["id"]`, (session?.user ?? {} as any)["id"]);
            
            if(session && session.user && authRequired) {
                console.log('session.user:', session.user);
                sideEffect((session.user as any)["id"])
                    .then((resultData: T) => setSideEffectData(resultData))
                    .catch((err: any) => console.log("get side effect data error:", err.message));
            }
            else if(!authRequired) {
                sideEffect()
                    .then((resultData: T) => setSideEffectData(resultData))
                    .catch((err: any) => console.log("get side effect data error:", err.message));
            }
        },
        [session]
    )

    return { result: sideEffectData };
}

export {useGetSession};