import { createReducer, on } from "@ngrx/store";
import { hideThreadComponent, showThreadComponent, triggerPopUserProfile,  } from "../actions/triggerComponents.actions";

export const initalState:  {
  userProfilePopUp: boolean,
  threadComponent: boolean
} = {userProfilePopUp: false,
    threadComponent: false
};


export const triggerComponentsReducer = createReducer(
  initalState,
  on(triggerPopUserProfile, (state)=> {
    return {...state, userProfilePopUp: !state.userProfilePopUp}
  }),
  on(showThreadComponent, (state)=>{
    return {...state, threadComponent: true}
  }),
  on(hideThreadComponent, (state)=>{
    return {...state, threadComponent: false}
  })
);