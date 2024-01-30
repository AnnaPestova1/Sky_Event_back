const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      enum: [
        "comet",
        "asteroid",
        "meteor_shower",
        "solar_eclipse",
        "lunar_eclipse"
      ]
    },
    name: {
      type: String,
      required: [true, "Please provide name"],
      maxlength: 30
    },
    date: {
      type: Date,
      required: [false, "Please provide the event date"]
    },
    description: {
      type: String,
      required: [false, "Please provide description"],
      maxlength: 250
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Data", DataSchema);
