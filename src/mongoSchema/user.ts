const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, unique: true, required: true },
  lastName: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  pw: { type: String, unique: true, required: true },
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
