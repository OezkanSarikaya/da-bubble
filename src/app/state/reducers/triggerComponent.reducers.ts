import { createReducer, on } from "@ngrx/store";
import { hideThreadComponent, isNewMessage, showThreadComponent, triggerChanelComponent, triggerPopUserProfile,  } from "../actions/triggerComponents.actions";

export const initalState:  {
  userProfilePopUp: boolean,
  threadComponent: boolean,
  chanelComponent: boolean
  newMessage: boolean
} = {userProfilePopUp: false,
    threadComponent: false,
    chanelComponent: false,
    newMessage: false
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
  }),
  on(triggerChanelComponent, (state)=>{
    return {...state, newMessage: !state.chanelComponent}
  }),
  on(isNewMessage, (state)=>{
    return {...state, newMessage: !state.newMessage}
  })
);