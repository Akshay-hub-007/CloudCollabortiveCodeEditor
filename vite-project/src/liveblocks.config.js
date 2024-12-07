import { useUser } from "@clerk/clerk-react";
import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import YLiveblocksProvider from "@liveblocks/yjs";
import { colors } from "./lib/colours";
// const userId=useUser();

// This file should not use hooks directly, since hooks can only be called inside React components
// The client creation and configuration should be done inside a component instead

// Define the client creation function (to be called in a component)
const createLiveblocksClient = (userId) => {
  // const { isLoaded,user}=useUser();

  // console.log(user.userId)
//  if(!userId)
//  {
//   throw new Error("User Id is not found")
//  }
console.log()
  return  createClient({
    authEndpoint: `https://cloudcollabortivecodeeditor-2xts.onrender.com/api/liveblocks/user_2mc9a4ENUW2GZjXZ2xhMDXYmnfS`, // Correct usage with template literals
  });
};

// const Presence = {};
// const Storage = {};
// const colors = {}; 
const UserMeta = {
  id: "",
  info: {
    name: "",
    email: "",
    color: Object.keys(colors)[0] || "defaultColor", 
  },
};
const RoomEvent = {};
const ThreadMetadata = {};

export const UserAwareness = {
  user: UserMeta.info,
};

export const AwarenessList = [
  [0, UserAwareness], // Example default list item
];

// Export the RoomProvider and hooks; you would call createLiveblocksClient within a component
export const {
  RoomProvider,
  useRoom,
  useSelf,
  useOthers,
  useMyPresence,
} = createRoomContext(createLiveblocksClient(UserMeta.id));

export const TypedLiveblocksProvider = YLiveblocksProvider;
