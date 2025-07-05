import { motion } from 'framer-motion';
import React from 'react';
import Image from 'next/image';
import { User } from 'typings';

export const ContentContainerWithRef = React.forwardRef(({ innerRef, children, classNames, ...otherProps }: React.PropsWithChildren<any>, ref) => {
  return (
    <div 
      ref={innerRef}
    className={`max-w-xl mx-auto bg-white dark:bg-[#0e1517] shadow-md rounded-lg mt-10 ${classNames}`} {...otherProps}>
      {children}
    </div>    
  );
});

export function ContentContainer({ children, ...otherProps }: React.PropsWithChildren<any>) {
  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-[#0e1517] shadow-md rounded-lg mt-10" {...otherProps}>
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

type MessagesImagePreviewProps = {
  user: User;
  index: number;
};

export function MessagesImagePreview({user, index}: MessagesImagePreviewProps) {
  return (
    <img
      key={user.id}
      src={user.avatar}
      alt={user.username}
      className={`
        w-10 h-10 rounded-full border-2 border-white dark:border-gray-800
        relative  /* Enables z-index */
        ${index === 0 ? 'z-0' : index === 1 ? 'z-10' : 'z-20'}  /* Stacking order */`}
      style={{
        marginLeft: `${index > 0 ? '-1rem' : ''}`
      }}
    />
  );
}

export function InfoCardContainer({ children, classNames }: React.PropsWithChildren<any>){
  return (
    <div className={`
      relative flex flex-1 flex-col border-y border-gray-100 p-5 
      hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] 
      ${classNames && classNames}
    `}>
      {children}
    </div>
  );
}