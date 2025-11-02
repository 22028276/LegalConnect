import asyncio
import pyotp
import resend

from src.core.config import settings

async def send_reset_email(ctx, to_email: str, reset_otp: str):
    """Async function để gửi email với OTP qua Resend API"""
    subject = "Password Reset Request - OTP Code"
    
    # Tạo body email với OTP 6 số
    body = f"""
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password.</p>
    <p>Use the OTP code below to reset your password:</p>
    <div style="font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 8px; background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        {reset_otp}
    </div>
    <p><strong>This OTP code will expire in 5 minutes.</strong></p>
    <p>If you did not request this, please ignore this email.</p>
    """
    
    try:
        print(f"Sending email to {to_email} via Resend API...", flush=True)
        
        # Resend API - set API key và gửi email
        # Resend 2.x API
        resend.api_key = settings.MAIL_PASSWORD
        
        params = {
            "from": f"LegalConnect Support <{settings.MAIL_FROM}>",
            "to": [to_email],
            "subject": subject,
            "html": body,
        }
        
        # Chạy trong thread pool để không block event loop
        result = await asyncio.to_thread(resend.Emails.send, params)
        
        if result and hasattr(result, 'id'):
            print(f"Email sent successfully to {to_email}, id: {result.id}", flush=True)
        else:
            print(f"Email sent successfully to {to_email}", flush=True)
        
    except AttributeError as e:
        # Nếu resend.errors không tồn tại (version cũ)
        error_msg = f"Resend API error: {str(e)}"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)


def generate_2fa_secret():
    key = pyotp.random_base32()
    return key

def verify_totp(secret_key, otp_code):
    totp = pyotp.TOTP(secret_key)
    return totp.verify(otp_code)