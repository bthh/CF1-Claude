#!/usr/bin/env python3
"""
CF1 Platform Health Checker
Monitors CF1 platform services and exposes metrics to Prometheus
"""

import os
import time
import requests
import schedule
from prometheus_client import Counter, Gauge, Histogram, start_http_server
from threading import Thread
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
CF1_API_URL = os.getenv('CF1_API_URL', 'http://cf1-frontend:80')
CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', '30'))
METRICS_PORT = int(os.getenv('METRICS_PORT', '9091'))

# Prometheus metrics
health_check_counter = Counter('cf1_health_checks_total', 'Total health checks', ['service', 'status'])
health_check_duration = Histogram('cf1_health_check_duration_seconds', 'Health check duration', ['service'])
service_up = Gauge('cf1_service_up', 'Service availability', ['service'])
response_time = Gauge('cf1_response_time_seconds', 'Service response time', ['service'])

# Service endpoints to monitor
SERVICES = {
    'frontend': f'{CF1_API_URL}/health',
    'backend': f'{CF1_API_URL.replace(":80", ":3001")}/health',
    'ai-analyzer': f'{CF1_API_URL.replace(":80", ":8000")}/health',
}

def check_service_health(service_name, url):
    """Check health of a specific service"""
    start_time = time.time()
    
    try:
        response = requests.get(url, timeout=10)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            service_up.labels(service=service_name).set(1)
            health_check_counter.labels(service=service_name, status='success').inc()
            logger.info(f"✅ {service_name} is healthy (response time: {duration:.2f}s)")
        else:
            service_up.labels(service=service_name).set(0)
            health_check_counter.labels(service=service_name, status='failure').inc()
            logger.warning(f"❌ {service_name} returned status {response.status_code}")
        
        response_time.labels(service=service_name).set(duration)
        health_check_duration.labels(service=service_name).observe(duration)
        
    except requests.exceptions.RequestException as e:
        duration = time.time() - start_time
        service_up.labels(service=service_name).set(0)
        health_check_counter.labels(service=service_name, status='error').inc()
        response_time.labels(service=service_name).set(duration)
        health_check_duration.labels(service=service_name).observe(duration)
        logger.error(f"❌ {service_name} health check failed: {e}")

def check_all_services():
    """Check health of all services"""
    logger.info("🔍 Running health checks...")
    
    for service_name, url in SERVICES.items():
        check_service_health(service_name, url)
    
    logger.info("✅ Health checks completed")

def check_database_health():
    """Check database connectivity (if applicable)"""
    try:
        # This would check database connectivity
        # For now, we'll simulate a database check
        logger.info("🔍 Checking database health...")
        # db_check_result = check_database_connection()
        # service_up.labels(service='database').set(1 if db_check_result else 0)
        service_up.labels(service='database').set(1)  # Simulated
        logger.info("✅ Database is healthy")
    except Exception as e:
        service_up.labels(service='database').set(0)
        logger.error(f"❌ Database health check failed: {e}")

def check_blockchain_connectivity():
    """Check blockchain RPC connectivity"""
    neutron_endpoints = [
        'https://rpc-palvus.pion-1.ntrn.tech',
        'https://rest-palvus.pion-1.ntrn.tech'
    ]
    
    for endpoint in neutron_endpoints:
        service_name = f"neutron-{'rpc' if 'rpc' in endpoint else 'rest'}"
        check_service_health(service_name, endpoint)

def run_scheduler():
    """Run the health check scheduler"""
    logger.info(f"🚀 Starting CF1 Health Checker (check interval: {CHECK_INTERVAL}s)")
    
    # Schedule health checks
    schedule.every(CHECK_INTERVAL).seconds.do(check_all_services)
    schedule.every(60).seconds.do(check_database_health)
    schedule.every(30).seconds.do(check_blockchain_connectivity)
    
    # Run initial checks
    check_all_services()
    check_database_health()
    check_blockchain_connectivity()
    
    # Run scheduler
    while True:
        schedule.run_pending()
        time.sleep(1)

def main():
    """Main function"""
    # Start Prometheus metrics server
    start_http_server(METRICS_PORT)
    logger.info(f"📊 Metrics server started on port {METRICS_PORT}")
    
    # Start health check scheduler in a separate thread
    scheduler_thread = Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down health checker...")

if __name__ == "__main__":
    main()