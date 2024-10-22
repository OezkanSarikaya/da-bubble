import { createSelector } from "@ngrx/store";

export const selectTriggerComponents =(state: any) => state.triggerComponents;

export const triggerUserProfilePopUpSelector = createSelector(
  selectTriggerComponents,
  (state) => state.userProfilePopUp
)