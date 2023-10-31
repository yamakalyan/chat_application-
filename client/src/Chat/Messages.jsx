import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createSendMessagePOST,
  userDetailsFetch,
  userMessageFetch,
} from "../helpers/Helper";

const Messages = ({ socket }) => {
  const [currentUser, setrCurrentuser] = useState([]);
  const [activeUserID, setActiveUserID] = useState("");
  const params = useParams();
  const navigator = useNavigate();

  const handleBack = () => {
    navigator(-1);
  };

  useEffect(() => {
    const fetchingUsers = async () => {
      const values = await userDetailsFetch(params.name);
      setrCurrentuser(values);
      setActiveUserID(values[0].user_id);
    };
    fetchingUsers();
  }, []);

  const handleChatAction = async (type, id, name) => {
    const values = await userMessageFetch(type, activeUserID, id);

    if (values.success) {
      const messages_id = values.results[0]?.messages_id;
      const joinChat = await socket.emit("start_chat", messages_id);

      if (joinChat.connected) {
        navigator(
          `/chat/${type}/${name.replace(/\s/g, "")}/${activeUserID}/${id}`
        );
      }
    } else {
      const postValues = [
        {
          user_id: activeUserID,
          forward_to: id,
          message: `Started by ${activeUserID}`,
        },
      ];
      const postMethod = await createSendMessagePOST("messages", postValues);
      const joinChat = await socket.emit("start_chat", postMethod.messages_id);

      if (joinChat.connected) {
        navigator(
          `/chat/${type}/${name.replace(/\s/g, "")}/${activeUserID}/${id}`
        );
      }
    }
  };

  const mappingFriends = currentUser[0]?.friends.map((user, id) => {
    return (
      <tr key={id}>
        <th>
          <Link
            onClick={() =>
              handleChatAction("user", user.user_id, user.user_name)
            }
            className="text-dark fw-bold"
          >
            {user.user_name}
          </Link>
        </th>
      </tr>
    );
  });

  const mappingGroups = currentUser[0]?.groups.map((group, id) => {
    return (
      <tr key={id}>
        <th>
          <Link
            onClick={() =>
              handleChatAction("group", group.group_id, group.group_name)
            }
            className="text-dark fw-bold"
          >
            {group.group_name}
          </Link>
        </th>
      </tr>
    );
  });

  return (
    <div className="py-5 my-5">
      <div className="container">
        <div className="row">
          <div className="col-6 mx-auto">
            <div className="shadow border border-2 py-4 bg-success rounded-5">
              <div>
                <button onClick={handleBack} className="btn btn-sm btn-primary">
                  switch character
                </button>
              </div>
              <div className="headings my-3 mb-5">
                <h3 className="text-light">
                  {currentUser[0]?.user_name} messages
                </h3>
              </div>
              <div className="px-5 ">
                <table
                  className="table table-hover table-primary"
                  style={{ background: "transparent" }}
                >
                  <thead>
                    <tr>
                      <th>Friends & Groups</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappingFriends}
                    {mappingGroups}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
