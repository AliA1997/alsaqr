// app/template.tsx

"use client";
import { observer } from "mobx-react-lite";
function Template({ children }: { children: React.ReactNode }) { 
  return <>{children}</>;
}

export default observer(Template)