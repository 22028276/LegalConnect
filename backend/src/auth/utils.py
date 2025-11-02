import asyncio
import pyotp
import httpx

from src.core.config import settings

async def send_reset_email(ctx, to_email: str, reset_otp: str):
    """Async function để gửi email với OTP qua Resend hoặc Brevo API"""
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
    
    provider = settings.EMAIL_PROVIDER.lower()
    
    if provider == "brevo":
        await _send_via_brevo(to_email, subject, body)
    elif provider == "resend":
        await _send_via_resend(to_email, subject, body)
    else:
        raise RuntimeError(f"Unknown email provider: {provider}. Use 'resend' or 'brevo'")


async def _send_via_brevo(to_email: str, subject: str, html_body: str):
    """Gửi email qua Brevo API"""
    try:
        print(f"Sending email to {to_email} via Brevo API...", flush=True)
        
        # Brevo API endpoint
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "api-key": settings.MAIL_PASSWORD,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        # Brevo API payload
        payload = {
            "sender": {
                "name": "LegalConnect Support",
                "email": settings.MAIL_FROM
            },
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_body
        }
        
        # Gửi request qua HTTPS
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            message_id = result.get("messageId", "unknown")
            print(f"Email sent successfully to {to_email}, messageId: {message_id}", flush=True)
            
    except httpx.HTTPStatusError as e:
        error_data = e.response.json() if e.response else {}
        error_msg = error_data.get("message", str(e))
        print(f"ERROR: Brevo API error - {error_msg}", flush=True)
        raise RuntimeError(f"Brevo API error: {error_msg}")
    except Exception as e:
        error_msg = f"Failed to send email via Brevo: {str(e)}"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)


async def _send_via_resend(to_email: str, subject: str, html_body: str):
    """Gửi email qua Resend API"""
    try:
        # Import resend chỉ khi cần dùng
        import resend
        
        print(f"Sending email to {to_email} via Resend API...", flush=True)
        
        # Resend API - set API key và gửi email
        # Resend 2.x API
        resend.api_key = settings.MAIL_PASSWORD
        
        params = {
            "from": f"LegalConnect Support <{settings.MAIL_FROM}>",
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }
        
        # Chạy trong thread pool để không block event loop
        result = await asyncio.to_thread(resend.Emails.send, params)
        
        if result and hasattr(result, 'id'):
            print(f"Email sent successfully to {to_email}, id: {result.id}", flush=True)
        else:
            print(f"Email sent successfully to {to_email}", flush=True)
        
    except ImportError:
        error_msg = "Resend package not installed. Install with: uv add resend>=2.0.0"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)
    except AttributeError as e:
        # Nếu resend.errors không tồn tại (version cũ)
        error_msg = f"Resend API error: {str(e)}"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)
    except Exception as e:
        error_class_name = type(e).__name__
        if "ResendError" in error_class_name:
            # Resend API error cụ thể
            error_msg = str(e)
            print(f"ERROR: Resend API error - {error_msg}", flush=True)
            
            # Hiển thị message rõ ràng hơn
            if "testing emails" in error_msg.lower() or "verify a domain" in error_msg.lower():
                error_msg = f"Resend restriction: {error_msg}. To send to any email, verify a domain at resend.com/domains"
        else:
            error_msg = f"Failed to send email via Resend: {str(e)}"
            print(f"ERROR: {error_msg}", flush=True)
        
        raise RuntimeError(error_msg)


def generate_2fa_secret():
    key = pyotp.random_base32()
    return key

def verify_totp(secret_key, otp_code):
    totp = pyotp.TOTP(secret_key)
    return totp.verify(otp_code)