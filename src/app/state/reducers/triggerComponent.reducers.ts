import { createReducer, on } from "@ngrx/store";
import { triggerPopUserProfile } from "../actions/triggerComponents.actions";

export const initalState:  {
  userProfilePopUp: boolean
} = {userProfilePopUp: false};


export const triggerComponentsReducer = createReducer(
  initalState,
  on(triggerPopUserProfile, (state)=> {
    return {...state, userProfilePopUp: !state.userProfilePopUp}
  })
);