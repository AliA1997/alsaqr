import React from 'react';

export const ContentContainerWithRef = React.forwardRef(({ children, ...otherProps }: React.PropsWithChildren<any>, ref) => {
  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-[#000000] shadow-md rounded-lg mt-10" {...otherProps}>
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