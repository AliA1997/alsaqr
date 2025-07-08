// app/api/tweets/[tweet_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { defineDriver, read } from "@utils/neo4j/neo4j";
import { ExploreToDisplay, ProfileUser } from "typings";
import axios from "axios";
import { extractQryParams } from "@utils/common";

async function GET(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
) {
  const [currentPage, itemsPerPage] = extractQryParams(request, ['currentPage', 'itemsPerPage']);
  const currentPageParsed = parseInt(currentPage!);
  const itemsPerPageParsed = parseInt(itemsPerPage!);
  const { sourceId } = params;

  const { data: recentNewsFromSource } = await axios.get(`https://newsapi.org/v2/top-headlines?sources=${sourceId}&sortBy=popularity&apiKey=${process.env.NEWSAPI_KEY}`);
  const { articles } = recentNewsFromSource;

  const startIndex = (currentPageParsed - 1) * itemsPerPageParsed;

  const result: ExploreToDisplay[] = articles
                                        .filter((a: any) => a.urlToImage)
                                        .slice(startIndex, startIndex + itemsPerPageParsed)
                                        .map((a: any) => ({
                                            title: a.title.length > 75 ? `${a.title.substring(0, 75)}...` : a.title,
                                            url: a.url,
                                            urlToImage: a.urlToImage
                                        }));

    // console.log('result:', result);
    return NextResponse.json({ exploreForSource: result });
}

export { GET };