export const joinCommunity = async (communityId: string, userId: string, joined: boolean) => {
    try {
      console.log('userId:', userId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/communities/${communityId}/joined`, { method: "PATCH", body: JSON.stringify({
          userId,
          joined
      }) });
      if(!res.ok) {
        throw new Error("Error trying to join community with an id of: " + communityId);
      }
      
      return true;
    } catch(error)  {
      console.log("Error:", error);
    }
  };
  