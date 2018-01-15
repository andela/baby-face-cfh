import mongoose from 'mongoose';

const { Schema } = mongoose;

const GameSchema = new Schema({
  gameId: {
    type: String,
  },
  players: [],
  round: {
    type: Number,
  },
  winner: {
    type: String,
    default: '',
  }
}, { timestamps: true });

export default mongoose.model('GameSession', GameSchema);
