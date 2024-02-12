import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

# Set up sender, receiver, and message details
fromaddr = "your_email@example.com"
toaddr = "receiver_email@example.com"
msg = MIMEMultipart()
msg['From'] = fromaddr
msg['To'] = toaddr
msg['Subject'] = "Subject of the Mail"

# Body of the email
body = "This is the body of the email"
msg.attach(MIMEText(body, 'plain'))

# Attachment
filename = "your_attachment.txt"
attachment = open("path_to_file", "rb")
part = MIMEBase('application', 'octet-stream')
part.set_payload((attachment).read())
encoders.encode_base64(part)
part.add_header('Content-Disposition', "attachment; filename= %s" % filename)
msg.attach(part)

# SMTP configuration
server = smtplib.SMTP('smtp.example.com', 587)
server.starttls()
server.login(fromaddr, "YourPassword")
text = msg.as_string()

# Send the email
server.sendmail(fromaddr, toaddr, text)
server.quit()
