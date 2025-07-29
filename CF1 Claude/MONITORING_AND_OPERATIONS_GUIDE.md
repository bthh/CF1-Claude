# CF1 Platform - Monitoring and Operations Guide

## Table of Contents
1. [Monitoring Architecture](#monitoring-architecture)
2. [Metrics Collection](#metrics-collection)
3. [Alerting & Notifications](#alerting--notifications)
4. [Dashboards & Visualization](#dashboards--visualization)
5. [Log Management](#log-management)
6. [Performance Monitoring](#performance-monitoring)
7. [Health Checks](#health-checks)
8. [Operational Procedures](#operational-procedures)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance & Updates](#maintenance--updates)

---

## Monitoring Architecture

### Overview

CF1 Platform uses a comprehensive monitoring stack built on industry-standard tools:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CF1 Frontend  │    │   CF1 Backend   │    │ CF1 AI Analyzer │
│   (React App)   │    │  (Node.js API)  │    │   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Prometheus    │
                    │ (Metrics Store) │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Grafana     │
                    │ (Visualization) │
                    └─────────────────┘
```

### Components

#### Core Monitoring Stack:
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **AlertManager**: Alert routing and notifications
- **Loki**: Log aggregation and querying
- **Promtail**: Log shipping agent

#### System Monitoring:
- **Node Exporter**: System metrics (CPU, memory, disk)
- **cAdvisor**: Container metrics
- **Blackbox Exporter**: Endpoint monitoring

#### Application Monitoring:
- **CF1 Health Checker**: Custom health monitoring
- **Business Metrics**: Custom application metrics

---

## Metrics Collection

### 1. Application Metrics

#### Frontend Metrics:
```typescript
// Location: cf1-frontend/src/lib/monitoring.ts
import { Counter, Histogram, Gauge } from 'prom-client';

// User interaction metrics
const userActions = new Counter({
  name: 'cf1_user_actions_total',
  help: 'Total user actions',
  labelNames: ['action', 'component']
});

// Performance metrics
const pageLoadTime = new Histogram({
  name: 'cf1_page_load_duration_seconds',
  help: 'Page load duration',
  labelNames: ['page']
});

// Active users
const activeUsers = new Gauge({
  name: 'cf1_active_users',
  help: 'Currently active users'
});

// Usage examples
userActions.inc({ action: 'invest', component: 'InvestmentModal' });
pageLoadTime.observe({ page: 'launchpad' }, 1.5);
activeUsers.set(150);
```

#### Backend Metrics:
```typescript
// Location: cf1-frontend/backend/src/metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';

// HTTP request metrics
const httpRequests = new Counter({
  name: 'cf1_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpDuration = new Histogram({
  name: 'cf1_http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route']
});

// Business metrics
const proposalsCreated = new Counter({
  name: 'cf1_proposals_created_total',
  help: 'Total proposals created',
  labelNames: ['type']
});

const investmentsTotal = new Counter({
  name: 'cf1_investments_total',
  help: 'Total investments',
  labelNames: ['proposal_id']
});

// Database metrics
const dbConnections = new Gauge({
  name: 'cf1_database_connections_active',
  help: 'Active database connections'
});

// Track HTTP requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequests.inc({ 
      method: req.method, 
      route: req.route?.path || req.path,
      status_code: res.statusCode 
    });
    httpDuration.observe({ 
      method: req.method, 
      route: req.route?.path || req.path 
    }, duration);
  });
  
  next();
});
```

### 2. System Metrics

#### Collected Automatically:
- **CPU Usage**: By core and total
- **Memory Usage**: RAM and swap utilization
- **Disk Usage**: Space and I/O operations
- **Network**: Bytes in/out, connections
- **Container Stats**: Per-container resource usage

#### Custom System Metrics:
```typescript
// Location: cf1-frontend/monitoring/health-checker/health_checker.py
import psutil
from prometheus_client import Gauge

# Custom system metrics
cpu_temperature = Gauge('cf1_cpu_temperature_celsius', 'CPU temperature')
disk_io_operations = Gauge('cf1_disk_io_operations_total', 'Disk I/O operations', ['device'])
network_connections = Gauge('cf1_network_connections_active', 'Active network connections')

# Collect custom metrics
def collect_custom_metrics():
    # CPU temperature (if available)
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            cpu_temp = temps['coretemp'][0].current
            cpu_temperature.set(cpu_temp)
    except:
        pass
    
    # Disk I/O
    disk_io = psutil.disk_io_counters(perdisk=True)
    for device, stats in disk_io.items():
        disk_io_operations.labels(device=device).set(stats.read_count + stats.write_count)
    
    # Network connections
    connections = len(psutil.net_connections())
    network_connections.set(connections)
```

### 3. Business Metrics

#### Key Performance Indicators:
```typescript
// Business KPIs
const businessMetrics = {
  // Proposal metrics
  proposalCreationRate: new Gauge({
    name: 'cf1_proposal_creation_rate',
    help: 'Proposals created per hour'
  }),
  
  proposalFundingRate: new Gauge({
    name: 'cf1_proposal_funding_rate',
    help: 'Percentage of proposals reaching funding goal'
  }),
  
  // Investment metrics
  totalValueLocked: new Gauge({
    name: 'cf1_total_value_locked',
    help: 'Total value locked in platform'
  }),
  
  averageInvestmentSize: new Gauge({
    name: 'cf1_average_investment_size',
    help: 'Average investment amount'
  }),
  
  // User metrics
  activeInvestors: new Gauge({
    name: 'cf1_active_investors',
    help: 'Number of active investors'
  }),
  
  walletConnectionSuccess: new Gauge({
    name: 'cf1_wallet_connection_success_rate',
    help: 'Wallet connection success rate'
  })
};

// Update business metrics
const updateBusinessMetrics = () => {
  // Calculate and update metrics
  businessMetrics.proposalCreationRate.set(calculateProposalRate());
  businessMetrics.totalValueLocked.set(calculateTVL());
  businessMetrics.activeInvestors.set(getActiveInvestorsCount());
};

// Schedule regular updates
setInterval(updateBusinessMetrics, 60000); // Every minute
```

---

## Alerting & Notifications

### 1. Alert Configuration

#### Critical Alerts:
```yaml
# File: monitoring/alert_rules.yml
groups:
  - name: critical-alerts
    rules:
      - alert: CF1ServiceDown
        expr: up{job=~"cf1-.*"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CF1 service is down"
          description: "{{ $labels.job }} has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(cf1_http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (>5%) for 5 minutes"

      - alert: DatabaseConnectionFailure
        expr: cf1_database_connections_active == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
          description: "No active database connections for 2 minutes"
```

#### Warning Alerts:
```yaml
  - name: warning-alerts
    rules:
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(cf1_http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "95th percentile response time is {{ $value }}s (>2s)"

      - alert: LowProposalCreationRate
        expr: rate(cf1_proposals_created_total[1h]) < 0.01
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Low proposal creation rate"
          description: "Proposal creation rate is {{ $value }} per hour"

      - alert: HighInvestmentFailureRate
        expr: rate(cf1_investment_failures_total[5m]) / rate(cf1_investment_attempts_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High investment failure rate"
          description: "Investment failure rate is {{ $value }} (>10%)"
```

### 2. Notification Channels

#### Email Notifications:
```yaml
# File: monitoring/alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@cf1platform.com'
  smtp_auth_username: 'alerts@cf1platform.com'
  smtp_auth_password: 'your-app-password'

receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'admin@cf1platform.com'
        subject: '[CRITICAL] CF1 Platform Alert'
        body: |
          🚨 **CRITICAL ALERT** 🚨
          
          **Alert**: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}
          **Description**: {{ range .Alerts }}{{ .Annotations.description }}{{ end }}
          **Time**: {{ range .Alerts }}{{ .StartsAt }}{{ end }}
          **Severity**: {{ range .Alerts }}{{ .Labels.severity }}{{ end }}
          
          Please investigate immediately.
```

#### Slack Notifications:
```yaml
  - name: 'slack-alerts'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#cf1-alerts'
        title: 'CF1 Platform Alert'
        text: |
          {{ range .Alerts }}
          🚨 **{{ .Annotations.summary }}**
          {{ .Annotations.description }}
          Severity: {{ .Labels.severity }}
          Time: {{ .StartsAt }}
          {{ end }}
        color: '{{ if eq .Status "firing" }}danger{{ else }}good{{ end }}'
```

#### PagerDuty Integration:
```yaml
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - routing_key: 'YOUR_PAGERDUTY_ROUTING_KEY'
        description: 'CF1 Platform Critical Alert'
        details:
          alert: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
          description: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
          severity: '{{ range .Alerts }}{{ .Labels.severity }}{{ end }}'
```

### 3. Alert Routing

#### Routing Rules:
```yaml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default-alerts'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
    - match:
        service: blockchain
      receiver: 'blockchain-team'
    - match:
        service: frontend
      receiver: 'frontend-team'
```

---

## Dashboards & Visualization

### 1. Grafana Dashboard Setup

#### Main Platform Dashboard:
```json
{
  "dashboard": {
    "title": "CF1 Platform Overview",
    "panels": [
      {
        "title": "Service Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~\"cf1-.*\"}",
            "legendFormat": "{{ job }}"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cf1_http_requests_total[5m])",
            "legendFormat": "{{ method }} {{ route }}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(cf1_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

#### Business Metrics Dashboard:
```json
{
  "dashboard": {
    "title": "CF1 Business Metrics",
    "panels": [
      {
        "title": "Proposals Created",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cf1_proposals_created_total[1h])",
            "legendFormat": "Proposals per hour"
          }
        ]
      },
      {
        "title": "Total Value Locked",
        "type": "stat",
        "targets": [
          {
            "expr": "cf1_total_value_locked",
            "legendFormat": "TVL"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "cf1_active_users",
            "legendFormat": "Active Users"
          }
        ]
      }
    ]
  }
}
```

### 2. Custom Dashboards

#### System Performance Dashboard:
- CPU, Memory, Disk usage
- Network traffic
- Container resource utilization
- Database performance

#### Security Dashboard:
- Authentication attempts
- Failed login rates
- Admin activity
- Suspicious patterns

#### Application Performance Dashboard:
- Page load times
- API response times
- Error rates
- User journey metrics

---

## Log Management

### 1. Log Aggregation

#### Loki Configuration:
```yaml
# File: monitoring/loki-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h
```

#### Promtail Configuration:
```yaml
# File: monitoring/promtail-config.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: cf1-frontend
    static_configs:
      - targets:
          - localhost
        labels:
          job: cf1-frontend
          __path__: /var/log/cf1-frontend/*.log

  - job_name: cf1-backend
    static_configs:
      - targets:
          - localhost
        labels:
          job: cf1-backend
          __path__: /var/log/cf1-backend/*.log

  - job_name: containers
    static_configs:
      - targets:
          - localhost
        labels:
          job: containerlogs
          __path__: /var/lib/docker/containers/*/*log
```

### 2. Log Structured Format

#### Application Logging:
```typescript
// Location: cf1-frontend/src/utils/logging.ts
interface LogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  duration?: number;
}

class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  log(level: LogEntry['level'], message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      context,
      requestId: this.getRequestId(),
      userId: this.getUserId()
    };

    console.log(JSON.stringify(entry));
  }

  error(message: string, context?: Record<string, any>) {
    this.log('ERROR', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('WARN', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('INFO', message, context);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('DEBUG', message, context);
  }
}

// Usage
const logger = new Logger('cf1-frontend');
logger.info('User logged in', { userId: 'user123', ip: '192.168.1.1' });
logger.error('Investment failed', { proposalId: 'prop456', amount: 1000 });
```

### 3. Log Retention

#### Retention Policies:
```yaml
# Loki retention configuration
table_manager:
  retention_deletes_enabled: true
  retention_period: 744h  # 31 days

# Log rotation
limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h  # 7 days
  ingestion_rate_mb: 4
  ingestion_burst_size_mb: 6
```

---

## Performance Monitoring

### 1. Application Performance

#### Frontend Performance:
```typescript
// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === 'navigation') {
      const navEntry = entry as PerformanceNavigationTiming;
      
      // Track page load metrics
      pageLoadTime.observe(
        { page: window.location.pathname },
        navEntry.loadEventEnd - navEntry.navigationStart
      );
      
      // Track specific timings
      const timings = {
        dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
        connection: navEntry.connectEnd - navEntry.connectStart,
        request: navEntry.responseStart - navEntry.requestStart,
        response: navEntry.responseEnd - navEntry.responseStart,
        processing: navEntry.domComplete - navEntry.domLoading,
        load: navEntry.loadEventEnd - navEntry.loadEventStart
      };
      
      Object.entries(timings).forEach(([metric, value]) => {
        performanceTimings.observe({ metric }, value);
      });
    }
  });
});

performanceObserver.observe({ entryTypes: ['navigation'] });
```

#### API Performance:
```typescript
// API performance tracking
const trackApiPerformance = (endpoint: string, duration: number, status: number) => {
  apiResponseTime.observe({ endpoint, status: status.toString() }, duration);
  
  if (status >= 400) {
    apiErrors.inc({ endpoint, status: status.toString() });
  }
};

// Usage in API calls
const apiCall = async (endpoint: string, options: RequestInit) => {
  const start = performance.now();
  
  try {
    const response = await fetch(endpoint, options);
    const duration = performance.now() - start;
    
    trackApiPerformance(endpoint, duration, response.status);
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    trackApiPerformance(endpoint, duration, 0);
    throw error;
  }
};
```

### 2. Database Performance

#### Connection Monitoring:
```typescript
// Database performance metrics
const dbMetrics = {
  connectionPoolSize: new Gauge({
    name: 'cf1_db_connection_pool_size',
    help: 'Database connection pool size'
  }),
  
  activeConnections: new Gauge({
    name: 'cf1_db_active_connections',
    help: 'Active database connections'
  }),
  
  queryDuration: new Histogram({
    name: 'cf1_db_query_duration_seconds',
    help: 'Database query duration',
    labelNames: ['query_type']
  })
};

// Monitor database operations
const trackDbQuery = (queryType: string) => {
  const start = Date.now();
  
  return {
    end: () => {
      const duration = (Date.now() - start) / 1000;
      dbMetrics.queryDuration.observe({ query_type: queryType }, duration);
    }
  };
};
```

---

## Health Checks

### 1. Application Health Checks

#### Frontend Health Check:
```typescript
// Location: cf1-frontend/src/health.ts
interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      time: string;
      output?: string;
    };
  };
}

export const healthCheck = async (): Promise<HealthStatus> => {
  const checks: HealthStatus['checks'] = {};
  
  // Check API connectivity
  try {
    const response = await fetch('/api/health', { timeout: 5000 });
    checks.api = {
      status: response.ok ? 'pass' : 'fail',
      time: new Date().toISOString(),
      output: response.ok ? 'API responsive' : `API returned ${response.status}`
    };
  } catch (error) {
    checks.api = {
      status: 'fail',
      time: new Date().toISOString(),
      output: `API connection failed: ${error.message}`
    };
  }
  
  // Check local storage
  try {
    localStorage.setItem('health-check', 'test');
    localStorage.removeItem('health-check');
    checks.storage = {
      status: 'pass',
      time: new Date().toISOString(),
      output: 'Local storage accessible'
    };
  } catch (error) {
    checks.storage = {
      status: 'fail',
      time: new Date().toISOString(),
      output: `Local storage failed: ${error.message}`
    };
  }
  
  // Determine overall status
  const hasFailures = Object.values(checks).some(check => check.status === 'fail');
  const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
  
  return {
    status: hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    checks
  };
};
```

#### Backend Health Check:
```typescript
// Location: cf1-frontend/backend/src/health.ts
import { Request, Response } from 'express';

export const healthCheck = async (req: Request, res: Response) => {
  const checks: Record<string, any> = {};
  
  // Check database connection
  try {
    // Perform database query
    await db.query('SELECT 1');
    checks.database = {
      status: 'pass',
      time: new Date().toISOString(),
      output: 'Database connection successful'
    };
  } catch (error) {
    checks.database = {
      status: 'fail',
      time: new Date().toISOString(),
      output: `Database connection failed: ${error.message}`
    };
  }
  
  // Check external services
  try {
    // Check AI analyzer
    const aiResponse = await fetch('http://cf1-ai-analyzer:8000/health');
    checks.ai_analyzer = {
      status: aiResponse.ok ? 'pass' : 'fail',
      time: new Date().toISOString(),
      output: aiResponse.ok ? 'AI analyzer responsive' : `AI analyzer returned ${aiResponse.status}`
    };
  } catch (error) {
    checks.ai_analyzer = {
      status: 'fail',
      time: new Date().toISOString(),
      output: `AI analyzer connection failed: ${error.message}`
    };
  }
  
  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  checks.memory = {
    status: memoryUsagePercentage > 90 ? 'fail' : memoryUsagePercentage > 75 ? 'warn' : 'pass',
    time: new Date().toISOString(),
    output: `Memory usage: ${memoryUsagePercentage.toFixed(1)}%`
  };
  
  // Determine overall status
  const hasFailures = Object.values(checks).some(check => check.status === 'fail');
  const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
  
  const status = hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';
  
  res.status(status === 'unhealthy' ? 503 : 200).json({
    status,
    timestamp: new Date().toISOString(),
    checks
  });
};
```

### 2. Custom Health Checker

The CF1 health checker service (`monitoring/health-checker/health_checker.py`) provides comprehensive health monitoring:

#### Features:
- **Service availability**: Checks all CF1 services
- **Response time monitoring**: Tracks service response times
- **Blockchain connectivity**: Monitors Neutron RPC endpoints
- **Database health**: Verifies database connections
- **Prometheus metrics**: Exposes health metrics

#### Usage:
```bash
# Start health checker
cd monitoring/health-checker
python health_checker.py

# View metrics
curl http://localhost:9091/metrics

# Check specific service
curl http://localhost:9091/health/cf1-frontend
```

---

## Operational Procedures

### 1. Deployment Procedures

#### Rolling Deployment:
```bash
# 1. Deploy to staging first
./deploy.sh staging

# 2. Run smoke tests
./run-smoke-tests.sh staging

# 3. Deploy to production
./deploy.sh production

# 4. Monitor deployment
watch -n 5 'curl -s http://localhost/health | jq .status'

# 5. Rollback if needed
./rollback.sh
```

#### Blue-Green Deployment:
```bash
# 1. Deploy to green environment
docker-compose -f docker-compose.green.yml up -d

# 2. Run health checks
./health-check.sh green

# 3. Switch traffic
./switch-traffic.sh green

# 4. Monitor metrics
./monitor-deployment.sh

# 5. Cleanup blue environment
docker-compose -f docker-compose.blue.yml down
```

### 2. Incident Response

#### Incident Classification:
- **P1 (Critical)**: Service completely down
- **P2 (High)**: Major feature not working
- **P3 (Medium)**: Minor issues, workarounds available
- **P4 (Low)**: Cosmetic issues, no user impact

#### Response Procedures:
```bash
# 1. Acknowledge incident
curl -X POST http://localhost:9093/api/v1/alerts/acknowledge

# 2. Check service status
./check-all-services.sh

# 3. View recent logs
docker-compose logs --since=1h cf1-frontend cf1-backend

# 4. Check metrics
./check-metrics.sh

# 5. Escalate if needed
./escalate-incident.sh
```

### 3. Backup Procedures

#### Database Backup:
```bash
# Daily backup
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup database
cp cf1-frontend/backend/data/cf1.db $BACKUP_DIR/

# Backup configurations
tar -czf $BACKUP_DIR/config.tar.gz .env.production monitoring/

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR s3://cf1-backups/$(date +%Y%m%d) --recursive
```

#### Configuration Backup:
```bash
# Configuration backup script
#!/bin/bash
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  .env.production \
  .env.development \
  cf1-frontend/backend/.env \
  cf1-ai-analyzer/.env \
  monitoring/ \
  docker-compose.yml \
  nginx.conf
```

---

## Troubleshooting

### 1. Common Issues

#### Service Not Starting:
```bash
# Check Docker status
docker ps -a

# Check logs
docker-compose logs cf1-frontend

# Check configuration
cat .env.production

# Restart service
docker-compose restart cf1-frontend
```

#### High Memory Usage:
```bash
# Check memory usage
docker stats

# Check for memory leaks
docker-compose exec cf1-backend npm run memory-profile

# Restart if needed
docker-compose restart cf1-backend
```

#### Database Connection Issues:
```bash
# Check database status
docker-compose exec cf1-backend npm run db:check

# Check database logs
docker-compose logs cf1-database

# Restart database
docker-compose restart cf1-database
```

### 2. Performance Issues

#### Slow API Response:
```bash
# Check API metrics
curl http://localhost:9090/api/v1/query?query=cf1_http_request_duration_seconds

# Check database queries
docker-compose exec cf1-backend npm run db:slow-queries

# Check system resources
docker stats cf1-backend
```

#### High Error Rate:
```bash
# Check error logs
docker-compose logs cf1-backend | grep ERROR

# Check error metrics
curl http://localhost:9090/api/v1/query?query=cf1_http_requests_total{status_code=~"5.."}

# Check recent deployments
git log --oneline -10
```

### 3. Monitoring Issues

#### Prometheus Not Collecting Metrics:
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check service metrics endpoints
curl http://localhost:3001/metrics
curl http://localhost:8000/metrics

# Restart Prometheus
docker-compose restart prometheus
```

#### Grafana Dashboard Not Loading:
```bash
# Check Grafana logs
docker-compose logs grafana

# Check Prometheus connection
curl http://localhost:3000/api/health

# Reset Grafana data
docker-compose stop grafana
docker volume rm monitoring_grafana_data
docker-compose start grafana
```

---

## Maintenance & Updates

### 1. Regular Maintenance

#### Daily Tasks:
```bash
# Check service health
./health-check.sh

# Review alerts
curl -s http://localhost:9093/api/v1/alerts | jq '.[] | select(.status.state == "firing")'

# Check disk space
df -h

# Review error logs
docker-compose logs --since=24h | grep ERROR
```

#### Weekly Tasks:
```bash
# Update dependencies
npm audit
npm update

# Clean up old logs
find /var/log -name "*.log" -mtime +7 -delete

# Check certificate expiry
openssl x509 -in /etc/ssl/certs/cf1platform.com.crt -text -noout | grep "Not After"

# Review performance metrics
./generate-performance-report.sh
```

#### Monthly Tasks:
```bash
# Full system backup
./full-backup.sh

# Security audit
npm audit --audit-level high

# Update Docker images
docker-compose pull
docker-compose up -d

# Review monitoring configuration
./review-monitoring-config.sh
```

### 2. Updates & Upgrades

#### Application Updates:
```bash
# 1. Backup current version
./backup-current-version.sh

# 2. Deploy to staging
git checkout main
git pull origin main
./deploy.sh staging

# 3. Run tests
./run-integration-tests.sh staging

# 4. Deploy to production
./deploy.sh production

# 5. Monitor deployment
./monitor-deployment.sh
```

#### Infrastructure Updates:
```bash
# Update monitoring stack
docker-compose -f docker-compose.monitoring.yml pull
docker-compose -f docker-compose.monitoring.yml up -d

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo apt install docker-ce docker-ce-cli containerd.io
```

---

## Conclusion

This comprehensive monitoring and operations guide provides:

- **Complete monitoring stack**: Metrics, logs, and alerts
- **Proactive alerting**: Early detection of issues
- **Operational procedures**: Standardized response processes
- **Troubleshooting guides**: Quick resolution of common issues
- **Maintenance schedules**: Regular upkeep procedures

The CF1 platform is equipped with enterprise-grade monitoring and operational capabilities, ensuring high availability and performance.

🔍 **CF1 Platform monitoring is production-ready with comprehensive observability and operational procedures.**

For additional support or questions, refer to the troubleshooting section or contact the operations team.