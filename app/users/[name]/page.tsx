
import React from "react";
// import { motion } from "framer-motion";
import dynamic from "next/dynamic";
const MainProfile = dynamic(() => import('@components/userProfile/MainProfile'), { ssr: false });

const UserProfile = async () => {
  return (
    <MainProfile />
  );
};

export default UserProfile;
