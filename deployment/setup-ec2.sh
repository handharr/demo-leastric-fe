#!/bin/bash

# EC2 Instance Setup Script for Leastric Frontend Production Deployment
# This script should be run on a fresh EC2 t3.micro instance

set -e

echo "🚀 Setting up EC2 instance for Leastric Frontend production deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo chkconfig docker on

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install AWS CLI
echo "☁️ Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/leastric-fe
sudo chown ec2-user:ec2-user /opt/leastric-fe

# Create swap file for additional memory (recommended for t3.micro)
echo "💾 Creating swap file..."
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Create log rotation for Docker
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/docker > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Install CloudWatch agent (optional)
echo "📊 Installing CloudWatch agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
rm amazon-cloudwatch-agent.rpm

# Create CloudWatch config
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json > /dev/null <<EOF
{
    "metrics": {
        "namespace": "Leastric/Production",
        "metrics_collected": {
            "cpu": {
                "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                "metrics_collection_interval": 60
            },
            "disk": {
                "measurement": ["used_percent"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
            },
            "diskio": {
                "measurement": ["io_time"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
            },
            "mem": {
                "measurement": ["mem_used_percent"],
                "metrics_collection_interval": 60
            },
            "swap": {
                "measurement": ["swap_used_percent"],
                "metrics_collection_interval": 60
            }
        }
    },
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/ec2/leastric-fe/system",
                        "log_stream_name": "{instance_id}"
                    },
                    {
                        "file_path": "/opt/leastric-fe/logs/*.log",
                        "log_group_name": "/aws/ec2/leastric-fe/application",
                        "log_stream_name": "{instance_id}"
                    }
                ]
            }
        }
    }
}
EOF

# Set up automatic security updates
echo "🔒 Setting up automatic security updates..."
sudo yum install -y yum-cron
sudo sed -i 's/update_cmd = default/update_cmd = security/' /etc/yum/yum-cron.conf
sudo sed -i 's/apply_updates = no/apply_updates = yes/' /etc/yum/yum-cron.conf
sudo service yum-cron start
sudo chkconfig yum-cron on

# Create deployment script
echo "📜 Creating deployment script..."
cat > /opt/leastric-fe/deploy.sh << 'EOF'
#!/bin/bash

set -e

# Configuration
ECR_REGISTRY="${ECR_REGISTRY:-your-account-id.dkr.ecr.us-east-1.amazonaws.com}"
ECR_FE_REPOSITORY="${ECR_FE_REPOSITORY:-leastric-fe-production}"
ECR_WORKER_REPOSITORY="${ECR_WORKER_REPOSITORY:-leastric-worker-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"
IMAGE_TAG="${IMAGE_TAG:-production-latest}"

echo "🚀 Starting multi-service deployment..."

# Navigate to app directory
cd /opt/leastric-fe

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Pull latest images
echo "📥 Pulling latest images..."
docker pull $ECR_REGISTRY/$ECR_FE_REPOSITORY:$IMAGE_TAG
docker pull $ECR_REGISTRY/$ECR_WORKER_REPOSITORY:$IMAGE_TAG

# Export images for docker-compose
export ECR_FE_IMAGE="$ECR_REGISTRY/$ECR_FE_REPOSITORY:$IMAGE_TAG"
export ECR_WORKER_IMAGE="$ECR_REGISTRY/$ECR_WORKER_REPOSITORY:$IMAGE_TAG"

# Stop current containers
echo "🛑 Stopping current containers..."
docker-compose -f docker-compose.production.yml down

# Start with new images
echo "▶️ Starting containers with new images..."
docker-compose -f docker-compose.production.yml up -d

# Wait for health checks
echo "🏥 Waiting for health checks..."
sleep 45

# Verify deployment
echo "✅ Verifying deployment..."

# Check frontend
if curl -f http://localhost:3000/api/health; then
    echo "✅ Frontend deployment successful!"
else
    echo "❌ Frontend health check failed!"
    exit 1
fi

# Check worker (if health endpoint exists)
if docker exec leastric-worker-production curl -f http://localhost:3000/health 2>/dev/null; then
    echo "✅ Worker deployment successful!"
else
    echo "⚠️ Worker health check skipped (no health endpoint)"
fi

# Display service status
echo "📊 Service Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Multi-service deployment completed successfully!"
EOF

chmod +x /opt/leastric-fe/deploy.sh

# Create systemd service for automatic startup
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/leastric-fe.service > /dev/null <<EOF
[Unit]
Description=Leastric Frontend Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/leastric-fe
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
User=ec2-user

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable leastric-fe.service

# Create basic monitoring script
echo "📈 Creating monitoring script..."
cat > /opt/leastric-fe/monitor.sh << 'EOF'
#!/bin/bash

# Multi-service monitoring script
echo "=== System Resources ==="
echo "Memory Usage:"
free -h
echo ""
echo "Disk Usage:"
df -h
echo ""
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)"
echo ""
echo "=== Docker Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
echo ""
echo "=== Container Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""
echo "=== Application Health ==="
echo "Frontend Health:"
curl -s http://localhost:3000/api/health || echo "Frontend health check failed"
echo ""
echo "Worker Health:"
docker exec leastric-worker-production curl -s http://localhost:3000/health 2>/dev/null || echo "Worker health check skipped"
echo ""
echo "=== Recent Logs ==="
echo "Frontend Logs (last 10 lines):"
docker logs --tail 10 leastric-fe-production 2>/dev/null || echo "No frontend logs"
echo ""
echo "Worker Logs (last 10 lines):"
docker logs --tail 10 leastric-worker-production 2>/dev/null || echo "No worker logs"
EOF

chmod +x /opt/leastric-fe/monitor.sh

# Create log cleanup cron job
echo "🗂️ Setting up log cleanup..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/sbin/logrotate /etc/logrotate.d/docker") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 docker system prune -f") | crontab -

echo ""
echo "✅ EC2 setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Copy your application files to /opt/leastric-fe/"
echo "3. Copy and configure .env.production file"
echo "4. Run the deployment: ./deploy.sh"
echo ""
echo "📁 Application directory: /opt/leastric-fe"
echo "📜 Deployment script: /opt/leastric-fe/deploy.sh"
echo "📈 Monitoring script: /opt/leastric-fe/monitor.sh"
echo ""
echo "🔄 Reboot required to ensure all services start properly"
echo "Run: sudo reboot"