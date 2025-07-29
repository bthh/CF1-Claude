#!/bin/bash

# CF1 Platform Monitoring Startup Script
# This script starts all monitoring components for production deployment

set -e

echo "🚀 Starting CF1 Platform Monitoring Infrastructure..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if required directories exist
if [ ! -d "monitoring" ]; then
    echo "❌ Monitoring directory not found. Please run this script from the project root."
    exit 1
fi

# Create necessary directories
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources
mkdir -p monitoring/logs

# Create Grafana datasource configuration
cat > monitoring/grafana/datasources/datasources.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: true
EOF

# Create Grafana dashboard configuration
cat > monitoring/grafana/dashboards/dashboard.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

# Create Loki configuration
cat > monitoring/loki-config.yaml << EOF
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

query_range:
  results_cache:
    cache:
      embedded_cache:
        enabled: true
        max_size_mb: 100

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://alertmanager:9093
EOF

# Create Promtail configuration
cat > monitoring/promtail-config.yaml << EOF
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: containers
    static_configs:
      - targets:
          - localhost
        labels:
          job: containerlogs
          __path__: /var/lib/docker/containers/*/*log

    pipeline_stages:
      - json:
          expressions:
            output: log
            stream: stream
            attrs:
      - json:
          expressions:
            tag:
          source: attrs
      - regex:
          expression: (?P<container_name>(?:[^|]*))\|
          source: tag
      - timestamp:
          format: RFC3339Nano
          source: time
      - labels:
          stream:
          container_name:
      - output:
          source: output

  - job_name: syslog
    static_configs:
      - targets:
          - localhost
        labels:
          job: syslog
          __path__: /var/log/syslog
EOF

# Pull latest images
echo "📦 Pulling Docker images..."
docker-compose -f docker-compose.monitoring.yml pull

# Start monitoring stack
echo "🚀 Starting monitoring services..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
services=("prometheus:9090" "grafana:3000" "loki:3100" "alertmanager:9093")

for service in "${services[@]}"; do
    if curl -sf "http://localhost:${service##*:}/api/v1/status/buildinfo" >/dev/null 2>&1 || \
       curl -sf "http://localhost:${service##*:}" >/dev/null 2>&1; then
        echo "✅ ${service%%:*} is healthy"
    else
        echo "⚠️  ${service%%:*} may not be ready yet"
    fi
done

# Display access information
echo ""
echo "🎉 CF1 Platform Monitoring is now running!"
echo "================================================================"
echo "📊 Prometheus:     http://localhost:9090"
echo "📈 Grafana:        http://localhost:3000 (admin/cf1-admin-password)"
echo "📋 AlertManager:   http://localhost:9093"
echo "🔍 Logs (Loki):    http://localhost:3100"
echo "🏥 Health Checker: http://localhost:9091/metrics"
echo "================================================================"
echo ""
echo "📝 Next steps:"
echo "1. Configure Grafana dashboards for CF1 metrics"
echo "2. Set up Slack/email notifications in AlertManager"
echo "3. Add custom alerts for business metrics"
echo "4. Configure log retention policies"
echo ""
echo "🔧 To stop monitoring: docker-compose -f docker-compose.monitoring.yml down"
echo "🔄 To restart: ./start-monitoring.sh"
echo "📊 To view logs: docker-compose -f docker-compose.monitoring.yml logs -f [service]"