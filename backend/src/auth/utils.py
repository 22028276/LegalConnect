import asyncio
import smtplib
import pyotp
from socket import timeout

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.core.config import settings

def _send_email(to_email: str, subject: str, body: str):
    """Blocking email sending function - sẽ được chạy trong thread pool"""
    msg = MIMEMultipart()
    msg["From"] = f"LegalConnect Support <{settings.MAIL_FROM}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        # Thêm timeout để tránh hang quá lâu
        # SendGrid port 2525 thường dùng cho local, production nên dùng 587 (TLS) hoặc 465 (SSL)
        print(f"Connecting to SMTP server {settings.MAIL_SERVER}:{settings.MAIL_PORT}", flush=True)
        
        # Dùng SMTP_SSL nếu port là 465, SMTP thường cho 587 và 2525
        if settings.MAIL_PORT == 465:
            server = smtplib.SMTP_SSL(settings.MAIL_SERVER, settings.MAIL_PORT, timeout=30)
        else:
            server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT, timeout=30)
        
        server.set_debuglevel(0)  # Set 1 để debug
        
        if settings.MAIL_TLS and settings.MAIL_PORT != 465:
            print("Starting TLS...", flush=True)
            server.starttls()
        
        print(f"Logging in with username: {settings.MAIL_USERNAME}", flush=True)
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        
        print(f"Sending email to {to_email}...", flush=True)
        server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())
        server.quit()
        
        print(f"Email sent successfully to {to_email}", flush=True)
        
    except timeout as e:
        error_msg = f"SMTP connection timeout: {str(e)}"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)
    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"SMTP authentication failed: {str(e)}"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)
    except smtplib.SMTPException as e:
        error_msg = f"SMTP error: {str(e)}"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        print(f"ERROR: {error_msg}", flush=True)
        raise RuntimeError(error_msg)
    
async def send_reset_email(ctx, to_email: str, reset_token: str):
    """Async function để gửi email - chạy blocking function trong thread pool"""
    subject = "Password Reset Request"
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    body = f"""
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password.</p>
    <p>Click the link below to reset it:</p>
    <a href="{reset_link}">{reset_link}</a>
    <br>
    <p>If you did not request this, please ignore.</p>
    """
    
    # Chạy blocking email function trong thread pool để không block event loop
    await asyncio.to_thread(_send_email, to_email, subject, body)


def generate_2fa_secret():
    key = pyotp.random_base32()
    return key

def verify_totp(secret_key, otp_code):
    totp = pyotp.TOTP(secret_key)
    return totp.verify(otp_code)