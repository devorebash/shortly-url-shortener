import mongoose from "mongoose";
const urlSchema = new mongoose.Schema({
  fullUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true, // this means two documents cannot have the same shortUrl
  },
  createdAt: {
    type: Date,
    default: Date.now, // automatically assigns the current date and time if no vvalue is provided
  },
});
export const Url = mongoose.model("Url", urlSchema);
