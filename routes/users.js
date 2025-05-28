var express = require('express');
const createError = require("http-errors");
var router = express.Router();

const { db } = require('../config/firebase');
const { doc, getDoc } = require('firebase/firestore');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Ham lay user info
const GetUserInfo = async (phone) => {
  const formattedPhone = `+84${phone.replace(/^0/, '')}`;
  const userDoc = await getDoc(doc(db, 'otp_verifications', formattedPhone));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  } else {
    throw new Error('User not found');
  }
}

// Get User Info
router.get('/get-user', async (req, res, next) => {
  const { phone } = req.query;
  if (!phone || !/^\d{10}$/.test(phone)) {
    return next(createError(400, 'Invalid phone number'));
  }
  try {
    const userInfo = await GetUserInfo(phone);
    res.status(200).json(userInfo);
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    next(createError(500, `Failed to fetch user info: ${error.message}`));
  }
});

module.exports = router;
