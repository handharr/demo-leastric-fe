# Production Deployment Guide - AWS EC2

## Multi-Service Deployment Assessment for t3.micro EC2 Instance

### Feasibility: ✅ YES - Both Services Compatible

Your Docker setup supports deploying both the frontend application and background worker service to AWS EC2 t3.micro instances with proper resource management.

## Current Setup Analysis

### Multi-Service Architecture
- **Frontend**: Next.js 15.3.5 frontend application (Port 3000)
- **Worker**: Node.js 20 TypeScript background service with cron jobs
- **Containerization**: Multi-stage Docker builds for both services
- **Build Process**: Optimized with standalone output and minimal dependencies
- **Security**: Non-root users for both services with proper permissions
- **Health Checks**: Built-in health endpoint monitoring for both services
- **Auto-Updates**: Watchtower integration for automatic multi-service deployments

### Resource Requirements
- **Frontend**:
  - Base Image: Node.js 18 Alpine
  - Memory Usage: ~200-450MB (peak)
  - CPU: Low usage when idle, moderate during SSR
- **Worker**:
  - Base Image: Node.js 20 Alpine
  - Memory Usage: ~100-350MB (peak during processing)
  - CPU: Low usage normally, bursts during cron jobs
- **Combined Peak**: ~600-800MB total memory usage

## t3.micro Specifications

| Resource | Specification | Multi-Service Compatibility |
|----------|---------------|---------------------------|
| CPU | 2 vCPUs (burstable) | ✅ Adequate for both services |
| Memory | 1 GB RAM | ✅ Sufficient with resource limits & monitoring |
| Storage | EBS-backed | ✅ Flexible sizing for both services |
| Network | Low-Moderate | ✅ Suitable for frontend + worker API calls |

## Deployment Architecture

### Multi-Service Docker Compose Architecture (Implemented)
```
GitHub Actions → AWS ECR (2 repos) → EC2 t3.micro → Docker Compose → Frontend + Worker
```

**Services:**
- **Frontend Container**: leastric-fe-production (450MB limit, port 3000)
- **Worker Container**: leastric-worker-production (350MB limit, internal only)
- **Watchtower**: Auto-updates both services (100MB limit)
- **External Database**: PostgreSQL RDS micro instance

**Benefits:**
- Single-instance multi-service deployment
- Shared network for service communication
- Resource-constrained containers prevent memory issues
- Watchtower handles rolling updates for both services

## Deployment Flow

### 1. Multi-Service CI/CD Pipeline
1. **Build Phase**: GitHub Actions builds both Docker images in parallel
2. **Registry Phase**: Push frontend and worker images to separate ECR repositories
3. **Deploy Phase**: Watchtower pulls new images and performs rolling restart

### 2. Infrastructure Components
- **AWS ECR**: Two container registries (leastric-fe-production, leastric-worker-production)
- **EC2 t3.micro**: Multi-service application host
- **RDS PostgreSQL**: Database for worker service (micro instance recommended)
- **Security Group**: Network access control (ports 22, 80, 443, 3000)
- **Elastic IP**: Static IP address (optional)
- **Application Load Balancer**: SSL termination and domain routing (optional)

### 3. Monitoring & Logging
- **CloudWatch**: EC2 and application metrics
- **Docker Logs**: Container-level logging
- **Health Checks**: Built-in application health monitoring

## Pre-deployment Requirements

### AWS Resources
1. **ECR Repositories**:
   - `leastric-fe-production` (frontend images)
   - `leastric-worker-production` (worker images)
2. **EC2 Instance**: t3.micro with appropriate security groups
3. **RDS Instance**: PostgreSQL micro instance for worker database
4. **IAM Roles**: ECR access permissions for both repositories
5. **Security Groups**:
   - EC2: HTTP/HTTPS access (ports 80, 443, 3000) + SSH (22)
   - RDS: PostgreSQL access (port 5432) from EC2 only

### EC2 Instance Setup
1. **Operating System**: Amazon Linux 2 or Ubuntu 20.04+
2. **Docker**: Latest stable version
3. **Docker Compose**: v2.x
4. **AWS CLI**: For ECR authentication

### Environment Configuration
- **Environment Variables**: Production configuration for both services
- **Database**: RDS PostgreSQL connection string
- **Worker Configuration**: API keys and cron settings
- **SSL Certificates**: Let's Encrypt or AWS Certificate Manager
- **Domain Configuration**: DNS pointing to EC2 instance

## Potential Challenges & Solutions

### Memory Constraints
- **Challenge**: 1GB RAM limit with two services running
- **Solution**:
  - Container memory limits (450MB frontend, 350MB worker, 100MB watchtower)
  - Add swap file (2GB recommended) for overflow protection
  - Monitor memory usage with CloudWatch
  - Worker processes data in batches to avoid memory spikes

### Build Performance
- **Challenge**: t3.micro limited CPU for builds
- **Solution**: Build in CI/CD pipeline, not on instance

### Storage Management
- **Challenge**: EBS storage costs and management
- **Solution**:
  - Use GP3 volumes for cost optimization
  - Implement log rotation
  - Clean up old Docker images

## Cost Estimation

### Monthly AWS Costs (us-east-1)
- **t3.micro EC2**: ~$8.50/month (free tier eligible)
- **RDS PostgreSQL micro**: ~$13.50/month (free tier eligible)
- **EBS GP3 20GB**: ~$1.60/month
- **ECR Storage**: ~$0.20/GB/month (2 repositories)
- **CloudWatch Logs**: ~$2.50-5.00/month (estimated 0.5-1GB/month)
  - Log Ingestion: $0.50/GB ingested
  - Log Storage: $0.03/GB/month stored
  - Log Groups: System logs + Application logs (both services)
- **CloudWatch Metrics**: ~$1.50/month (custom metrics)
  - Custom metrics: $0.30 per metric/month
  - Standard metrics: Free (first 10 metrics)
- **Data Transfer**: ~$0.09/GB (first 1GB free)

**Total Estimated**: ~$29-36/month (or ~$16-23/month with free tier)

### CloudWatch Log Volume Estimation
Based on the configured log collection:
- **System Logs**: `/var/log/messages` (~50-100MB/month)
- **Application Logs**: Docker container logs (~200-500MB/month)
  - Frontend logs: ~100-250MB/month
  - Worker logs: ~50-150MB/month (periodic cron jobs)
  - Watchtower logs: ~10-50MB/month
- **Log Retention**: Default 30 days (configurable)

## Security Considerations

### Network Security
- Security groups restricting access to necessary ports only
- SSH access limited to specific IP addresses
- HTTPS enforcement for production traffic

### Container Security
- Non-root user execution
- Regular base image updates
- Minimal attack surface with Alpine Linux

### Access Control
- IAM roles with least privilege access
- ECR repository policies
- SSH key-based authentication

## Scaling Considerations

### Vertical Scaling
- Upgrade to t3.small/medium for increased capacity
- Adjust EBS volume size as needed

### Horizontal Scaling
- Application Load Balancer with multiple instances
- Auto Scaling Groups for demand-based scaling
- Consider ECS Fargate for serverless scaling

## Monitoring & Alerting

### Key Metrics
- CPU utilization (burst credit monitoring)
- Memory usage per container
- Disk space utilization
- Frontend response times
- Worker cron job execution status
- Database connection health
- Container health status for both services

### Recommended Alerts
- High memory usage (>80%) per container
- CPU burst credit depletion
- Frontend/Worker health check failures
- Database connection failures
- Worker cron job failures
- Disk space low (<20% free)

## Backup & Recovery

### Data Backup
- EBS snapshots for instance state
- ECR image versioning for rollback capability (both repositories)
- RDS automated backups for database
- Environment configuration backup for both services

### Disaster Recovery
- Infrastructure as Code (Terraform/CloudFormation)
- Automated deployment scripts
- Database backup strategy (if applicable)

## Terraform Infrastructure Deployment

For a complete infrastructure setup including Frontend+Worker, Backend, and MQTT instances, use the provided Terraform configuration:

### Quick Terraform Deployment

```bash
# Navigate to terraform directory
cd terraform

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings

# Deploy infrastructure
terraform init
terraform plan
terraform apply

# Get connection information
terraform output ssh_commands
terraform output application_urls
terraform output environment_variables
```

### Terraform Features

- **3 EC2 t3.micro instances**: Frontend+Worker, Backend (k3s), MQTT (Mosquitto)
- **RDS PostgreSQL micro**: Database with `leastric_db`
- **S3 bucket**: File storage with presigned URL support
- **ECR repositories**: Container image registries
- **VPC with security groups**: Network isolation
- **Elastic IPs**: Static IP addresses for all instances

### Manual Setup (Alternative)

If you prefer manual setup instead of Terraform:

```bash
# Create ECR repositories
aws ecr create-repository --repository-name leastric-fe-production --region us-east-1
aws ecr create-repository --repository-name leastric-worker-production --region us-east-1
aws ecr create-repository --repository-name leastric-backend-production --region us-east-1

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier leastric-production \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your-secure-password \
  --allocated-storage 20 \
  --db-name leastric_db

# Create S3 bucket
aws s3 mb s3://your-unique-bucket-name --region us-east-1
```

### Post-Deployment Steps

1. **Configure Environment Variables**: Use Terraform outputs or manually set database/S3 credentials
2. **Deploy Applications**:
   - Frontend+Worker: `sudo /opt/leastric-fe/deploy.sh`
   - Backend: `sudo /opt/leastric-backend/deploy.sh`
   - MQTT: `sudo /opt/install-mosquitto.sh && sudo /opt/manage-mqtt.sh start`
3. **Set up monitoring and alerting**
4. **Configure domain and SSL certificates**
5. **Test inter-service communication**

## Support & Troubleshooting

### Common Issues
- **Out of Memory**: Check container logs, monitor memory limits, optimize batch sizes
- **Worker Not Processing**: Check database connection, cron job logs, API connectivity
- **Frontend Slow Performance**: Monitor CPU credits, check worker resource usage
- **Deployment Failures**: Check ECR permissions for both repos, Docker daemon status
- **Health Check Failures**: Verify application configuration, port bindings, database connectivity

### Useful Commands
```bash
# Check multi-service status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
./monitor.sh  # Custom monitoring script

# Check individual service logs
docker logs leastric-fe-production
docker logs leastric-worker-production
docker logs watchtower-production

# Monitor container resources
docker stats --no-stream

# ECR login for both repositories
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Multi-service deployment
./deploy.sh  # Custom deployment script

# Service management
docker-compose -f docker-compose.production.yml restart frontend
docker-compose -f docker-compose.production.yml restart worker

# Cleanup
docker system prune -f
docker image prune -f
```