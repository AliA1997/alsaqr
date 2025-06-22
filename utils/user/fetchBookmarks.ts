import { PostToDisplay } from "../../typings";

export const fetchBookmarks = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookmarks/${id}`, { method: "GET" });
    if(!res.ok) {
      throw new Error("Error fetching bookmarks");
    }
    
    const data = await res.json();
    const bookmarks: any[] = data.bookmarks;
    return bookmarks;
  } catch(error)  {
    console.log("Error:", error);
  }
};
