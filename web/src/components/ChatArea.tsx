import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
} from "../services/socket";

interface MessageFormMeta {
  username: string;
  userColor: string;
}

const MessageForm = ({ username, userColor }: MessageFormMeta) => {
  const [message, setMessage] = useState("");
  const [sendMessage] = useSendMessageMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage({ content: message, username: username, color: userColor });
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full">
        <input
          style={{ background: "rgba(0, 0, 0, 0.2)" }}
          className="w-72 h-8 p-2 text-white outline-none placeholder:text-white"
          onChange={handleChange}
          placeholder="Press enter to chat"
          value={message}
        />
      </div>
    </form>
  );
};

const ChatArea = ({ username }: { username: string }) => {
  // TODO: Error Handling
  const { data, isLoading } = useGetMessagesQuery();
  const [userColor] = React.useState(() => getRandomColor());

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <>
      <div className="max-w-xs flex flex-col">
        <div className="max-h-96 overflow-hidden">
          {data && !isLoading
            ? data.slice(-8).map((message, _) => (
                <li className="list-none" key={_}>
                  <div className="flex items-center leading-8">
                    <div>
                      <span
                        style={{ color: message.color }}
                        className="text-lg font-bold"
                      >
                        {message.username}
                      </span>
                    </div>
                    <div className="px-1">
                      <span className="font-bold text-gray-500">{`: ${message.content}`}</span>
                    </div>
                  </div>
                </li>
              ))
            : ""}
        </div>
        <MessageForm username={username} userColor={userColor} />
      </div>
    </>
  );
};

export default ChatArea;
