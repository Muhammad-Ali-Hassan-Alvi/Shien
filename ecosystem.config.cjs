module.exports = {
    apps: [
        {
            name: "imart",
            script: "server.js",
            cwd: __dirname,
            env: {
                NODE_ENV: "production",
                PORT: "5000",
            },
            instances: 1,
            autorestart: true,
            max_memory_restart: "600M",
        },
    ],
};
