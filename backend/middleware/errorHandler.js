module.exports = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.code === 11000) {
        return res.status(409).json({ message: 'That email or room number is already in use.' });
    }
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ message: 'Please check the submitted details.' });
    }

    const statusCode = err.statusCode || 500;
    if (statusCode >= 500) console.error('API error:', err.message);
    return res.status(statusCode).json({ message: statusCode >= 500 ? 'Something went wrong. Please try again.' : err.message });
};