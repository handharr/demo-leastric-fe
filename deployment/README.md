# Multi-Service EC2 Production Deployment Setup

This directory contains all necessary files and scripts for deploying both the Leastric Frontend application and Worker service to AWS EC2 t3.micro instances.

## Files Overview

- `docker-compose.production.yml` - Multi-service production Docker Compose configuration
- `.env.production.example` - Environment variables template for both services
- `setup-ec2.sh` - EC2 instance setup script with multi-service support
- `README.md` - This file

## Services Included

- **Frontend**: Next.js application (leastric-fe-production)
- **Worker**: Background service with cron jobs (leastric-worker-production)
- **Watchtower**: Auto-update service for both containers

## Quick Start

### 1. Prepare AWS Resources

```bash
# Create ECR repositories for both services
aws ecr create-repository --repository-name leastric-fe-production --region us-east-1
aws ecr create-repository --repository-name leastric-worker-production --region us-east-1

# Create RDS PostgreSQL instance for worker
aws rds create-db-instance \
  --db-instance-identifier leastric-production \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your-secure-password \
  --allocated-storage 20

# Create EC2 key pair
aws ec2 create-key-pair --key-name leastric-production --query 'KeyMaterial' --output text > leastric-production.pem
chmod 400 leastric-production.pem
```

### 2. Launch EC2 Instance

```bash
# Launch t3.micro instance with appropriate security group
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1d0 \
  --count 1 \
  --instance-type t3.micro \
  --key-name leastric-fe-production \
  --security-group-ids sg-your-security-group \
  --user-data file://setup-ec2.sh
```

### 3. Configure Security Groups

**EC2 Security Group** - Allow the following inbound rules:
- SSH (22) from your IP
- HTTP (80) from anywhere (0.0.0.0/0)
- HTTPS (443) from anywhere (0.0.0.0/0)
- Custom TCP (3000) from anywhere (0.0.0.0/0) - optional for direct access

**RDS Security Group** - Allow the following inbound rules:
- PostgreSQL (5432) from EC2 security group only

### 4. Connect to EC2 and Setup

```bash
# Connect to your instance
ssh -i leastric-fe-production.pem ec2-user@your-ec2-ip

# Run setup script (if not run via user-data)
chmod +x setup-ec2.sh
./setup-ec2.sh

# Configure AWS credentials
aws configure
```

### 5. Deploy Application

```bash
# Copy deployment files to EC2
scp -i leastric-fe-production.pem deployment/* ec2-user@your-ec2-ip:/opt/leastric-fe/

# On EC2 instance
cd /opt/leastric-fe

# Copy and configure environment file
cp .env.production.example .env.production
nano .env.production  # Edit with your values

# Run deployment
./deploy.sh
```

## Environment Variables

Copy `.env.production.example` to `.env.production` and configure:

### Required Variables
```bash
NODE_ENV=production
AWS_REGION=us-east-1

# Container Images
ECR_FE_IMAGE=your-account-id.dkr.ecr.us-east-1.amazonaws.com/leastric-fe-production:production-latest
ECR_WORKER_IMAGE=your-account-id.dkr.ecr.us-east-1.amazonaws.com/leastric-worker-production:production-latest

# Database (Required for Worker)
DATABASE_URL=postgresql://postgres:password@your-rds-endpoint.region.rds.amazonaws.com:5432/leastric_db

# Worker Configuration
BACKEND_API_URL=http://frontend:3000
BACKEND_API_KEY=your-backend-api-key
```

### Optional Variables
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
NEXTAUTH_SECRET=your-secret-key
API_BASE_URL=https://api.yourdomain.com
TZ=UTC
```

## GitHub Secrets Setup

Configure these secrets in your GitHub repository:

### AWS Credentials
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### EC2 Deployment (Optional - for auto-deploy)
- `EC2_HOST` - EC2 instance public IP
- `EC2_USER` - ec2-user
- `EC2_SSH_KEY` - Private key content
- `ECR_REGISTRY` - Your ECR registry URL

### Variables
- `AUTO_DEPLOY_ENABLED` - Set to 'true' to enable automatic deployment

## Manual Deployment

If you prefer manual deployment over Watchtower:

```bash
cd /opt/leastric-fe
./deploy.sh
```

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### System Monitoring
```bash
# Run monitoring script
./monitor.sh

# Check container logs
docker logs leastric-fe-production

# Check system resources
htop
df -h
free -m
```

### CloudWatch Logs

Logs are automatically sent to CloudWatch:
- System logs: `/aws/ec2/leastric-fe/system`
- Application logs: `/aws/ec2/leastric-fe/application`

## Troubleshooting

### Common Issues

1. **Out of Memory**
   ```bash
   # Check memory usage
   free -m

   # Check swap
   swapon -s

   # Restart containers with memory limits
   docker-compose -f docker-compose.production.yml down
   docker-compose -f docker-compose.production.yml up -d
   ```

2. **ECR Login Issues**
   ```bash
   # Re-authenticate with ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Container Won't Start**
   ```bash
   # Check logs
   docker logs leastric-fe-production

   # Check environment variables
   docker exec leastric-fe-production env
   ```

4. **Watchtower Issues**
   ```bash
   # Check Watchtower logs
   docker logs watchtower-production

   # Restart Watchtower
   docker restart watchtower-production
   ```

### Useful Commands

```bash
# View all containers
docker ps -a

# Follow logs
docker logs -f leastric-fe-production

# Restart application
docker-compose -f docker-compose.production.yml restart app

# Update to latest image
./deploy.sh

# Clean up resources
docker system prune -f

# Check disk usage
docker system df
```

## Scaling Considerations

### Vertical Scaling
To upgrade from t3.micro:
1. Stop the instance
2. Change instance type to t3.small or t3.medium
3. Start the instance
4. No application changes needed

### Horizontal Scaling
For multiple instances:
1. Set up Application Load Balancer
2. Create Auto Scaling Group
3. Use shared database/storage
4. Consider ECS/Fargate for easier management

## Security Best Practices

1. **Regular Updates**
   - Automatic security updates are enabled
   - Regularly update base Docker images

2. **Access Control**
   - Use IAM roles instead of access keys when possible
   - Restrict security group access
   - Rotate secrets regularly

3. **Monitoring**
   - Enable CloudWatch monitoring
   - Set up alerts for resource usage
   - Monitor application logs

4. **Backup**
   - Regular EBS snapshots
   - Environment configuration backup
   - Database backups (if applicable)

## Cost Optimization

1. **Instance Right-sizing**
   - Monitor CPU and memory usage
   - Use CloudWatch metrics to optimize

2. **Storage Optimization**
   - Use GP3 volumes for better price/performance
   - Regular cleanup of logs and images

3. **Network Optimization**
   - Use CloudFront for static assets
   - Monitor data transfer costs

## Support

For issues and questions:
1. Check application logs: `docker logs leastric-fe-production`
2. Check system resources: `./monitor.sh`
3. Review CloudWatch metrics
4. Check GitHub Actions workflow logs