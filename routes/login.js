const express = require('express');
const router = express.Router();
const fido2 = require('../utils/fido2');

router.post('/start', fido2.loginStart);
router.post('/finish', fido2.loginFinish);

module.exports = router;