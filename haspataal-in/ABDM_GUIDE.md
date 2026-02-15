# ABDM Integration Guide (Sandbox)

To integrate Haspataal with the **Ayushman Bharat Digital Mission (ABDM)**, we need to register as a **Health Information Provider (HIP)** in their Sandbox environment.

## Step 1: Register on ABDM Sandbox
1.  Go to [sandbox.abdm.gov.in](https://sandbox.abdm.gov.in/).
2.  Click **"Integrate with ABDM"**.
3.  Sign up for a new account.

## Step 2: Register Client ID
1.  Once logged in, go to **"Client ID generation"**.
2.  Create a new Client ID.
    -   **System Type**: Health Information Provider (HIP).
    -   **Callback URL**: `http://localhost:3000/api/abdm/callback` (for local dev).
3.  You will get a **Client ID** and **Client Secret**.

## Step 3: Update Environment Variables
Add the following to your `.env` file in the project root:

```env
ABDM_CLIENT_ID="your_client_id_here"
ABDM_CLIENT_SECRET="your_client_secret_here"
ABDM_BASE_URL="https://dev.abdm.gov.in/gateway/v0.5"
```

## Step 4: Whitelist IP (Optional)
Sometimes ABDM requires whitelisting your server IP. If you are running locally, you might need a tunneling service (like ngrok) or just use their specified test credentials if available.

## Next Steps
Once you have these credentials, we can implement:
1.  **ABHA Verification**: Verify a patient's ABHA number.
2.  **Care Context Linking**: Link a patient's record (HIP) to their ABHA.
3.  **Consent Flow**: Share health data.
