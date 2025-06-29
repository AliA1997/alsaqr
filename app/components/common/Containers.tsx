import { motion } from 'framer-motion';
import React from 'react';
import Image from 'next/image';

export const ContentContainerWithRef = React.forwardRef(({ children, classNames, ...otherProps }: React.PropsWithChildren<any>, ref) => {
  return (
    <div className={`max-w-xl mx-auto bg-white dark:bg-[#000000] shadow-md rounded-lg mt-10 ${classNames}`} {...otherProps}>
      {children}
    </div>    
  );
});

export function ContentContainer({ children, ...otherProps }: React.PropsWithChildren<any>) {
  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-[#000000] shadow-md rounded-lg mt-10" {...otherProps}>
      {children}
    </div>
  );
}

type ProfileImagePreviewProps = {
  avatar: string;
  username: string;
  bgThumbnail: string;
}

export function ProfileImagePreview({ username, bgThumbnail, avatar }:ProfileImagePreviewProps) {
  return (
    <motion.div 
        className="flex justify-center items-center bg-gray-100 w-full h-[10em] relative" 
        style={bgThumbnail ? { 
            backgroundImage: `url('${bgThumbnail}')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        } : {}}
    >
        <Image 
            className='h-20 w-20 bottom-10 rounded-full'
            src={avatar}
            alt={username}
            height={50}
            width={50}
        />
    </motion.div>
  );
}