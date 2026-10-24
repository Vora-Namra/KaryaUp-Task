import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/index.js';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['Project Admin', 'Team Lead', 'Developer', 'QA'],
      default: 'Developer',
    },
    avatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
    },
    isInvited: {
      type: Boolean,
      default: false,
    },
    inviteToken: {
      type: String,
      default: null,
      index: true,
    },
    inviteProject: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    inviteSprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null,
    },
    inviteProjectRole: {
      type: String,
      enum: ['Admin', 'Member', 'Viewer'],
      default: 'Member',
    },
    inviteMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
