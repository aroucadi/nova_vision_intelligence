# 🚀 NovaVision Intelligence — A-to-Z Deployment Guide

This guide will take you from a fresh GitHub repository to a fully functional production deployment of the NovaVision Intelligence Platform.

---

## 🛠 Prerequisites

Before we begin, ensure you have:
1.  A **GitHub Account** (Free)
2.  An **AWS Account** (Free Tier available)
3.  A **Vercel Account** (Free Tier)
4.  A **Render.com Account** (Free Tier)

---

## 🏗 Step 1: GitHub Repository Setup

1.  **Create a New Repository**:
    - Go to [GitHub](https://github.com/new).
    - name: `nova-vision-intelligence`.
    - Set it to **Private** (recommended for hackathons) or **Public**.
2.  **Push Your Code**:
    - Open your terminal in the project root.
    - Run the following commands:
    ```bash
    git init
    git add .
    git commit -m "Initial commit: NovaVision Intelligence Platform"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/nova-vision-intelligence.git
    git push -u origin main
    ```

---

## ☁️ Step 2: AWS Setup (Bedrock + IAM)

1.  **Create an AWS Account**: [aws.amazon.com/free](https://aws.amazon.com/free).
2.  **Enable Model Access** (CRITICAL):
    - Go to the **Amazon Bedrock Console**.
    - **Region**: Ensure you are in `us-east-1` (N. Virginia).
    - Select **Model Access** from the left sidebar.
    - Click **Manage Model Access**.
    - Request access for:
        - **Amazon Nova 2 Lite**
        - **Amazon Nova 2 Sonic**
        - **Amazon Nova Act**
        - **Amazon Nova Multimodal Embeddings**
    - Wait until the status shows "Access granted" (usually instant).
3.  **Create IAM User**:
    - Go to **IAM Console** → **Users** → **Create User**.
    - name: `nova-vision-agent`.
    - **Permissions**: Attach policy `AmazonBedrockFullAccess`.
    - **Create Access Key**:
        - Go to the new user's **Security Credentials** tab.
        - Click **Create access key**.
        - Select **Application running outside AWS**.
        - Copy the **Access Key ID** and **Secret Access Key**.

---

## 🎨 Step 3: Vercel Blob Storage Setup (for File Uploads)

1.  Log in to [Vercel](https://vercel.com).
2.  Navigate to your dashboard → **Storage** → **Create Database** → **Blob**.
3.  Fill in the name and create.
4.  Copy the `BLOB_READ_WRITE_TOKEN`.

---

## 🐍 Step 4: Deploy Nova Act Service (Render.com)

The UI Automation agent requires a Python environment to run Chromium.

1.  **Login to Render**: [dashboard.render.com](https://dashboard.render.com).
2.  **Create New Blueprint**:
    - Click **New +** → **Blueprint**.
    - Connect your GitHub repository.
    - Render will automatically detect the `render.yaml` file.
3.  **Configure Environment Variables**:
    - During the setup flow, Render will ask for these keys:
        - `API_SECRET`: Generate a random long string (e.g., `abc-123-your-secret`). **Save this!**
        - `SIMULATION_MODE`: Set to `false`.
        - `ALLOWED_ORIGINS`: Set to `*` for now (or your Vercel URL later).
4.  **Wait for Deployment**:
    - Render will build the Docker container. This takes ~5 minutes.
    - Once done, copy the **Service URL** (e.g., `https://novavision-nova-act.onrender.com`).

---

## ⚡ Step 5: Deploy the Web App (Vercel)

1.  **Create New Project**:
    - Click **Add New** → **Project** in Vercel dashboard.
    - Import your `nova-vision-intelligence` repository.
2.  **Configure Environment Variables**:
    - In the **Environment Variables** section, add the following:

| Key | Value |
|-----|-------|
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key |
| `AWS_REGION` | `us-east-1` |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob Token |
| `NOVA_ACT_SERVICE_URL` | Your Render Service URL (from Step 4) |
| `NOVA_ACT_API_SECRET` | The `API_SECRET` you created in Step 4 |
| `NEXT_PUBLIC_APP_URL` | Your Vercel Deployment URL (can update after deploy) |

3.  **Deploy**:
    - Click **Deploy**.
    - Your app will be live in ~2 minutes!

---

## 🧪 Step 6: Final Verification

1.  Open your Vercel app URL.
2.  **Test Upload**: Upload an image/PDF → Verify Nova 2 Lite analyzes it.
3.  **Test Voice**: Click the Mic → Ask a question → Hear Nova 2 Sonic respond.
4.  **Test Automation**: Go to the **Automate** tab → Run a "Web Data Collection" workflow.

---

## 💡 Troubleshooting

-   **Model Not Found**: Double check that you requested access in `us-east-1` and your IAM user has `AmazonBedrockFullAccess`.
-   **Render Cold Start**: On the free tier, the Nova Act service sleep after 15 mins. The UI will show a "Warming up" message—simply wait 30 seconds.
-   **File Size**: Ensure uploads are under 10MB to stay within Vercel's free tier body limits.

---

**You are now in production! 🏆**
#AmazonNova #NovaVision
