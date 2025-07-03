import { useEffect, useRef } from "react";

export function useGetMounted() {
    const isMounted = useRef(false);
    
    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    return {
        isMounted
    };
}