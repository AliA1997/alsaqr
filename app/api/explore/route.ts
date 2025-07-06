// app/api/tweets/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ExploreToDisplay } from "typings";
import { extractQryParams } from "@utils/common";
import { PaginatedResult } from "models/common";

async function GET(request: NextRequest) {
    const [country, currentPage, itemsPerPage] = extractQryParams(request, ['country', 'currentPage', 'itemsPerPage']);
    const currentPageParsed = parseInt(currentPage!);
    const itemsPerPageParsed = parseInt(itemsPerPage!);
    const countryParam = country ?? 'us';


    const { data: recentNews } = await axios.get(`https://newsapi.org/v2/top-headlines?country=${countryParam}&sortBy=popularity&apiKey=${process.env.NEWSAPI_KEY}`);
    const { articles } = recentNews;

    const startIndex = (currentPageParsed - 1) * itemsPerPageParsed;

    const totalArticles = (articles ?? []).length;
    console.log('totalArticles:', totalArticles)
    console.log('startIndex', startIndex)
    const result: ExploreToDisplay[] = articles
                                        .filter((a: any) => a.urlToImage)
                                        .slice(startIndex, startIndex + itemsPerPageParsed)
                                        .map((a: any) => ({
                                            title: a.title.length > 75 ? `${a.title.substring(0, 75)}...` : a.title,
                                            url: a.url,
                                            urlToImage: a.urlToImage
                                        }));
    const pagination = {
      itemsPerPage: itemsPerPageParsed,
      currentPage: currentPageParsed, 
      totalItems: totalArticles,
      totalPages: totalArticles / itemsPerPageParsed
    };
    return NextResponse.json({ 
        result: new PaginatedResult(result, pagination)
     });
}


export { GET };
