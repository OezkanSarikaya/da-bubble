import { Message } from "./message";
import { User } from "./user";

export interface Channel {
  id: string,
  name: string,
  description: string,
  createdBy: string,
  createdAt: Date,
  messageIDS: string[],
  members: string[],
  messages: Message[]
  membersData?: User[];
  creatorChannelData?: User 
}