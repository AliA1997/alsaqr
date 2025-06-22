export const fetchNotifications = async (username: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${username}/notifications`, { method: "GET" });
      if(!res.ok) {
        throw new Error("Error fetching notifications");
      }
      
      const data = await res.json();
      const notifications: any[] = data.notifications;
      return notifications;
    } catch(error)  {
      console.log("Error:", error);
    }
  };
  