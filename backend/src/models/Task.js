const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [150, 'Task name cannot exceed 150 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid task priority'
      },
      default: 'Medium',
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid task status'
      },
      default: 'Pending',
      index: true
    },
    dueDate: {
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

// Indexes for fast querying within a project and status/priority
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ projectId: 1, priority: 1 });
taskSchema.index({ projectId: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
