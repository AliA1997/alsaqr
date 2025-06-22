"use client";
import { useRouter } from "next/navigation";
import React, { SVGProps, useMemo } from "react";
import { nonRoutableTitles } from "@utils/neo4j/index";
import { signOut } from "next-auth/react";
import { CommonLink, CommonLinkProps } from "./common/Links";

interface SidebarRowProps {
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  title: string;
  isShow?: boolean;
  href?: string;
  onClick?: Function;
  classNames?: string;
}

const SIGN_OUT_TITLE = "Sign Out";
const SIGN_IN_TITLE = "Sign In";
const MORE_TITLE = "More";

function SidebarRow({
  Icon,
  title,
  onClick,
  classNames,
  href,
}: SidebarRowProps) {
  const router = useRouter();
  
  const sidebarOnClick = async (e: React.MouseEvent) => {
    if (!nonRoutableTitles.includes(title)) router.push(href!);
    else {
      if (title === SIGN_IN_TITLE || title === MORE_TITLE) onClick!(e);
      if (title === SIGN_OUT_TITLE) await signOut();
    }
  };

  const commonLinkProps: CommonLinkProps = {
    onClick: sidebarOnClick,
    animatedLink: title === SIGN_IN_TITLE,
  };
  const showText = useMemo(() => [SIGN_IN_TITLE, SIGN_OUT_TITLE].some((showTextTitle: string) => showTextTitle == title), [title]);

  return (
    <>
      <CommonLink {...commonLinkProps}>
        <Icon className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0" />
        <p className={`${showText ? '' : 'hidden'} group-hover:text-maydan md:inline-flex text-base font-light`}>
          {title}
        </p>
      </CommonLink>
    </>
  );
}

export default SidebarRow;
