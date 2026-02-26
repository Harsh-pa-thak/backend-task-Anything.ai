const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const messages = error.details.map((d) => d.message.replace(/['"]/g, ''));
        return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next();
};

const schemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('user', 'admin').default('user'),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    task: Joi.object({
        title: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(500).allow('').optional(),
        status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
        priority: Joi.string().valid('low', 'medium', 'high').optional(),
    }),

    taskUpdate: Joi.object({
        title: Joi.string().min(1).max(100).optional(),
        description: Joi.string().max(500).allow('').optional(),
        status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
        priority: Joi.string().valid('low', 'medium', 'high').optional(),
    }),
};

module.exports = { validate, schemas };
