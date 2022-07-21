import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useSubscription } from "@apollo/client";

import {
  GET_ONLINE_USERS_SUBSCRIPTION,
  UPDATE_LASTSEEN_MUTATION,
} from "../Constants/Graphql";

import OnlineUser from "./OnlineUser";

const OnlineUsersWrapper = () => {
  const [onlineIndicator, setOnlineIndicator] = useState(0);
  let onlineUsersList;

  const [updateLastSeenMutation] = useMutation(UPDATE_LASTSEEN_MUTATION);
  const { loading, error, data } = useSubscription(
    GET_ONLINE_USERS_SUBSCRIPTION
  );

  const updateLastSeen = useCallback(() => {
    updateLastSeenMutation({ variables: { now: new Date().toISOString() } });
  }, [updateLastSeenMutation]);

  useEffect(() => {
    updateLastSeen();
    setOnlineIndicator(
      setInterval(() => {
        updateLastSeen();
      }, [20000])
    );

    return () => {
      clearInterval(onlineIndicator);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    console.log("error : ", error);
    return <span>{error.message}</span>;
  }

  if (data) {
    onlineUsersList = data.online_users.map(({ user }, index) => (
      <OnlineUser key={index} index={index} user={user} />
    ));
  }

  return (
    <div className="onlineUsersWrapper">
      <div className="sliderHeader">
        Online users - {onlineUsersList.length}
      </div>
      {onlineUsersList}
    </div>
  );
};

export default OnlineUsersWrapper;
