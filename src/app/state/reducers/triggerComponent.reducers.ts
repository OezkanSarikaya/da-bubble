import { createReducer, on } from "@ngrx/store";
import { hideThreadComponent, hideUserProfile, showNewMessage, hideNewMessage, showThreadComponent, showChannelComponent, triggerPopUserProfile, hideChannelComponent } from "../actions/triggerComponents.actions";

export const initalState:  {
  userProfilePopUp: boolean,
  threadComponent: boolean,
  userProfileEditComponent: boolean,
  channelComponent: boolean
  newMessage: boolean,
  selectedChannel: {} | null,
  selectedThread: {} | null
} = {userProfilePopUp: false,
    threadComponent: false,
    userProfileEditComponent: true,
    channelComponent: false,
    newMessage: true,
    selectedChannel: null, 
    selectedThread: null
};


export const triggerComponentsReducer = createReducer(
  initalState,
  on(triggerPopUserProfile, (state)=> {
    return {...state, userProfilePopUp: !state.userProfilePopUp}
  }),
  on(showThreadComponent, (state, {thread})=>{
    return {...state, threadComponent: true, selectedThread: thread}
  }),
  on(hideThreadComponent, (state)=>{
    return {...state, threadComponent: false, selectedThread: null}
  }),
  on(hideUserProfile, (state)=>{
    return {...state, userProfileEditComponent: !state.userProfileEditComponent}
  }),
  on(showChannelComponent, (state, {channel})=>{
    return {...state, channelComponent: true, selectedChannel: channel,}
  }),
  on(hideChannelComponent, (state)=>{
    return {...state, channelComponent: false, selectedChannel: null,}
  }),
  on(showNewMessage, (state)=>{
    return {...state, newMessage: true}
  }),
  on(hideNewMessage, (state)=>{
    return {...state, newMessage: false}
  })
);