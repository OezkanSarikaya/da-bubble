import { createReducer, on } from "@ngrx/store";
import { hideThreadComponent, hideUserProfile, showNewMessage, hideNewMessage, showThreadComponent, showChannelComponent, triggerPopUserProfile, hideChannelComponent, editMessageThread, editMessageChannelOpen, editMessageChannelClose } from "../actions/triggerComponents.actions";
import { Message } from "../../interfaces/message";

export const initalState:  {
  userProfilePopUp: boolean,
  threadComponent: boolean,
  userProfileEditComponent: boolean,
  channelComponent: boolean
  newMessage: boolean,
  selectedChannel: {} | null,
  selectedThread: Message | null,
  editMessageChannel: string | null,
  editMessageThread: boolean,
} = {userProfilePopUp: false,
    threadComponent: false,
    userProfileEditComponent: true,
    channelComponent: false,
    newMessage: true,
    selectedChannel: null, 
    selectedThread: null,
    editMessageChannel: null,
    editMessageThread: false
};


export const triggerComponentsReducer = createReducer(
  initalState,
  on(triggerPopUserProfile, (state)=> {
    return {...state, userProfilePopUp: !state.userProfilePopUp}
  }),
  on(showThreadComponent, (state, {message})=>{
    return {...state, threadComponent: true, selectedThread: message}
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
  }),
  on(editMessageChannelOpen, (state, {messageID})=>{
    return {...state, editMessageChannel: messageID}
  }),
  on(editMessageChannelClose, (state)=>{
    return {...state, editMessageChannel: null}
  }),
  on(editMessageThread, (state)=>{
    return {...state, editMessageThread: !state.editMessageThread}
  })
);