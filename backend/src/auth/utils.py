import smtplib
import pyotp

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.core.config import settings

def _send_email(to_email: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"] = f"LegalConnect Support <{settings.MAIL_FROM}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            if settings.MAIL_TLS:
                server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())
    except Exception as e:
        raise RuntimeError(f"Failed to send email: {str(e)}")
    
async def send_reset_email(ctx, to_email: str, reset_token: str):
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
    return _send_email(to_email, subject, body)

async def send_verification_email(ctx, to_email: str, verification_link: str):
    subject = "Verify your email"
    body = f"""
    <h2>Verify your email</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="{verification_link}">{verification_link}</a>
    <p>This link expires in 24 hours.</p>
    """
    return _send_email(to_email, subject, body)

async def send_login_otp_email(ctx, to_email: str, code: str):
    subject = "Your login verification code"
    body = f"""
    <h2>Login verification</h2>
    <p>Use this 6-digit code to continue logging in:</p>
    <h3 style="letter-spacing:3px">{code}</h3>
    <p>This code expires in 5 minutes.</p>
    """
    return _send_email(to_email, subject, body)


def generate_2fa_secret():
    key = pyotp.random_base32()
    return key

def verify_totp(secret_key, otp_code):
    totp = pyotp.TOTP(secret_key)
    return totp.verify(otp_code)