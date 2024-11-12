import { User } from "./user";

export interface Message {
  content: string,
  senderID: string,
  createdAt: Date,
  threadIDS: string[],
  id: string,
  senderData?: User,
  createAtString?: string,
  time?: string
}