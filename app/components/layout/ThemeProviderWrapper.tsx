"use client";
import { motion } from "framer-motion";
import { useCheckSession } from "hooks/useCheckSession";
import { ThemeProvider } from "next-themes";

function ThemeProviderWrapper({ children }: React.PropsWithChildren<any>) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="dark:bg-[#0e1517] h-screen overflow-hidden"
    >
      <ThemeProvider attribute="class">{children}</ThemeProvider>
    </motion.div>
  );
}

export default ThemeProviderWrapper;
