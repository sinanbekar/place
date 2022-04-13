import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { io, Socket } from "socket.io-client";

enum ChatEvent {
  SEND_MESSAGE = "send_message",
  RECEIVE_MESSAGE = "receive_message",
}

export enum PixelEvent {
  SEND_PIXEL = "send_pixel",
  RECEIVE_PIXEL = "receive_pixel",
}

export enum ChatMetadata {
  ACTIVE_USERS = "active_users",
}

interface ChatMessage {
  content: string;
  username: string;
  color: string;
}

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_SOCKETIO_URL as string);
  }
  return socket;
};

export const socketApi = createApi({
  reducerPath: "socketApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_SOCKETIO_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    sendMessage: builder.mutation<ChatMessage, object>({
      queryFn: (chatMessageContent) => {
        const socket = getSocket();
        return new Promise((resolve) => {
          socket.emit(
            ChatEvent.SEND_MESSAGE,
            chatMessageContent,
            (message: ChatMessage) => {
              resolve({ data: message });
            }
          );
        });
      },
    }),

    sendByte: builder.mutation<Buffer, any>({
      queryFn: (b: Buffer) => {
        const socket = getSocket();
        return new Promise((resolve) => {
          socket.emit(PixelEvent.SEND_PIXEL, b, (b: Buffer) => {
            resolve({ data: b });
          });
        });
      },
    }),

    getMessages: builder.query<ChatMessage[], void>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        const socket = getSocket();

        try {
          await cacheDataLoaded;

          socket.on(ChatEvent.RECEIVE_MESSAGE, (message: ChatMessage) => {
            updateCachedData((draft) => {
              draft.push(message);
            });
          });

          await cacheEntryRemoved;

          socket.off(ChatEvent.RECEIVE_MESSAGE);
        } catch {
          // if cacheEntryRemoved resolved before cacheDataLoaded,
          // cacheDataLoaded throws
        }
      },
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useSendByteMutation,
} = socketApi;
