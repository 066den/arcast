#!/bin/sh
set -e

echo "NGINX entrypoint: starting..."
echo "ENABLE_CERTBOT=${ENABLE_CERTBOT:-false} CERTBOT_DOMAIN=${CERTBOT_DOMAIN:-localhost}"

# Install runtime deps for certbot + cron (idempotent)
apk add --no-cache openssl certbot python3 py3-certifi py3-requests cronie || true

# Prepare dirs
mkdir -p /etc/nginx/certs /var/www/certbot /etc/letsencrypt

if [ "${ENABLE_CERTBOT:-false}" = "true" ]; then
  echo "Certbot enabled, attempting to obtain certificate for ${CERTBOT_DOMAIN}"

  # Obtain certificate if not exists
  if [ ! -f "/etc/letsencrypt/live/${CERTBOT_DOMAIN}/fullchain.pem" ]; then
    certbot certonly --webroot -w /var/www/certbot \
      -d "${CERTBOT_DOMAIN}" \
      --email "${CERTBOT_EMAIL}" \
      --agree-tos --non-interactive || true
  fi

  # Link certs into nginx path if exist
  if [ -f "/etc/letsencrypt/live/${CERTBOT_DOMAIN}/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/${CERTBOT_DOMAIN}/privkey.pem" ]; then
    ln -sf "/etc/letsencrypt/live/${CERTBOT_DOMAIN}/fullchain.pem" /etc/nginx/certs/server.crt
    ln -sf "/etc/letsencrypt/live/${CERTBOT_DOMAIN}/privkey.pem"  /etc/nginx/certs/server.key
    echo "Certbot certificate linked."
  else
    echo "Certbot certificate not present yet; will use self-signed fallback."
  fi

  # Setup daily renew at 03:00 and nginx reload
  echo "0 3 * * * certbot renew --webroot -w /var/www/certbot --quiet && nginx -s reload" >> /etc/crontabs/root || true
  crond
else
  echo "Certbot disabled (ENABLE_CERTBOT!=true)."
fi

# Fallback to self-signed if no valid certs found
if [ ! -f /etc/nginx/certs/server.crt ] || [ ! -f /etc/nginx/certs/server.key ]; then
  echo "Generating self-signed certificate fallback..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/server.key \
    -out /etc/nginx/certs/server.crt \
    -subj "/CN=${CERTBOT_DOMAIN:-localhost}"
fi

echo "Starting NGINX..."
exec nginx -g "daemon off;"