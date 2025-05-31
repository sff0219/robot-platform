#!/bin/bash
set -e

sudo -v

echo "Deleting all existing Kubernetes resources"
minikube delete
echo "Starting minikube"
minikube start --driver=docker

echo "Enabling ingress addon in minikube"
minikube addons enable ingress

echo "Setting up docker env to build images inside minikube"
eval $(minikube docker-env)

echo "Building robot-service docker image"
docker build -t robot-service:latest ./robot-service

echo "Building dashboard docker image"
docker build -t dashboard:latest ./dashboard

echo "Applying Kubernetes manifests"
echo "Deploying robot-service"
kubectl apply -f k8s/robot-service/deployment.yaml
kubectl apply -f k8s/robot-service/service.yaml
kubectl apply -f k8s/robot-service/ingress.yaml

echo "Deploying dashboard"
kubectl apply -f k8s/dashboard/deployment.yaml
kubectl apply -f k8s/dashboard/service.yaml
kubectl apply -f k8s/dashboard/ingress.yaml

echo "Deploying Prometheus, Promtail and loki"
kubectl apply -f k8s/observability/prometheus-config.yaml
kubectl apply -f k8s/observability/prometheus.yaml
kubectl apply -f k8s/observability/loki.yaml
kubectl apply -f k8s/observability/promtail.yaml

MINIKUBE_IP=$(minikube ip)
HOSTS_LINE="$MINIKUBE_IP robot.local dashboard.local"
# Remove existing entries for robot.local or dashboard.local
sudo sed -i '/robot\.local/d' /etc/hosts
sudo sed -i '/dashboard\.local/d' /etc/hosts
echo "Adding robot.local and dashboard.local to /etc/hosts"
echo "$HOSTS_LINE" | sudo tee -a /etc/hosts

echo "Waiting for pods to be ready"
kubectl wait --for=condition=ready pod -l app=robot-service --timeout=60s
kubectl wait --for=condition=ready pod -l app=dashboard --timeout=60s
kubectl wait --for=condition=ready pod -l app=prometheus --timeout=60s
kubectl wait --for=condition=ready pod -l app=loki --timeout=60s
kubectl wait --for=condition=ready pod -l app=promtail --timeout=60s

echo "Setup complete!"
echo "The robot-service API is available at http://robot.local"
echo "The dashboard is available at http://dashboard.local"
