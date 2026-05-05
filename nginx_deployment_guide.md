# Nginx Configuration for Star Concord Chatbot

This configuration serves the frontend static files on port **8081** and proxies API requests to the Node.js backend.

## 1. Nginx Config File
Create a new file at `/etc/nginx/sites-available/star-concord-chatbot` (or update your main config):

```nginx
server {
    listen 8081;
    server_name 167.172.75.67;

    # Frontend Static Files
    # Update this path to where your 'dist' folder is located on the server
    root /var/www/html/ff-chatbot;
    index index.html;

    # Handle SPA Routing (React/Vite)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the Node.js Backend
    location /api/ {
        proxy_pass http://localhost:5100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Logging for debugging
        access_log /var/log/nginx/chatbot_api_access.log;
        error_log /var/log/nginx/chatbot_api_error.log;
    }

    # Optimize static file delivery
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

## 2. Deployment Steps

### A. Prepare the Server
1. **Move Files**: Copy your `dist` folder to `/var/www/teams-chatbot/dist`.
2. **Backend**: Ensure your `chatbot-backend` is running on port **5100** (e.g., using `pm2 start index.js`).

### B. Enable the Configuration
```bash
# Link the config to sites-enabled
sudo ln -s /etc/nginx/sites-available/star-concord-chatbot /etc/nginx/sites-enabled/

# Test the configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### C. Frontend Environment Variable
Ensure your frontend was built with this `.env` setting so it points to the Nginx proxy:
```env
VITE_BACKEND_URL=/api/chat
```
*(Using a relative path `/api/chat` is best when the frontend and backend are served from the same origin/port via Nginx.)*
