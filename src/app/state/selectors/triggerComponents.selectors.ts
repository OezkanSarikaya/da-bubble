import { createSelector } from "@ngrx/store";

export const selectTriggerComponents =(state: any) => state.triggerComponents;

export const triggerUserProfilePopUpSelector = createSelector(
  selectTriggerComponents,
  (state) => state.userProfilePopUp
)

export const showHideThreadSelector = createSelector(
  selectTriggerComponents,
  (state) => state.threadComponent
)

export const triggerChanelSelector = createSelector(
  selectTriggerComponents,
  (state) => state.chanelComponent
)

export const triggerNewMessage = createSelector(
  selectTriggerComponents,
  (state) => state.newMessage
)