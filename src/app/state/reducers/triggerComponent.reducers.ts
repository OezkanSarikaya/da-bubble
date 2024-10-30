import { createReducer, on } from "@ngrx/store";
import { hideThreadComponent, hideUserProfile, showNewMessage, hideNewMessage, showThreadComponent, showChannelComponent, triggerPopUserProfile, hideChannelComponent } from "../actions/triggerComponents.actions";

export const initalState:  {
  userProfilePopUp: boolean,
  threadComponent: boolean,
  userProfileEditComponent: boolean,
  channelComponent: boolean
  newMessage: boolean
} = {userProfilePopUp: false,
    threadComponent: false,
    userProfileEditComponent: true,
    channelComponent: false,
    newMessage: true
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
  on(hideUserProfile, (state)=>{
    return {...state, userProfileEditComponent: !state.userProfileEditComponent}
  }),
  on(showChannelComponent, (state)=>{
    return {...state, channelComponent: true}
  }),
  on(hideChannelComponent, (state)=>{
    return {...state, channelComponent: false}
  }),
  on(showNewMessage, (state)=>{
    return {...state, newMessage: true}
  }),
  on(hideNewMessage, (state)=>{
    return {...state, newMessage: false}
  })
);