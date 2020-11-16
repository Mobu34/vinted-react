const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const Picture = require("../models/Picture");

router.post("/picture", async (req, res) => {
  try {
    const picture = req.files.picture;

    const newPicture = new Picture({ name: picture.name });

    const pictureCloudinary = await cloudinary.uploader.upload(picture.path, {
      folder: `/vinted/pictures/${newPicture._id}`,
    });

    newPicture.picture = pictureCloudinary;

    await newPicture.save();

    res.status(200).json(picture);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
