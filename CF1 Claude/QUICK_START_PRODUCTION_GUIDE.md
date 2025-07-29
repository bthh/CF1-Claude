# CF1 Platform - Quick Start Production Guide

## 🚀 Get CF1 Running in Production in 30 Minutes

This guide provides the fastest path to get CF1 Platform running in production. Follow these steps in order for a successful deployment.

---

## Prerequisites Check ✅

Before starting, ensure you have:
- [ ] **Docker** (20.10.0+) and **Docker Compose** (2.0.0+) installed
- [ ] **Node.js** (18.0.0+) installed
- [ ] **Domain name** registered (e.g., cf1platform.com)
- [ ] **SSL certificate** ready (Let's Encrypt recommended)
- [ ] **SMTP credentials** for email alerts
- [ ] **Neutron testnet wallet** with NTRN tokens

---

## Step 1: Smart Contract Deployment (5 minutes)

### 1.1 Install Neutron Binary
```bash
# Follow: https://docs.neutron.org/neutron/build-and-run/install
# Or use Docker approach if binary installation fails
```

### 1.2 Deploy Contract
```bash
# Navigate to smart contract directory
cd CF1\ Code/cf1-core

# Create wallet (if not exists)
neutrond keys add cf1-deployer

# Get testnet tokens from https://docs.neutron.org/neutron/faucet

# Deploy contract
export WALLET_NAME="cf1-deployer"
export CW20_CODE_ID="1"
./scripts/deploy.sh

# ✅ Save the contract address from output!
```

**Expected Output:**
```
✅ Contract stored with code ID: 123
✅ Contract instantiated at address: neutron1abc123def456...
✅ Contract verification successful
```

---

## Step 2: Environment Configuration (3 minutes)

### 2.1 Configure Frontend Environment
```bash
# Navigate to frontend directory
cd CF1\ Code/cf1-frontend

# Edit production environment file
nano .env.production

# UPDATE THIS LINE with your deployed contract address:
VITE_LAUNCHPAD_CONTRACT_ADDRESS=neutron1your_contract_address_here

# Optional: Update API URLs if using custom domains
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WEBSOCKET_URL=wss://ws.yourdomain.com
```

### 2.2 Configure Backend Environment
```bash
# Navigate to backend directory
cd CF1\ Code/cf1-frontend/backend

# Create environment file
cp .env.example .env

# Edit with your values
nano .env

# Key settings:
ADMIN_API_KEY=your-secure-admin-key-here
ADMIN_USERNAME=cf1-admin
ADMIN_PASSWORD=your-secure-password-here
ANTHROPIC_API_KEY=your-anthropic-key-here
```

### 2.3 Configure AI Analyzer
```bash
# Navigate to AI analyzer directory
cd CF1\ Code/cf1-ai-analyzer

# Create environment file
cp .env.example .env

# Edit with your values
nano .env

# Key settings:
ANTHROPIC_API_KEY=your-anthropic-key-here
WEBHOOK_SECRET=your-webhook-secret-here
```

---

## Step 3: Start Monitoring Infrastructure (2 minutes)

```bash
# Navigate to frontend directory
cd CF1\ Code/cf1-frontend

# Start monitoring stack
./start-monitoring.sh

# Wait for services to start (about 30 seconds)
# Check status:
curl http://localhost:9090/-/healthy  # Prometheus
curl http://localhost:3000/api/health  # Grafana
```

**Access Monitoring:**
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/cf1-admin-password)
- **AlertManager**: http://localhost:9093

---

## Step 4: Deploy Application Stack (5 minutes)

### 4.1 Build and Deploy Frontend
```bash
# Navigate to frontend directory
cd CF1\ Code/cf1-frontend

# Install dependencies
npm ci

# Build for production
npm run build:production

# Start with Docker
docker-compose -f docker-compose.yml --profile production up -d

# Check status
docker-compose ps
```

### 4.2 Deploy Backend
```bash
# Navigate to backend directory
cd CF1\ Code/cf1-frontend/backend

# Install dependencies
npm ci

# Build TypeScript
npm run build

# Start backend
npm start &

# Check health
curl http://localhost:3001/health
```

### 4.3 Deploy AI Analyzer
```bash
# Navigate to AI analyzer directory
cd CF1\ Code/cf1-ai-analyzer

# Start with Docker
docker-compose up -d

# Check health
curl http://localhost:8000/health
```

---

## Step 5: Verify Deployment (5 minutes)

### 5.1 Health Checks
```bash
# Check all services
curl http://localhost/health          # Frontend
curl http://localhost:3001/health     # Backend
curl http://localhost:8000/health     # AI Analyzer

# Check monitoring
curl http://localhost:9091/metrics    # Health checker
```

### 5.2 Smoke Tests
```bash
# Test API endpoints
curl -H "Content-Type: application/json" \
  -X GET http://localhost:3001/api/v1/proposals

# Test admin authentication
curl -H "X-API-Key: your-admin-key" \
  -X GET http://localhost:3001/api/v1/admin/status
```

### 5.3 Browser Tests
1. **Open**: http://localhost (or your domain)
2. **Check**: Dashboard loads correctly
3. **Test**: Wallet connection (demo mode should work)
4. **Verify**: Proposal creation form works
5. **Confirm**: Monitoring dashboards accessible

---

## Step 6: Configure Alerts (5 minutes)

### 6.1 Email Alerts
```bash
# Edit AlertManager configuration
nano CF1\ Code/cf1-frontend/monitoring/alertmanager.yml

# Update email settings:
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@yourdomain.com'
  smtp_auth_username: 'alerts@yourdomain.com'
  smtp_auth_password: 'your-app-password'

receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'admin@yourdomain.com'
        subject: '[CRITICAL] CF1 Platform Alert'
```

### 6.2 Restart AlertManager
```bash
# Restart to apply changes
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

---

## Step 7: Production Checklist (5 minutes)

### 7.1 Security Checklist
- [ ] Admin credentials updated from defaults
- [ ] API keys configured and secured
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Rate limiting enabled

### 7.2 Monitoring Checklist
- [ ] All services showing as "UP" in Prometheus
- [ ] Grafana dashboards displaying data
- [ ] Alerts configured and tested
- [ ] Log aggregation working
- [ ] Health checks passing

### 7.3 Functionality Checklist
- [ ] Frontend loads without errors
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Smart contract deployed and accessible
- [ ] AI analyzer processing requests

---

## Common Issues & Quick Fixes

### Issue: Contract deployment fails
**Solution:**
```bash
# Check wallet balance
neutrond query bank balances your_wallet_address --node https://rpc-palvus.pion-1.ntrn.tech

# If insufficient funds, get more from faucet
# If neutrond not found, install Neutron binary or use Docker
```

### Issue: Docker services not starting
**Solution:**
```bash
# Check Docker status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check logs
docker-compose logs service_name
```

### Issue: Frontend showing errors
**Solution:**
```bash
# Check environment variables
cat .env.production

# Verify contract address is correct
# Check browser console for errors
# Verify API backend is running
```

### Issue: Monitoring not working
**Solution:**
```bash
# Check Docker networks
docker network ls

# Restart monitoring stack
docker-compose -f docker-compose.monitoring.yml restart

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

---

## Production URLs

After successful deployment, your CF1 Platform will be accessible at:

- **Main Application**: http://localhost (or your domain)
- **API Documentation**: http://localhost:3001/api/docs
- **AI Analyzer**: http://localhost:8000/docs
- **Monitoring Dashboard**: http://localhost:3000
- **Metrics**: http://localhost:9090
- **Alerts**: http://localhost:9093

---

## Next Steps

### Immediate (Day 1):
1. **SSL Setup**: Configure SSL certificates for production domain
2. **DNS Configuration**: Point domain to your server
3. **Backup Setup**: Configure automated backups
4. **Team Access**: Create accounts for team members

### Short Term (Week 1):
1. **Load Testing**: Test with realistic traffic
2. **Security Audit**: Run security scans
3. **Documentation**: Update team documentation
4. **Training**: Train team on monitoring and operations

### Ongoing:
1. **Monitor Metrics**: Daily review of key metrics
2. **Update Dependencies**: Weekly security updates
3. **Backup Testing**: Monthly backup restoration tests
4. **Performance Optimization**: Continuous improvement

---

## Support & Documentation

### Quick Reference:
- **Full Deployment Guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Security Guide**: `SECURITY_IMPLEMENTATION_GUIDE.md`
- **Monitoring Guide**: `MONITORING_AND_OPERATIONS_GUIDE.md`
- **Smart Contract Guide**: `CF1 Code/cf1-core/README.md`

### Getting Help:
- **Technical Issues**: Check logs with `docker-compose logs`
- **Monitoring Issues**: Check Prometheus targets
- **Security Issues**: Review authentication logs
- **Performance Issues**: Check Grafana dashboards

---

## Success Confirmation

If you've followed this guide successfully, you should have:

✅ **CF1 Platform running in production**
✅ **Smart contracts deployed on Neutron testnet**
✅ **Comprehensive monitoring active**
✅ **Security measures in place**
✅ **Health checks passing**
✅ **Alerts configured**

**🎉 Congratulations! CF1 Platform is now running in production!**

---

## Emergency Contacts

In case of critical issues:
- **Technical Support**: Check troubleshooting guides first
- **Security Issues**: Immediately stop affected services
- **System Down**: Check monitoring alerts and logs
- **Data Issues**: Restore from latest backup

**Remember**: All monitoring and alerting is now active. Check Grafana dashboards for real-time status and performance metrics.

🚀 **CF1 Platform is production-ready and monitoring your Real-World Asset tokenization ecosystem!**