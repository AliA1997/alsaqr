import { SVGProps, useCallback, useState } from "react";
import { MoreButton } from "./IconButtons";
import { observer } from "mobx-react-lite";
import { CommonLink } from "./Links";
import { stopPropagationOnClick } from "@utils/neo4j";

type MoreSectionProps = {
    moreOptions: {
        onClick: Function;
        title: string;
        Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
    }[],
    moreOptionClassNames?: string;
}


interface MoreMenuOptionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  title: string;
  handleOnClick: Function;
  classNames?: string;
}


export const MoreMenuOption = observer(({
  Icon,
  classNames,
  title,
  handleOnClick,
}: MoreMenuOptionProps) => {

  return (
    <>
      <CommonLink classNames={classNames} animatedLink={false} onClick={handleOnClick!}>
        <Icon className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0" />
        <p className={`group-hover:text-maydan md:inline-flex text-base font-light`}>
          {title}
        </p>
      </CommonLink>
    </>
  );
})


function MoreSection({
    moreOptions,
    moreOptionClassNames
}: MoreSectionProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);


    const handleDropdownEnter = useCallback(
        () => setIsDropdownOpen(!isDropdownOpen),
        [isDropdownOpen]
    );

    return (
        <>
            <div className={`
                absolute top-0 right-0 pr-[1.1rem] mt-2 w-full flex justify-between 
                ${moreOptionClassNames ? moreOptionClassNames : ''}
            `}>
                <div />
                <MoreButton
                    onClick={e => stopPropagationOnClick(e, handleDropdownEnter)}
                    containerClassNames=""
                />
            </div>
            {isDropdownOpen && (
                <div className="absolute right-0 bottom-100 mt-2 w-48 rounded-md shadow-lg ring-1 bg-white dark:bg-[#000000] ring-black ring-opacity-5 z-40">
                    <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                    >
                        {moreOptions.map((moreOpt, moreOptIdx) => (
                            <MoreMenuOption
                                key={moreOptIdx}
                                handleOnClick={moreOpt.onClick}
                                Icon={moreOpt.Icon}
                                title={moreOpt.title}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default MoreSection;