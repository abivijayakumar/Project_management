const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['Not Started', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid project status'
      },
      default: 'Not Started',
      index: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for user scoped filtering and searching
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ userId: 1, name: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
