export const dynamic = 'force-dynamic';
import { CommunityToDisplay } from "../../typings";
import axios from "axios";

export const fetchCommunities = async (userId: string, params?: URLSearchParams) => {
  if(process.env.NEXT_PUBLIC_RUN_MODE === "building") {
    return [] as CommunityToDisplay[];
  }
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/communities/${userId}`, { params });

    if(!(res.status === 200)) {
      throw new Error("Error fetching lists");
    }
    
    const { data } = await res;
    const communities: CommunityToDisplay[] = data.communities;

    return communities;
  } catch(error)  {
    console.log("Error:", error);
  }
};
