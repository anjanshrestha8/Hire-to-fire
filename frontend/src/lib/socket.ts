// import { io } from "socket.io-client";
// export const socket = io("http://localhost:3000");

import io from "socket.io-client";
import { BASE_URL } from "@/constants/api.constant";

const token = localStorage.getItem("accessToken") || "";
export const socket = io(BASE_URL, {
  auth: { token },
});
