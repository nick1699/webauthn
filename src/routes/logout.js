const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Logout fehlgeschlagen.");
        }
        res.redirect('/login');
    });
});

module.exports = router;