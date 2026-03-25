import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true,
    },
    summary: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    changes: [{
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
    }],
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
        trim: true,
    },
    taskStatus: {
        type: String,
        enum: ["Pending", "In Progress", "Completed"],
        default: "Pending"
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    dueDate: {
        type: Date,
        default: null,
    },
    category: {
        type: String,
        default: "General",
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        default: null,
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    comments: [commentSchema],
    tags: [{
        type: String,
        trim: true,
    }],
    deadlineReminderSentAt: {
        type: Date,
        default: null,
    },
    activityHistory: [activitySchema],
}, {
    timestamps: true
});

taskSchema.index({ user: 1, board: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ board: 1, taskStatus: 1 });
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ board: 1, priority: 1, dueDate: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1, taskStatus: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;
