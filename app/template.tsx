// app/template.tsx

"use client";
// import { store } from "@stores/index";
import { observer } from "mobx-react-lite";

// store.authStore.initializeFromStorage()
//   .then(() => console.log("Store initialized"))
function Template({ children }: { children: React.ReactNode }) { 

  return <>{children}</>;
}

export default observer(Template)