import React from "react";
// import { motion } from "framer-motion";
import dynamic from "next/dynamic";
const MainProfile = dynamic(() => import('@components/userProfile/MainProfile'), { ssr: false });

const UserProfile = async () => {
  return (
    <MainProfile />
  );
  // return (
  //   <motion.div
  //     initial={{ opacity: 0 }}
  //     whileInView={{ opacity: 1 }}
  //     viewport={{ once: true }}
  //     className="dark:bg-[#000000] h-screen overflow-hidden"
  //   >
  //     <MainProfile />
  //   </motion.div>
  // );
};

export default UserProfile;
