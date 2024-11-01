export interface Channel {
  name: string,
  description: string,
  createdBy: string,
  createdAt: Date,
  messageIds: string[],
  members: string[]
}