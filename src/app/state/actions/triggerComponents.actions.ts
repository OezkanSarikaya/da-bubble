import { createAction } from "@ngrx/store";

export const triggerPopUserProfile = createAction('[Pop User Profile] open/close');
export const showThreadComponent = createAction('[Thread Component] open');
export const hideThreadComponent = createAction('[Thread Component] close');
export const hideUserProfile = createAction('[User Profile/Edit Header Component] open/close');
export const showNewMessage = createAction('[New Message] open');
export const hideNewMessage = createAction('[New Message] close');
export const showChannelComponent = createAction('[Channel Component] open');
export const hideChannelComponent = createAction('[Channel Component] close');
