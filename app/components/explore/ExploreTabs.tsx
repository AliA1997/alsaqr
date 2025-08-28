import Tabs from "@components/common/Tabs";
import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import { PagingParams } from "models/common";
import { useCallback, useEffect, useState } from "react";
import { ExploreTabs, ExploreToDisplay } from "typings.d";
import ExploreItemComponent from "./ExploreItem";
import { EXPLORE_SOURCES } from "@utils/constants";


export default observer(() => {
    const { exploreStore } = useStore();
    const {
        loadingInitial,
        setPagingParams,
        exploreNews,
        loadExploreNews,
        ajNews,
        loadAjNews,
        argaamNews,
        loadArgaamNews,
        bleacherReportNews,
        loadBleacherReportNews,
        cryptoCoinNews,
        loadCryptoCoinNews,
        hackerNews,
        loadHackerNews,
        sabqNews,
        loadSabqNews
    } = exploreStore;
    const [currentTab, setCurrentTab] = useState<ExploreTabs>(ExploreTabs.Popular)

    useEffect(() => {
        if (!exploreNews.length)
            loadExploreNews();
    }, []);

    useEffect(() => {
        if (currentTab != ExploreTabs.Popular)
            setPagingParams(new PagingParams(1, 40));
    }, [currentTab])

    const renderer = useCallback(
        (exploreNewsItem: ExploreToDisplay) => (
            <ExploreItemComponent key={exploreNewsItem.title} exploreItem={exploreNewsItem} />
        ),
        [
            exploreNews,
            ajNews,
            argaamNews,
            bleacherReportNews,
            cryptoCoinNews,
            hackerNews,
            sabqNews
        ]
    );

    const loadOnTabSwitch = useCallback(
        async (tabToLoadFor: string) => {
            if (tabToLoadFor === ExploreTabs.AlJazeeraEnglish)
                await loadAjNews();
            else if (tabToLoadFor === ExploreTabs.Argaam)
                await loadArgaamNews();
            else if (tabToLoadFor === ExploreTabs.BleacherReport)
                await loadBleacherReportNews();
            else if (tabToLoadFor === ExploreTabs.CryptoCoinsNews)
                await loadCryptoCoinNews();
            else if (tabToLoadFor === ExploreTabs.SABQ)
                await loadSabqNews();
            else
                await loadExploreNews();

            setPagingParams(new PagingParams(1, 40));
        }, [
        exploreNews,
        ajNews,
        argaamNews,
        bleacherReportNews,
        cryptoCoinNews,
        sabqNews
    ]
    );

    const getNewsContent = (srcId?: string) => {
        if (srcId === ExploreTabs.AlJazeeraEnglish)
            return ajNews;
        else if (srcId === ExploreTabs.Argaam)
            return argaamNews;
        else if (srcId === ExploreTabs.BleacherReport)
            return bleacherReportNews;
        else if (srcId === ExploreTabs.CryptoCoinsNews)
            return cryptoCoinNews;
        else if (srcId === ExploreTabs.SABQ)
            return sabqNews;

        return exploreNews;
    }

    return (
        <Tabs
            tabs={[
                {
                    tabKey: ExploreTabs.Popular.toString(),
                    title: "Popular",
                    content: getNewsContent(),
                    renderer,
                    noRecordsContent: 'No explore news to show.'
                },
                ...EXPLORE_SOURCES.map(src => ({
                    tabKey: src.id as ExploreTabs,
                    title: src.name,
                    image: src.image,
                    content: getNewsContent(src.id),
                    renderer,
                    noRecordsContent: 'No news to show.'
                })),
            ]}
            loading={loadingInitial}
            loadOnTabSwitch={loadOnTabSwitch}
            containerClassNames="flex flex-wrap mb-3  flex-1"
        />
    );
});