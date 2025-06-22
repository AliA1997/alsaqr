export const fetchMessages = async (username: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${username}/messages`, { method: "GET" });
    if(!res.ok) {
      throw new Error("Error fetching messages");
    }
    
    const data = await res.json();
    const messages: any[] = data.messages;
    return messages;
  } catch(error)  {
    console.log("Error:", error);
  }
};
