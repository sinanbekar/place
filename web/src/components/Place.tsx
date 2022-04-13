import React, { ChangeEvent, FormEvent } from "react";
import ChatArea from "./ChatArea";
import ColorPicker from "./ColorPicker";
import Modal from "./Modal";
import { useCanvas } from "../hooks/useCanvas";
import { ChatMetadata, getSocket } from "../services/socket";

export const Place = () => {
  const { cvs, isMapLoading, zoomIn, zoomOut } = useCanvas();

  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [activeUsers, setActiveUsers] = React.useState(0);

  const handleStart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username.length >= 3) {
      setOpen(false);
    } else {
      alert("minumum 3 characters are allowed"); // TODO
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  React.useEffect(() => {
    setOpen(!isMapLoading);
  }, [isMapLoading, setOpen]);

  React.useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(ChatMetadata.ACTIVE_USERS, (data: number) => {
      setActiveUsers(data);
    });
  }, []);

  return (
    <>
      <Modal showModal={open} setShowModal={setOpen}>
        <div className="w-full h-full relative">
          <div className="flex justify-center pb-8">
            <span className="text-lg text-black font-bold">r/place Clone</span>
          </div>
          <form onSubmit={handleStart}>
            <div className="flex flex-col gap-2">
              <input
                onChange={handleChange}
                className="bg-gray-200 p-2 border-2 border-gray-500 text-black rounded-md"
                placeholder="Nickname"
                value={username}
              />
              <button
                className="bg-blue-500 p-2 border-gray-500 rounded-md"
                placeholder="Nickname"
              >
                <span className="text-white font-bold">Start</span>
              </button>
            </div>
          </form>
          <div className="absolute w-full p-4 bottom-0 flex gap-2 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <a className="text-sm" href="https://github.com/sinanbekar">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </div>
              </a>
              <span className="font-thin text-sm">Sinan Bekar</span>
            </div>
          </div>
        </div>
      </Modal>

      <canvas
        style={{
          imageRendering: "pixelated",
          opacity: open ? 0.2 : 1, // TODO
        }}
        className="absolute top-0 left-0 w-screen h-screen bg-[#e0e0e0]"
        ref={cvs}
      />

      <div className="fixed w-full h-full left-0 pointer-events-none bg-none">
        {isMapLoading && (
          <div className="absolute flex h-screen items-center w-full justify-center">
            <span className="text-xl">Downloading Map...</span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <div className="flex pointer-events-auto">
            <ChatArea username={username} />
          </div>
          <div className="flex pointer-events-auto">
            <ColorPicker />
          </div>
        </div>
        <div className="absolute flex gap-x-2 right-4 bottom-4 pointer-events-auto">
          <button onClick={zoomOut} className="w-8 h-8 bg-gray-300 border-2">
            -
          </button>
          <button onClick={zoomIn} className="w-8 h-8 bg-gray-300 border-2">
            +
          </button>
        </div>
      </div>

      <div className="fixed right-0 pointer-events-none bg-none">
        <div className="p-4">
          <span className="font-semibold">Active Users: </span>
          <span className="font-bold">{activeUsers}</span>
        </div>
      </div>
    </>
  );
};
