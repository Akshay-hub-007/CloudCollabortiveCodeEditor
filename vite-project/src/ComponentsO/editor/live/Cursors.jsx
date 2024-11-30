// import { colors } from "@/lib/colors";
import {
  AwarenessList,
  TypedLiveblocksProvider,
  UserAwareness,
  useSelf,
} from "../../../liveblocks.config";
import { useEffect, useMemo, useState } from "react";
import "../../../index.css"
import { colors } from "../../../lib/colours";
export function Cursors({ yProvider }) {
  const userInfo = useSelf((me) => me.info);

  const [awarenessUsers, setAwarenessUsers] = useState([]);

  useEffect(() => {
    const localUser = userInfo;
    yProvider.awareness.setLocalStateField("user", localUser);

    function setUsers() {
      setAwarenessUsers(Array.from(yProvider.awareness.getStates()));
    }

    yProvider.awareness.on("change", setUsers);
    setUsers();

    return () => {
      yProvider.awareness.off("change", setUsers);
    };
  }, [yProvider]);

  const styleSheet = useMemo(() => {
    let cursorStyles = "";

    for (const [clientId, client] of awarenessUsers) {
      if (client?.user) {
        cursorStyles += `
                .yRemoteSelection-${clientId},
                .yRemoteSelectionHead-${clientId} {
                --user-color: ${colors[client.user.color]};
                }

                .yRemoteSelectionHead-${clientId}::after {
                content: "${client.user.name}";
                }
            `;
      }
    }

    return { __html: cursorStyles };
  }, [awarenessUsers]);

  return <style dangerouslySetInnerHTML={styleSheet} />;
}
