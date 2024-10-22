import { createAction } from "@ngrx/store";

export const triggerPopUserProfile = createAction('[Pop User Profile] open/close');
export const showThreadComponent = createAction('[Thread Component] open');
export const hideThreadComponent = createAction('[Thread Component] close');