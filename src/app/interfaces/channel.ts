import { Message } from "../services/channel.service";

export interface Channel {
  id: string,
  name: string,
  description: string,
  createdBy: string,
  createdAt: Date,
  messageIDS: Message[],
  members: string[]
}