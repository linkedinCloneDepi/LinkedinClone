const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 100,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "user",
    },
    bannerImg: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    about:{type: String, default: "",},
    skills: [{ name: String}],  //, level: String 
    section: [{ name: String, dexcription: String }],
    experience: [
      {
        title: String,
        employmentType: String,
        company: String,
        location: String,
        locationType: String,
        startMonth: String,
        startYear: String,
        endMonth: String,
        endYear: String,
        currentlyWorking: Boolean,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        startMonth: String,
        startYear: String,
        endMonth: String,
        endYear: String,
        grade: String,
        activities: String,
        description: String,
      },
    ],
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Connections",
      },
    ],
    connectedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },

  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

function validateRegisterUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    username: Joi.string().trim().min(2).max(200).required(),
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
}

function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(6).required(),
  });
  return schema.validate(obj);
}

function validateExperience(experience) {
  const schema = Joi.object({
    title: Joi.string().required(),
    company: Joi.string().required(),
    employmentType: Joi.string().allow(""),
    location: Joi.string().allow(""),
    locationType: Joi.string().allow(""),
    startMonth: Joi.string().required(),
    startYear: Joi.string().required(),
    endMonth: Joi.string().allow(null),
    endYear: Joi.string().allow(null),
    currentlyWorking: Joi.boolean(),
    description: Joi.string().allow("")
  });
  return schema.validate(experience);
}

function validateEducation(education) {
  const schema = Joi.object({
    school: Joi.string().required(),
    fieldOfStudy: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().allow(null),
    description: Joi.string().allow("")
  });
  return schema.validate(education);
}

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateExperience,
  validateEducation
};
