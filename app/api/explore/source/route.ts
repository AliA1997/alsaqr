// app/api/tweets/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ExploreNewsSourceToDisplay } from "typings";
import { extractQryParams } from "@utils/common";

async function GET(request: NextRequest) {
    const [currentPage, itemsPerPage] = extractQryParams(request, ['currentPage', 'itemsPerPage']);
    const currentPageParsed = parseInt(currentPage!);
    const itemsPerPageParsed = parseInt(itemsPerPage!);
    const { data: newSources } = await axios.get(`https://newsapi.org/v2/top-headlines/sources?sortBy=popularity&apiKey=${process.env.NEWSAPI_KEY}`);
    const { sources } = newSources;

    const startIndex = (currentPageParsed - 1) * itemsPerPageParsed;

    const result: ExploreNewsSourceToDisplay[] = sources
                                                    .slice(startIndex, startIndex + itemsPerPageParsed)
                                                    .map((a: any) => ({
                                                        id: a.id,
                                                        name: a.name,
                                                        category: a.category,
                                                        description: a.description.length > 75 ? `${a.description.substring(0, 75)}...` : a.description,
                                                        url: a.url,
                                                    }));

    return NextResponse.json({ exploreSources: result });
}


export { GET };
