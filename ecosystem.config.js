module.exports = {
  apps: [
    {
      name: "mekongsmile-frontend",
      script: ".next/standalone/server.js",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
