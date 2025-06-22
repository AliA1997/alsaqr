import {  ProfileUser } from "../../typings";

export const fetchUserInfo = async (name: string) => {
  try {
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${name}`, { method: "GET" });
    if(!res.ok) {
      throw new Error("Error fetching a tweets for  " + name);
    }
    
    const data = await res.json();
    const user: ProfileUser = data.user;
    return user;
  } catch(error)  {
    console.log("Error:", error);
  }
};
