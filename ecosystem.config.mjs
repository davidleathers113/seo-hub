export default {
  apps: [
    {
      name: 'content-creation-server',
      cwd: './server',
      script: 'node_modules/.bin/ts-node',
      args: 'server.js',
      watch: ['**/*.ts', '**/*.js'],
      ignore_watch: ['node_modules', 'logs'],
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    },
    {
      name: 'content-creation-client',
      cwd: './client',
      script: 'npm',
      args: 'run dev',
      watch: false, // Vite handles its own watching
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }
  ]
};