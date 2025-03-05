// Message Model

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema({
  url: { type: String },
  name: { type: String },
  size: { type: Number },
});

const messageSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: { type: String },
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
        },
        url: {
          type: String,
        },
      },
    ],
    audioUrl: {
      type: String,
    },
    document: documentSchema,  // Reference the documentSchema here
    giphyUrl: {
      type: String,
    },
    date: { type: Date, default: Date.now() },
    type: {
      type: String,
      enum: ["Media", "Text", "Document", "Audio", "Giphy"],
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
