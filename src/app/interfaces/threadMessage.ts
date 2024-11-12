import { Timestamp } from "@angular/fire/firestore";
import { Message } from "./message";
import { User } from "./user";

export interface ThreadMessage {
  id: string;
  content: string;
  createdAt: Date; 
  createdAtString: string;
  time: string,
  senderID: string,
  senderData: User
  threadIDS?: string[];
  threadData?: Message[];
}