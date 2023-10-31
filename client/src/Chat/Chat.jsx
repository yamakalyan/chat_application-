import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createSendMessagePOST, userMessageFetch } from "../helpers/Helper";

const Chat = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [sendMessage, setSendMessage] = useState("");

  const params = useParams();
  const navigator = useNavigate();

  const handleBack = () => {
    navigator(-1);
  };
  const fetchingUserMessages = async () => {
    const values = await userMessageFetch(
      params.type,
      params.user_id,
      params.forward_id
    );
    await socket.emit("start_chat", values.results[0].messages_id);
    setMessages(values.results);
  };

  const handleMessage = async (e) => {
    e.preventDefault();

    const messageDetails = {
      id: messages[0]?.messages_id,
      sent_by: params.type,
      user_id: params.user_id,
      forward_to: params.forward_id,
      message: sendMessage,
    };

    const sendMessageTOSocket = await socket.emit(
      "send_message",
      messageDetails
    );
    if (sendMessageTOSocket.connected) {
      const postValues = [
        {
          user_id: params.user_id,
          forward_to: params.forward_id,
          message: sendMessage,
        },
      ];
      const createSendMessageDB = await createSendMessagePOST(
        "messages",
        postValues
      );

      if (createSendMessageDB) {
        setSendMessage("");
        return await fetchingUserMessages();
      }
    }
  };

  const onSendReceiveMessages = async () => {
    await socket.on("receive_message", (data) => {
      if (data) {
        return fetchingUserMessages();
      }
      //   return setMessages((list) => [...list, data]);
    });
  };
  useEffect(() => {
    fetchingUserMessages();
    onSendReceiveMessages();
  }, []);

  return (
    <div className="py-5 my-5">
      <div className="container">
        <div className="row">
          <div className="col-6 mx-auto">
            <div className="shadow border border-2 py-4 bg-success rounded-5">
              <div>
                <button onClick={handleBack} className="btn btn-sm btn-primary">
                  Back to chatting lists
                </button>
              </div>
              <div className="headings my-3 mb-5">
                <h3 className="text-light">
                  Started chatting with {params.user}
                </h3>
              </div>
              <div className="parent d-flex justify-content-center flex-column">
                <div className="row">
                  <div className="col-md-10 mx-auto">
                    <div
                      style={{
                        height: "50vh",
                        overflow: "scroll",
                        overflowX: "hidden",
                      }}
                      className="bg-light"
                    >
                      {messages?.length === 0 ||
                      messages === undefined ||
                      null ? (
                        <p>No messages</p>
                      ) : (
                        messages?.map((msg, id) => {
                          return (
                            <div key={id}>
                              <h4
                                className={
                                  msg.user_id === params.user_id
                                    ? "bg-success pe-4 py-2 text-light"
                                    : "bg-dark pe-4 py-2 text-light"
                                }
                              >
                                {msg.message}
                                <small
                                  style={{ fontSize: "10px" }}
                                  className="my-auto ms-3"
                                >
                                  send by : {msg.user_id}
                                </small>
                              </h4>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <form onSubmit={handleMessage}>
                      <div className="row py-4">
                        <div className="col">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter message"
                            required
                            value={sendMessage}
                            onChange={(e) => setSendMessage(e.target.value)}
                          />
                        </div>
                        <div className="col-3">
                          <button className="btn btn-primary" type="submit">
                            Send
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
