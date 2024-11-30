import { RoomProvider } from "../../../liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";

function Room({ id, children }) {
  console.log(id)
  return (
    <RoomProvider 
      id={id} 
      initialPresence={{
        cursor: null,
        info: {
          name: null,
          color: null
        }
      }}
    >
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
export default Room