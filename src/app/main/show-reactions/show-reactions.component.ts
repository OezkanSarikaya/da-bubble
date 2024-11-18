import { Component, Input, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../interfaces/message';
import { Firestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { UserService } from '../../services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
// import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-show-reactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-reactions.component.html',
  styleUrl: './show-reactions.component.scss',
})
export class ShowReactionsComponent {
  @Input() reactions: any[] = [];
  @Input() msgID!: string; // Akzeptiere ein `Message`-Objekt statt eines Arrays
  currentUser: Signal<any> = signal<any>(null);
  constructor(private firestore: Firestore, private userService: UserService,) {
    this.currentUser = toSignal(this.userService.currentUser$);
  }


  async addReaction(reactionIcon: string, messageId: string, userId: string, userName: string) {

    // console.log('addReaction: ',messageId,reactionIcon,userId,userName);
    
    try {
      const messageDocRef = doc(this.firestore, 'messages', messageId);
      const messageSnapshot = await getDoc(messageDocRef);

      if (!messageSnapshot.exists()) {
        console.error(`Message with ID ${messageId} not found.`);
        return;
      }

      const messageData = messageSnapshot.data();
      const reactions = messageData['reactions'] || [];
      // console.log('reactions:::: '+reactions);
      

      // Check if the reaction type exists
      const reactionIndex = reactions.findIndex((r: any) => r.type === reactionIcon);

      if (reactionIndex === -1) {
        // Reaction type not found: Add new reaction
        const newReaction = {
          type: reactionIcon,
          users: [{ userId, userName }],
        };

        await updateDoc(messageDocRef, {
          reactions: arrayUnion(newReaction),
        });
      } else {
        // Reaction type exists: Check if the user has reacted
        const existingReaction = reactions[reactionIndex];
        const userIndex = existingReaction.users.findIndex((u: any) => u.userId === userId);

        if (userIndex === -1) {
          // User not found: Add user to the reaction
          existingReaction.users.push({ userId, userName });

          // Update the reactions array
          reactions[reactionIndex] = existingReaction;
          await updateDoc(messageDocRef, { reactions });
        } else {
          // User found: Remove the user from the reaction
          existingReaction.users = existingReaction.users.filter((u: any) => u.userId !== userId);

          if (existingReaction.users.length === 0) {
            // If no users remain, remove the reaction type entirely
            reactions.splice(reactionIndex, 1);
          } else {
            // Update the reactions array
            reactions[reactionIndex] = existingReaction;
          }

          await updateDoc(messageDocRef, { reactions });
        }
      }

      // console.log('Reaction updated successfully.');
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  }
}
