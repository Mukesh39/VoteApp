const mongoose = require("mongoose");

// const bcrypt = require("bcrypt");
//define the Person schema

const candidatesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  party: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId, // Correct type definition Capital O than ObjectId
        ref: "User",
        required: true,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});

const Candidate = mongoose.model("Candidate", candidatesSchema);
module.exports = Candidate;
