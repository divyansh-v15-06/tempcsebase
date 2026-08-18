// PM2 Process Manager Configuration for CSE Department Platform
module.exports = {
  apps: [
    {
      name: 'tempcse-backend',
      cwd: './userService',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        BACKEND_PORT: 3001,
        DB_HOST: '127.0.0.1',
        DB_PORT: 3306,
        DB_NAME: 'cse_department',
        DB_USER: 'cse_app',
        DB_PASSWORD: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'webmaster.cse@nith.ac.in',
        ADMIN_EMAIL_PASSWORD: process.env.ADMIN_EMAIL_PASSWORD,
        RESET_LINK_BASE: 'https://tempcse.nith.ac.in/reset-password',
        REQUIRE_AUTH_WRITES: 'false',
        CORS_ORIGIN: '*'
      }
    },
    {
      name: 'tempcse-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: '/backend'
      }
    }
  ]
};
