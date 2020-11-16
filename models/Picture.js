const mongoose = require("mongoose");

const Picture = mongoose.model("Picture", {
  name: String,
  picture: { type: mongoose.Schema.Types.Mixed, default: {} },
});

module.exports = Picture;
