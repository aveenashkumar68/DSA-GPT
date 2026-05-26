import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // User authentication credentials
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default in queries
    },
  
    
    // Application-specific data
    chatHistory: [
      {
        question: String,
        answer: String,
        topic: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preferences: {
      language: {
        type: String,
        default: "JavaScript",
      },
      difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "intermediate",
      },
      theme: {
        type: String,
        enum: ["dark", "light"],
        default: "dark",
      },
    },
    stats: {
      totalQuestions: {
        type: Number,
        default: 0,
      },
      totalTopicsCovered: {
        type: Number,
        default: 0,
      },
      lastAccessedAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to get public user data (without sensitive info)
userSchema.methods.toJSON = function () {
  const { password, ...userWithoutPassword } = this.toObject();
  return userWithoutPassword;
};

// Create or get the User model
const User = mongoose.model("User", userSchema);

export default User;
