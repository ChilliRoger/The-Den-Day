import mongoose, { Document, Schema } from 'mongoose'

export interface IMessage {
  user: string
  text: string
  timestamp: Date
}

export interface IPartyState {
  cakeCut: boolean
  videoCallActive: boolean
}

export interface IRoom extends Document {
  code: string
  host: string
  createdAt: Date
  messages: IMessage[]
  partyState: IPartyState
}

const MessageSchema = new Schema<IMessage>({
  user: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

const PartyStateSchema = new Schema<IPartyState>({
  cakeCut: { type: Boolean, default: false },
  videoCallActive: { type: Boolean, default: false }
})

const RoomSchema = new Schema<IRoom>({
  code: { type: String, required: true, unique: true, uppercase: true },
  host: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  messages: [MessageSchema],
  partyState: { type: PartyStateSchema, default: () => ({}) }
})

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema)
