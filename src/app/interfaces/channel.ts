import { Message } from "./message";

export interface Channel {
  id: string,
  name: string,
  description: string,
  createdBy: string,
  createdAt: Date,
  messageIDS: string[],
  members: string[],
  messages: Message[]
}