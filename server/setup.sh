#!/bin/bash

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install postgresql@14
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
        sudo service postgresql start
    else
        echo "Unsupported operating system"
        exit 1
    fi
fi

# Start PostgreSQL service
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services restart postgresql@14
    # Wait for PostgreSQL to start
    sleep 5
    # Create postgres user if it doesn't exist
    createuser -s postgres || true
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo service postgresql restart
    sleep 5
fi

# Install PostgreSQL dependencies
npm install pg @types/pg

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=content_creation_app
DB_PASSWORD=postgres
DB_PORT=5432
JWT_SECRET=your-secret-key
EOL
fi

# Create database if it doesn't exist
echo "Creating database..."
createdb -U postgres content_creation_app || true

# Run migrations
echo "Running migrations..."
npx ts-node database/migrations/run.ts

echo "Setup complete!"
