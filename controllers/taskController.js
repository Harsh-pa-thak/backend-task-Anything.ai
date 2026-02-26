const Task = require('../models/Task');
const { wrapAsync, AppError } = require('../middleware/errorHandler');


const getTasks = wrapAsync(async (req, res) => {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };


    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
});


const createTask = wrapAsync(async (req, res) => {
    const { title, description, status, priority } = req.body;

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        user: req.user._id,
    });

    res.status(201).json({ success: true, task });
});


const getTask = wrapAsync(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) throw new AppError('Task not found', 404);

    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized to view this task', 403);
    }

    res.json({ success: true, task });
});


const updateTask = wrapAsync(async (req, res) => {
    let task = await Task.findById(req.params.id);

    if (!task) throw new AppError('Task not found', 404);

    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized to update this task', 403);
    }

    const { title, description, status, priority } = req.body;
    task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, status, priority },
        { new: true, runValidators: true }
    );

    res.json({ success: true, task });
});


const deleteTask = wrapAsync(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) throw new AppError('Task not found', 404);

    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('Not authorized to delete this task', 403);
    }

    await task.deleteOne();

    res.json({ success: true, message: 'Task deleted' });
});

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask };
