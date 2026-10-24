import mongoose, { Schema } from 'mongoose';
import { IProject, IProjectMember } from '../types/index.js';

const memberSchema = new Schema<IProjectMember>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectRole: {
    type: String,
    enum: ['Admin', 'Member', 'Viewer'],
    default: 'Member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketCounter: {
      type: Number,
      default: 100,
    },
    members: [memberSchema],
    settings: {
      allowViewerComments: {
        type: Boolean,
        default: true,
      },
      lead: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
export default Project;
