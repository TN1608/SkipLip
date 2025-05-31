const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const {db} = require('../config/firebase');
const {doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where} = require('firebase/firestore');
const {GeneratePostCaptions, GetPostIdeas, CreateCaptionsFromIdeas} = require('./generateAI');

// Hàm tạo OTP ngẫu nhiên (6 chữ số)
const CreateNewAccessCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hàm xác minh OTP
const ValidateAccessCode = async (phone, code) => {
    const formattedPhone = `+84${phone.replace(/^0/, '')}`;
    const otpDoc = await getDoc(doc(db, 'otp_verifications', formattedPhone));
    if (!otpDoc.exists()) {
        return {valid: false, reason: 'No OTP found for this phone number'};
    }
    const otpData = otpDoc.data();
    const {otp, expireDate} = otpData;
    if (new Date() > new Date(expireDate)) {
        return {valid: false, reason: 'OTP has expired'};
    }
    if (otp === code) {
        return {valid: true};
    } else {
        return {valid: false, reason: 'Invalid OTP'};
    }
};


// Send OTP (mock)
router.post('/send-otp', async (req, res, next) => {
    const {phone} = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
        return next(createError(400, 'Invalid phone number'));
    }
    const formattedPhone = `+84${phone.replace(/^0/, '')}`;
    const otp = CreateNewAccessCode();
    const expireDate = new Date(Date.now() + 5 * 60 * 1000);

    try {
        const userDocRef = doc(db, 'otp_verifications', formattedPhone);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                phone: formattedPhone,
                createdAt: new Date().toISOString()
            });
        }

        await setDoc(doc(db, 'otp_verifications', formattedPhone), {
            verify: true,
            otp,
            expireDate: expireDate.toISOString(),
            createdAt: new Date().toISOString()
        });

        console.log(`Mock SMS sent to ${formattedPhone}: Your Skipli AI verification code is: ${otp}`);
        res.status(200).json({message: 'OTP sent successfully', otp});
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        next(createError(500, `Failed to send OTP: ${error.message}`));
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res, next) => {
    const {phone, code} = req.body;
    if (!phone || !/^\d{10}$/.test(phone) || !code) {
        return next(createError(400, 'Invalid phone number or OTP'));
    }
    try {
        const result = await ValidateAccessCode(phone, code);
        if (result.valid) {
            res.status(200).json({message: 'Phone number verified successfully'});
        } else {
            res.status(400).json({error: result.reason});
        }
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        next(createError(500, `Failed to verify OTP: ${error.message}`));
    }
});

async function SaveGeneratedContent(topic, data, phone) {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await setDoc(doc(db, 'generated_contents', id), {
        topic,
        data,
        phone,
        createdAt: new Date().toISOString()
    });
    return id;
}

async function GetUserGeneratedContents(phone) {
    const formattedPhone = `+84${phone.replace(/^0/, '')}`;
    const q = query(collection(db, 'generated_contents'), where('phone', '==', formattedPhone));
    const querySnapshot = await getDocs(q);
    const contents = [];
    querySnapshot.forEach((doc) => {
        contents.push({id: doc.id, ...doc.data()});
    });
    return contents;
}

async function UnsaveContent(captionId) {
    await deleteDoc(doc(db, 'generated_contents', captionId));
    return {success: true};
}


// Generate Post Captions
router.post('/generate-post-captions', async (req, res, next) => {
    const {socialNetwork, subject, tone} = req.body;
    if (!socialNetwork || !subject || !tone) {
        return next(createError(400, 'Missing required parameters'));
    }
    try {
        const captions = await GeneratePostCaptions(socialNetwork, subject, tone);
        res.status(200).json(captions);
    } catch (error) {
        console.error('Error generating captions:', error.message);
        next(createError(500, `Failed to generate captions: ${error.message}`));
    }
});

// Get Post Ideas
router.post('/get-post-ideas', async (req, res, next) => {
    const {topic} = req.query;
    if (!topic) {
        return next(createError(400, 'Missing topic'));
    }
    try {
        const ideas = await GetPostIdeas(topic);
        res.status(200).json(ideas);
    } catch (error) {
        console.error('Error generating ideas:', error.message);
        next(createError(500, `Failed to generate ideas: ${error.message}`));
    }
});

// Create Captions from Ideas
router.post('/create-captions-from-ideas', async (req, res, next) => {
    const {idea} = req.body;
    if (!idea) {
        return next(createError(400, 'Missing idea'));
    }
    try {
        const captions = await CreateCaptionsFromIdeas(idea);
        res.status(200).json(captions);
    } catch (error) {
        console.error('Error generating captions from idea:', error.message);
        next(createError(500, `Failed to generate captions: ${error.message}`));
    }
});

// Save Generated Content
router.post('/save-generated-content', async (req, res, next) => {
    const {topic, data, phone} = req.body;
    if (!topic || !data || !phone) {
        return next(createError(400, 'Missing topic, data, or phone number'));
    }
    try {
        const formattedPhone = `+84${phone.replace(/^0/, '')}`;
        const contentId = await SaveGeneratedContent(topic, data, formattedPhone);
        res.status(200).json({success: true, contentId});
    } catch (error) {
        console.error('Error saving content:', error.message);
        next(createError(500, `Failed to save content: ${error.message}`));
    }
});

router.get('/get-user-generated-contents', async (req, res, next) => {
    const {phone} = req.query;
    if (!phone) {
        return next(createError(400, 'Missing phone number'));
    }
    try {
        const contents = await GetUserGeneratedContents(phone);
        res.status(200).json(contents);
    } catch (error) {
        console.error('Error fetching contents:', error.message);
        next(createError(500, `Failed to fetch contents: ${error.message}`));
    }
});

// Unsave Content
router.post('/unsave-content', async (req, res, next) => {
    const {captionId} = req.query;
    if (!captionId) {
        return next(createError(400, 'Missing caption ID'));
    }
    try {
        await UnsaveContent(captionId);
        res.status(200).json({success: true});
    } catch (error) {
        console.error('Error unsaving content:', error.message);
        next(createError(500, `Failed to unsave content: ${error.message}`));
    }
});

module.exports = router;
