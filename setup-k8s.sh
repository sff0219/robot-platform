#!/bin/bash
set -e

sudo -v

echo "Deleting all existing Kubernetes resources"
minikube delete
echo "Satrting minikube"
minikube start --driver=docker

echo "Enabling ingress addon in minikube"
minikube addons enable ingress

echo "Setting up docker env to build images inside minikube"
eval $(minikube docker-env)

echo "Building robot-service docker image"
docker build -t robot-service:latest ./robot-service

echo "Applying Kubernetes manifests"
kubectl apply -f k8s/robot-service/deployment.yaml
kubectl apply -f k8s/robot-service/service.yaml
kubectl apply -f k8s/ingress.yaml

MINIKUBE_IP=$(minikube ip)
echo "Adding robot.local to /etc/hosts"
if grep -q "robot.local" /etc/hosts; then
    sudo sed -i "s/.*robot.local/$MINIKUBE_IP robot.local/" /etc/hosts
else
    echo "$MINIKUBE_IP robot.local" | sudo tee -a /etc/hosts
fi

echo "Waiting for pods to be ready"
kubectl wait --for=condition=ready pod -l app=robot-service --timeout=60s

echo "Setup complete! The robot-service APPI is available at http://robot.local"
