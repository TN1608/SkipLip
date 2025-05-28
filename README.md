# Skipli AI Backend API

## Overview

This backend provides APIs for phone number verification (OTP), content generation, and user content management using Node.js, Express, and Firebase.

## Installation
1. Clone the repository:
   ```bash
   git clone
   ```
2. Navigate to the project directory:
   ```bash
   cd skipli-ai-backend
   ```
3. Install dependencies:
   ```bash
    npm install
    ```
4. Set up environment variables in a `.env` file:
    ```plaintext
    GEMINI_API_KEY=your_gemini_api_key
    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    FIREBASE_PROJECT_ID=your_firebase_project_id
    FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    FIREBASE_APP_ID=your_firebase_app_id
    ```
5. Start the server:
    ```bash
    npm start
    ```


## API Documentation

### 1. Phone Number Verification

- **Send OTP:**  
  `POST /api/send-otp`  
  - Input: `{ phone }`  
  - Action: Generates and sends an OTP to the phone, saves OTP and expiry in Firestore.

- **Verify OTP:**  
  `POST /api/verify-otp`  
  - Input: `{ phone, code }`  
  - Action: Checks OTP validity for the phone. Returns success or error.

### 2. Content Generation

- **Generate Post Captions:**  
  `POST /api/generate-post-captions`  
  - Input: `{ socialNetwork, subject, tone }`  
  - Action: Returns generated captions for a post.

- **Get Post Ideas:**  
  `POST /api/get-post-ideas?topic=...`  
  - Input: `topic` (query param)  
  - Action: Returns post ideas for the topic.

- **Create Captions from Ideas:**  
  `POST /api/create-captions-from-ideas`  
  - Input: `{ idea }`  
  - Action: Returns captions based on the provided idea.

### 3. User Content Management

- **Save Generated Content:**  
  `POST /api/save-generated-content`  
  - Input: `{ topic, data, phone }`  
  - Action: Saves generated content to Firestore for the user.

- **Get User Generated Contents:**  
  `GET /api/get-user-generated-contents?phone=...`  
  - Input: `phone` (query param)  
  - Action: Returns all saved contents for the user.

- **Unsave Content:**  
  `POST /api/unsave-content?captionId=...`  
  - Input: `captionId` (query param)  
  - Action: Deletes the saved content by ID.

### 4. User Info

- **Get User Info:**  
  `GET /users/get-user?phone=...`  
  - Input: `phone` (query param)  
  - Action: Returns user info from Firestore.

## Error Handling

- All endpoints return JSON errors with status codes.
- Success responses return 200.
- Missing or invalid parameters return 400.
- Server errors return 500.

## Environment Variables

Set the following in your `.env` file:
- `GEMINI_API_KEY`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

---

**Note:** All phone numbers are formatted to Vietnamese (+84) standard before saving or querying.