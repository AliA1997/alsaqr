import { useCallback, useMemo, useState } from "react";
import { CommonLink } from "./Links";
import { NoRecordsTitle } from "./Titles";
import { ContentContainer } from "./Containers";

type TabsProps = {
  tabs: {
    tabKey: string;
    title: string;
    content: any[];
    noRecordsContent: string;
    renderer: (obj: any) => React.ReactNode;
  }[];
  showNumberOfRecords?: boolean;
};

function Tabs({ tabs, showNumberOfRecords }: TabsProps) {
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
    <ContentContainer>
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
            className={`tab-content p-6 ${
              activeTab === tC.tabKey ? "" : "hidden"
            }`}
          >
            {/* <h1>Test</h1> */}
            {tC.content && tC.content.length ? (
              tC.content.map(tC.renderer)
            ) : (
              <NoRecordsTitle>{tC.noRecordsContent}</NoRecordsTitle>
            )}
          </div>
        )
      )}
    </ContentContainer>
  );
}

export default Tabs;
