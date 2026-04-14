import mongoose from 'mongoose';

const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 32
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    nickname: {
      type: String,
      default: 'Administrator',
      trim: true,
      maxlength: 64
    },
    avatar: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

adminSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    username: this.username,
    nickname: this.nickname,
    avatar: this.avatar,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
