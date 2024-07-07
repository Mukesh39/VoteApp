const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// const bcrypt = require("bcrypt");
//define the Person schema

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
  },

  email: {
    type: String,
  },
  mobile: {
    type: String,
  },

  password: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true,
  },

  role: {
    type: String,
    enum: ["admin", "voter"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  const person = this;

  // Only hash the password if it is modified or new
  if (!person.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(person.password, salt);

    person.password = hashedPassword;
    // Password is now hashed
    next();
  } catch (err) {
    return next(err);
  }
});

// userSchema.methods.comparePassword this explains the methdos avaiable to person instances than applying the method called comapreMethod

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);

    //compare(enteredpassword, storedpassword);

    return isMatch;
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
