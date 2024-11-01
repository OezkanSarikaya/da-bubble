export interface Channel {
  id: string,
  name: string,
  description: string,
  createdBy: string,
  createdAt: Date,
  messageIds: string[],
  members: string[]
}