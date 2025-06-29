"use client";
import React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";

type DarkSwitchProps = {};

const DarkSwitch: React.FC<DarkSwitchProps> = () => {
  const { setTheme, resolvedTheme, theme } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="group flex max-w-fit
      cursor-pointer items-center space-x-2 rounded-full px-2 py-1 mx-1 lg:px-6 my-1 md:mt-6 lg:py-3
      transition-all duration-200 hover:bg-maydan dark:bg-maydanDark bg-gray-50 dark:hover:opacity-50 dark:hover:text-maydan"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <SunIcon className="w-5 h-5 md:w-6 md:h-6" />
      ) : (
        <MoonIcon className="w-5 h-5 md:w-6 md:h-6" />
      )}

      <p className="hidden display-none md:display-initial dark:group-hover:text-maydan group-hover:text-black md:inline-flex text-base font-light">
        {resolvedTheme === "dark" ? "Light Mod" : "Dark Mod"}
      </p>
    </motion.div>
  );
};
export default DarkSwitch;
