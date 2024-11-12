import { Message } from "./message";
import { User } from "./user";

export interface ThreadMessage {
  id: string;
  content: string;
  createdAt?: Date; // O el tipo de fecha que uses
  createdAtString: string;
  time: string,
  senderID: string,
  senderData: User
  threadIDS?: string[];
  threadData?: Message[];
  userName?: string; 
}