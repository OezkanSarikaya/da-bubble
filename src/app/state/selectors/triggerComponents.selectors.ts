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

export const showHideUserEditProfileHeaderSelector = createSelector(
  selectTriggerComponents,
  (state) => state.userProfileEditComponent
)

export const triggerChannelSelector = createSelector(
  selectTriggerComponents,
  (state) => state.channelComponent
)

export const triggerNewMessageSelector = createSelector(
  selectTriggerComponents,
  (state) => state.newMessage
)

export const selectSelectedChannelSelector = createSelector(
  selectTriggerComponents,
  (state) => state.selectedChannel
);