
const url = "http://localhost:3120/";

export const userDetailsFetch = async (id) => {
  const mainURL = url + `user/${id}`;
  const fetchingresults = await fetch(mainURL);
  const resultsJSON = await fetchingresults.json();
  if (resultsJSON.success) {
    return resultsJSON.results;
  } else {
    return resultsJSON.results;
  }
};

export const usersListFetch = async () => {
  const mainURL = url + `users`;
  const fetchingresults = await fetch(mainURL);
  const resultsJSON = await fetchingresults.json();
  if (resultsJSON.success) {
    return resultsJSON.results;
  } else {
    return resultsJSON.results;
  }
};

export const userMessageFetch = async (type, id, person_id) => {
  const mainURL = url + `messages/${type}/${id}/${person_id}`;
  const fetchingresults = await fetch(mainURL);
  const resultsJSON = await fetchingresults.json();
  if (resultsJSON.success) {
    return resultsJSON;
  } else {
    return resultsJSON;
  }
};

export const createSendMessagePOST = async (type, messageValues) => {
  const mainURL = url + `${type}`;
  const fetchingresults = await fetch(mainURL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ values: messageValues }),
  });
    const resultsJSON = await fetchingresults.json();
  if (resultsJSON.success) {
    return resultsJSON
  } else {
    return resultsJSON
  }
};


export const messageAction = async (friend_id, friend_name, activeUserID, socket) => {

    
    const values = await userMessageFetch(activeUserID, friend_id);

    if (values.success) {
      const lastMessageId = Number(values.results?.length - 1);
      const messages_id = values.results[lastMessageId]?.messages_id;
      const joinChat = await socket.emit("start_chat", messages_id);
      if (joinChat.connected) {
        window.location.href = (`/chat/${(friend_name).replace(/\s/g, "")}/${activeUserID}/${friend_id}`);
        console.log(joinChat.connected);
      }
    } else {
      const postValues = [
        {
          user_id: activeUserID,
          forward_to: friend_id,
          //   message: "started",
        },
      ];
      const postMethod = await createSendMessagePOST("messages", postValues);
      const joinChat = await socket.emit("start_chat", postMethod.messages_id);

      if (joinChat.connected) {
        window.location.href = (`/chat/${(friend_name).replace(/\s/g, "")}/${activeUserID}/${friend_id}`);
      }
    }
  };