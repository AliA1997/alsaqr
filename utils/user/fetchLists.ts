export const fetchLists = async (username: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${username}/lists`, { method: "GET" });
    if(!res.ok) {
      throw new Error("Error fetching messages");
    }
    
    const data = await res.json();
    const lists: any[] = data.lists;
    return lists;
  } catch(error)  {
    console.log("Error:", error);
  }
};
