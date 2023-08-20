function ensureAuthenticated(req, res, next) {
    if (req.path.startsWith('/dashboard') && !req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    next();
}

module.exports = {
    ensureAuthenticated,
};