#!/bin/bash

# Script to start the FastAPI backend locally for testing

echo "Starting AutoGKB Backend API..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found!"
    echo "Please create a .env file with your API keys."
    echo "See .env.example for reference."
    echo ""
    exit 1
fi

# Check if python is available
if ! command -v python &> /dev/null; then
    echo "Error: Python is not installed or not in PATH"
    exit 1
fi

# Check if uvicorn is installed
if ! python -c "import uvicorn" &> /dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo ""
fi

# Load environment variables from .env
export $(cat .env | grep -v '^#' | xargs)

# Create logs directory
mkdir -p logs

# Start the server
echo "Starting server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""
uvicorn api.main:app --reload --port 8000
