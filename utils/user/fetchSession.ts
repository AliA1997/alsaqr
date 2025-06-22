// import { Comment } from "../../typings";

export const fetchSession = async () => {
  const res = await fetch(`/api/session`, { method: "GET" });

  const cookieInfo = await res.json();

  return cookieInfo;
};
