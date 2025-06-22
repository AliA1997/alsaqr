// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

type Data = {
    cookieInfo: any
};
async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
    // const cookieInfo = cookies();
    // console.log('cookieInfo:', cookieInfo);

  return NextResponse.json({ success: true })
}

export { GET };