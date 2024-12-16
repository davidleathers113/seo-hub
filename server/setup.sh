#!/bin/bash

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase
    else
        curl -s https://raw.githubusercontent.com/supabase/supabase/master/install.sh | bash
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Start Supabase services
echo "Starting Supabase services..."
supabase start

# Set environment variables
echo "Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Setup completed successfully!"
echo "You can now run 'npm run dev' to start the development server"
