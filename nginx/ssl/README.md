# SSL Certificates Setup

This directory should contain your SSL certificates for HTTPS.

## Using Let's Encrypt (Recommended)

1. **Install Certbot on your VPS:**
```bash
sudo apt update
sudo apt install certbot
```

2. **Generate certificates:**
```bash
sudo certbot certonly --standalone -d your-domain.com
```

3. **Copy certificates to this directory:**
```bash
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/fullchain.pem
sudo chmod 600 ./nginx/ssl/privkey.pem
```

4. **Set up auto-renewal:**
```bash
sudo certbot renew --dry-run
```

## For Development (Self-signed)

For local development, you can generate self-signed certificates:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/ssl/privkey.pem \
  -out ./nginx/ssl/fullchain.pem
```

**Note:** Self-signed certificates will show security warnings in browsers.

## File Permissions

- `fullchain.pem`: 644 (readable by all)
- `privkey.pem`: 600 (readable only by owner)

## Important

- Never commit real SSL certificates to Git
- Add `nginx/ssl/*.pem` to `.gitignore`
- Only commit the README.md file
