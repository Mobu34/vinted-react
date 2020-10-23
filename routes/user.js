const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");

cloudinary.config({
  cloud_name: "dt2v2biq4",
  api_key: "963554912823413",
  api_secret: "aGqxEfOEn8SbpMQy7SV5r11imEc",
});

router.post("/user/signup", async (req, res) => {
  const { email, username, phone, password } = req.fields;
  const picture = req.files.picture.path;

  try {
    const checkEmail = await User.findOne({ email });
    const checkUsername = await User.findOne({ "account.username": username });

    if (!checkEmail && username && !checkUsername && email) {
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase);
      const token = uid2(16);

      const photoCloudinary = await cloudinary.uploader.upload(picture, {
        folder: "/vinted/picture",
      });

      const newUser = new User({
        email,
        account: {
          username,
          phone,
          avatar: photoCloudinary,
        },
        token,
        hash,
        salt,
      });

      await newUser.save();

      res.status(200).json({
        _id: newUser._id,
        token: newUser.token,
        account: {
          username: newUser.account.username,
          phone: newUser.account.phone,
          avatar: newUser.account.avatar,
        },
      });
    } else {
      if (checkEmail) {
        res.status(409).json({ error: "Email already exists" });
      } else if (checkUsername) {
        res.status(409).json({ error: "Username already exists" });
      } else {
        res.status(200).json({ error: "Please enter a valid username" });
      }
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/user/login", async (req, res) => {
  const { username, email, password } = req.fields;

  try {
    let user;
    if (username) {
      user = await User.findOne({ "account.username": username });
    } else {
      user = await User.findOne({ email });
    }

    if (user) {
      const checkHash = SHA256(password + user.salt).toString(encBase);

      if (checkHash === user.hash) {
        res.status(200).json({ message: "User successfully logged" });
      } else {
        res.status(400).json({ error: "Wrong password" });
      }
    } else {
      res.status(200).json({ error: "Incorrect username or email" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
