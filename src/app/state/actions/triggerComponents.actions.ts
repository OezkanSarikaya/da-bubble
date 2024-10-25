import { createAction } from "@ngrx/store";

export const triggerPopUserProfile = createAction('[Pop User Profile] open/close');
export const showThreadComponent = createAction('[Thread Component] open');
export const hideThreadComponent = createAction('[Thread Component] close');
export const hideUserProfile = createAction('[User Profile/Edit Header Component] open/close');
export const isNewMessage = createAction('[Thread Component] open/close');
export const triggerChanelComponent = createAction('[Chanel Component] open/close');
