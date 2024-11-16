export interface Reaction {
  type: string; // Typ der Reaktion, z. B. "like", "love", "laugh"
  users: UserReaction[]; // Liste der Benutzer, die diese Reaktion hinzugefügt haben
}

export interface UserReaction {
  userId: string; // Die ID des Benutzers
  userName: string; // Der Name des Benutzers
}
