"""
app/services/email_service.py
Outgoing email notification service for Vemavaram Village CSP
Delivers real-time complaint alerts to the official admin Gmail inbox
"""

import smtplib
import threading
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
from flask import current_app

logger = logging.getLogger(__name__)


def _send_email_worker(smtp_config: dict, msg_data: dict):
    """
    Background worker that connects to the SMTP server and sends the message.
    Ensures complaint creation response is non-blocking.
    """
    host = smtp_config.get("host")
    port = smtp_config.get("port", 587)
    user = smtp_config.get("user")
    password = smtp_config.get("password")
    use_tls = smtp_config.get("use_tls", True)

    to_addr = msg_data.get("to")
    from_addr = msg_data.get("from") or user
    subject = msg_data.get("subject")
    text_content = msg_data.get("text")
    html_content = msg_data.get("html")

    if not user or not password:
        logger.warning(
            "SMTP credentials not configured (SMTP_USER or SMTP_PASSWORD empty). "
            "Email notification for '%s' was skipped. "
            "Configure SMTP_USER and SMTP_PASSWORD in Render/environment variables.",
            subject
        )
        return False

    try:
        # Build MIME message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Vemavaram Village CSP <{from_addr}>"
        msg["To"] = to_addr
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="vemavaram.gov.in")

        # Attach text and html versions
        if text_content:
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
        if html_content:
            msg.attach(MIMEText(html_content, "html", "utf-8"))

        # Connect and authenticate
        server = smtplib.SMTP(host, port, timeout=12)
        server.ehlo()
        if use_tls:
            server.starttls()
            server.ehlo()

        server.login(user, password)
        server.sendmail(from_addr, [to_addr], msg.as_string())
        server.quit()

        logger.info(
            "Email notification sent successfully to %s for subject '%s'",
            to_addr, subject
        )
        return True

    except Exception as e:
        logger.error(
            "Failed to send email notification to %s via SMTP (%s:%s): %s",
            to_addr, host, port, str(e)
        )
        return False


def send_complaint_notification_email(
    complaint_id: str,
    title: str,
    category: str,
    description: str,
    submission_date: str,
    citizen_name: str,
    status: str = "Submitted",
    image_url: str = None,
    recipient: str = None,
    async_send: bool = True
) -> bool:
    """
    Format and send a structured complaint notification email to the official admin address.
    Fails safely without breaking citizen complaint submission.
    """
    try:
        cfg = current_app.config
        target_email = recipient or cfg.get("ADMIN_NOTIFICATION_EMAIL", "gadalamahithavasavi@gmail.com")

        subject = "New Complaint Submitted – Vemavaram Village CSP"

        # Plain Text Fallback
        image_text = f"\nComplaint Image: {image_url}" if image_url else "\nComplaint Image: None provided"
        text_body = f"""New Complaint Submitted – Vemavaram Village CSP

A new citizen grievance has been registered on the Vemavaram Village portal.

Details:
--------------------------------------------------
Complaint ID:            {complaint_id}
Complaint Title:         {title}
Category:                {category}
Citizen Name:            {citizen_name}
Submission Date:         {submission_date}
Status:                  {status}
Description:
{description}
{image_text}

--------------------------------------------------
Access Admin Portal: https://complaintredressalsystem.vercel.app/
Vemavaram Village Smart Digital Governance Initiative
"""

        # HTML Formatted Email
        image_html_block = ""
        if image_url:
            image_html_block = f"""
            <div style="margin-top: 18px; padding: 14px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #334155;">Attached Photo Evidence:</p>
                <a href="{image_url}" target="_blank" style="display: inline-block; color: #ea580c; text-decoration: underline; font-size: 13px; font-weight: 500; word-break: break-all;">
                    View Photo Evidence (Cloudinary) &rarr;
                </a>
            </div>
            """

        html_body = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; }}
  .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }}
  .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 28px 24px; text-align: center; }}
  .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }}
  .header p {{ margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }}
  .content {{ padding: 28px 24px; }}
  .badge {{ display: inline-block; padding: 4px 12px; font-size: 12px; font-weight: 700; border-radius: 9999px; background-color: #ffedd5; color: #c2410c; margin-bottom: 16px; }}
  .table {{ width: 100%; border-collapse: collapse; margin-top: 8px; }}
  .table td {{ padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }}
  .table td.label {{ font-weight: 600; color: #64748b; width: 35%; }}
  .table td.value {{ color: #0f172a; font-weight: 500; }}
  .desc-box {{ margin-top: 18px; padding: 16px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #ea580c; }}
  .desc-box h3 {{ margin: 0 0 6px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }}
  .desc-box p {{ margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap; }}
  .footer {{ background-color: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }}
  .btn {{ display: inline-block; margin-top: 20px; background-color: #0f172a; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 10px; }}
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VillageConnect &bull; Vemavaram</h1>
      <p>Official Digital Governance Complaint Redressal Portal</p>
    </div>
    <div class="content">
      <span class="badge">&#9888; New Complaint Received</span>
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #0f172a;">{title}</h2>

      <table class="table">
        <tr>
          <td class="label">Complaint ID:</td>
          <td class="value"><strong style="color: #ea580c;">{complaint_id}</strong></td>
        </tr>
        <tr>
          <td class="label">Category:</td>
          <td class="value">{category}</td>
        </tr>
        <tr>
          <td class="label">Citizen Name:</td>
          <td class="value">{citizen_name}</td>
        </tr>
        <tr>
          <td class="label">Submission Date:</td>
          <td class="value">{submission_date}</td>
        </tr>
        <tr>
          <td class="label">Status:</td>
          <td class="value"><span style="color: #2563eb; font-weight: 600;">{status}</span></td>
        </tr>
      </table>

      <div class="desc-box">
        <h3>Description</h3>
        <p>{description}</p>
      </div>

      {image_html_block}

      <div style="text-align: center;">
        <a href="https://complaintredressalsystem.vercel.app/" class="btn" target="_blank">
          Open VillageConnect Portal &rarr;
        </a>
      </div>
    </div>
    <div class="footer">
      This is an automated notification from Vemavaram Village CSP.<br>
      Recipient: <strong>{target_email}</strong>
    </div>
  </div>
</body>
</html>
"""

        smtp_config = {
            "host": cfg.get("SMTP_HOST", "smtp.gmail.com"),
            "port": cfg.get("SMTP_PORT", 587),
            "user": cfg.get("SMTP_USER", ""),
            "password": cfg.get("SMTP_PASSWORD", ""),
            "use_tls": cfg.get("SMTP_USE_TLS", True),
        }

        msg_data = {
            "to": target_email,
            "from": cfg.get("SMTP_FROM_EMAIL") or cfg.get("SMTP_USER"),
            "subject": subject,
            "text": text_body,
            "html": html_body,
        }

        if async_send:
            thread = threading.Thread(
                target=_send_email_worker,
                args=(smtp_config, msg_data),
                daemon=True
            )
            thread.start()
            return True
        else:
            return _send_email_worker(smtp_config, msg_data)

    except Exception as e:
        logger.error("Error setting up complaint notification email for %s: %s", complaint_id, str(e))
        return False
