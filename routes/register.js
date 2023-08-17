const express = require('express');
const router = express.Router();
const fido2 = require('../utils/fido2');

router.post('/start', fido2.registerStart);
router.post('/finish', fido2.registerFinish);

module.exports = router;