# Docker Guide

This guide covers how to use Docker with your Arcast application.

## 🐳 Quick Start

### Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop the application
docker-compose down
```

### Development Mode

```bash
# Start development environment
docker-compose --profile dev up --build

# Access the app at http://localhost:3001
```

### Production Mode

```bash
# Start production environment with Nginx
docker-compose --profile production up --build

# Access the app at http://localhost:80
```

## 🔧 Manual Docker Commands

### Build the Image

```bash
# Build production image
docker build -t arcast-app .

# Build development image
docker build -f Dockerfile.dev -t arcast-app:dev .
```

### Run the Container

```bash
# Run production container
docker run -p 3000:3000 arcast-app

# Run development container
docker run -p 3001:3000 -v $(pwd):/app arcast-app:dev
```

## 📁 Docker Files

- `Dockerfile` - Production build
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Multi-service orchestration
- `nginx.conf` - Nginx reverse proxy configuration

## 🌍 Environment Variables

Create a `.env` file for Docker:

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
```

## 🚀 Production Deployment

### 1. Build Production Image

```bash
docker build -t arcast-app:latest .
```

### 2. Run with Nginx

```bash
docker-compose --profile production up -d
```

### 3. Scale Application

```bash
docker-compose up -d --scale app=3
```

## 🔍 Monitoring and Logs

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f app
```

### Health Checks

The application includes health checks:

```bash
# Check container health
docker ps

# Test health endpoint
curl http://localhost/health
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Build Failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Debugging

```bash
# Enter running container
docker-compose exec app sh

# View container resources
docker stats

# Inspect container
docker inspect <container_id>
```

## 📊 Performance Optimization

### Multi-stage Builds

The production Dockerfile uses multi-stage builds to:
- Reduce final image size
- Separate build and runtime dependencies
- Optimize layer caching

### Resource Limits

Add resource limits to docker-compose.yml:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🔒 Security Best Practices

1. **Use Non-root User**
   - The production image runs as `nextjs` user
   - Avoid running containers as root

2. **Scan for Vulnerabilities**
   ```bash
   # Install Trivy
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
     aquasec/trivy image arcast-app:latest
   ```

3. **Keep Images Updated**
   ```bash
   # Update base images
   docker pull node:18-alpine
   docker-compose build --no-cache
   ```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

For more help, check the main README.md or open an issue in the repository.
