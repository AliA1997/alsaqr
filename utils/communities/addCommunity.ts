import { CommunityRecord } from "typings";

export const addCommunity = async (
  newCommunity: CommunityRecord,
  userId: string
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/communities/${userId}`,
      {
        method: "POST",        
        body: JSON.stringify(newCommunity),
      }
    );
    if (!res.ok) {
      throw new Error("Error creating community");
    }

    return true;
  } catch (error) {
    console.log("Error:", error);
  }
};
