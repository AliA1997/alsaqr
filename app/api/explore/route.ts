// app/api/tweets/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ExploreToDisplay } from "typings";
import { extractQryParams } from "@utils/common";

async function GET(request: NextRequest) {
    const [country, currentPage, itemsPerPage] = extractQryParams(request, ['country', 'currentPage', 'itemsPerPage']);

    const { data: recentNews } = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country}&sortBy=popularity&apiKey=${process.env.NEWSAPI_KEY}`);
    const { articles } = recentNews;

    const startIndex = (+currentPage - 1) * +itemsPerPage;

    const result: ExploreToDisplay[] = articles
                                        .filter((a: any) => a.urlToImage)
                                        .slice(startIndex, startIndex + itemsPerPage)
                                        .map((a: any) => ({
                                            title: a.title.length > 75 ? `${a.title.substring(0, 75)}...` : a.title,
                                            url: a.url,
                                            urlToImage: a.urlToImage
                                        }));

    // console.log('result:', result);
    return NextResponse.json({ explore: result });
}


export { GET };
