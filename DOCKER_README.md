# Docker Setup Guide for Eventinos

## Quick Start

### Development Mode
Run the application in development mode with hot-reloading:
```bash
docker-compose up eventinos-dev
```
Access the app at: http://localhost:5173

### Production Mode
Build and run the optimized production version:
```bash
docker-compose up eventinos-prod
```
Access the app at: http://localhost:80

## Docker Commands

### Build Images

#### Development Image
```bash
docker build -t eventinos:dev --target development .
```

#### Production Image
```bash
docker build -t eventinos:prod --target production .
```

### Run Containers

#### Development
```bash
# Using docker-compose
docker-compose up eventinos-dev

# Using docker directly
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules eventinos:dev
```

#### Production
```bash
# Using docker-compose
docker-compose up eventinos-prod

# Using docker directly
docker run -p 80:80 eventinos:prod
```

### Stop Containers
```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop eventinos-dev
# or
docker-compose stop eventinos-prod
```

### View Logs
```bash
# View logs for development
docker-compose logs -f eventinos-dev

# View logs for production
docker-compose logs -f eventinos-prod
```

### Rebuild After Changes
```bash
# Rebuild and restart
docker-compose up --build eventinos-dev

# Force rebuild without cache
docker-compose build --no-cache eventinos-dev
docker-compose up eventinos-dev
```

## Environment Variables

Create a `.env` file in the project root for environment-specific variables:
```env
VITE_API_URL=http://your-api-url
VITE_APP_NAME=Eventinos
# Add other environment variables as needed
```

## Troubleshooting

### Port Already in Use
If port 5173 or 80 is already in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "3000:5173"  # For dev: host_port:container_port
  - "8080:80"    # For prod: host_port:container_port
```

### Permission Issues
If you encounter permission issues with node_modules:
```bash
# Clear node_modules and rebuild
docker-compose down -v
docker-compose up --build
```

### Clean Up
```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove everything (containers, networks, volumes)
docker-compose down -v
docker system prune -a
```

## Production Deployment

For production deployment, use the production image with proper environment variables:

```bash
# Build production image
docker build -t eventinos:latest --target production .

# Run with custom port
docker run -d -p 8080:80 --name eventinos-app eventinos:latest

# Or use docker-compose
docker-compose -f docker-compose.yml up -d eventinos-prod
```

## Architecture

- **Development**: Uses Node.js with Vite dev server for hot-reloading
- **Production**: Multi-stage build with Nginx serving optimized static files
- **Nginx**: Configured for SPA routing, gzip compression, and caching

## Notes

- The development container mounts your local files, so changes are reflected immediately
- The production image is optimized and only contains the built assets
- Health check endpoint available at `/health` in production
