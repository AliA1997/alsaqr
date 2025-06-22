"use client";
import { SessionProvider } from "next-auth/react";
export default SessionProvider;
// interface SessionProviderWrapperProps {}
// function SessionProviderWrapper({
//   children,
// }: React.PropsWithChildren<SessionProviderWrapperProps>) {
//   return (
//     <SessionProvider
//       basePath="/"
//       refetchInterval={5 * 60}
//       refetchWhenOffline={false}
//     >
//       {children}
//     </SessionProvider>
//   );
// }

// export default SessionProviderWrapper;