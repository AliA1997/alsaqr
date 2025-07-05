import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from 'next/dynamic';
import { ModalLoader } from "./CustomLoader";
const CommonLink = dynamic(() => import("./Links").then(mod => mod.CommonLink), { ssr: false });
// import { CommonLink } from "./Links";
const NoRecordsTitle = dynamic(() => import("./Titles").then(mod => mod.NoRecordsTitle), { ssr: false });
// import { NoRecordsTitle } from "./Titles";
// import { ContentContainer } from "./Containers";
const ContentContainerWithRef = dynamic(() => import("../common/Containers").then(mod => mod.ContentContainerWithRef), { ssr: false });


type TabsProps = {
  tabs: {
    tabKey: string;
    title: string;
    content: any[];
    noRecordsContent: string;
    renderer: (obj: any) => React.ReactNode;
  }[];
  showNumberOfRecords?: boolean;
  loading: boolean;
};

function Tabs({ tabs, showNumberOfRecords, loading }: TabsProps) {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].tabKey);
  const tabLinks = useMemo(
    () =>
      tabs.map((t) => ({
        tabKey: t.tabKey,
        title: t.title,
        numberOfRecords: t.content.length,
      })),
    [tabs]
  );
  const tabContents = useMemo(
    () =>
      tabs.map((t) => ({
        tabKey: t.tabKey,
        content: t.content,
        renderer: t.renderer,
        noRecordsContent: t.noRecordsContent
      })),
    [tabs]
  );
  const handleTabSwitch = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);
  return (
    <ContentContainerWithRef
      classNames={`
          text-center overflow-y-auto scrollbar-hide
          min-h-[100vh] max-h-[100vh]
          lg:max-w-4xl 
        `}
      innerRef={containerRef}
    >
      <div className="flex justify-around">
        {tabLinks.map(
          (
            tl: { tabKey: string; title: string; numberOfRecords: number },
            tlIdx: number
          ) => (
            <CommonLink
              key={tlIdx}
              onClick={() => handleTabSwitch(tl.tabKey)}
              activeInd={activeTab === tl.tabKey}
              animatedLink={false}
            >
              {tl.title}

              {showNumberOfRecords && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs ml-2">
                  {tl.numberOfRecords}
                </span>
              )}
            </CommonLink>
          )
        )}
      </div>
      {tabContents.map(
        (
          tC: {
            tabKey: string;
            content: any[];
            renderer: (obj: any) => React.ReactNode;
            noRecordsContent: string;
          },
          tCIdx: number
        ) => (
          <div
            key={tCIdx}
            id={`${tC.tabKey}`}
            className={`tab-content p-6 ${activeTab === tC.tabKey ? "" : "hidden"
              }`}
          >

            {loading 
              ? <ModalLoader />
              : tC.content && tC.content.length ? (
                  tC.content.map(tC.renderer)
                ) : (
                  <NoRecordsTitle>{tC.noRecordsContent}</NoRecordsTitle>
                )
              }
          </div>
        )
      )}
    </ContentContainerWithRef>
  );
}

export default Tabs;
