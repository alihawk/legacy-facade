/**
 * Package.json template for the standalone proxy server
 *
 * This generates a Node.js/Express proxy server that can be deployed
 * alongside the generated admin portal to forward requests to legacy APIs.
 */
export function generateProxyPackageJson() {
    const packageJson = {
        name: "admin-portal-proxy",
        version: "1.0.0",
        type: "module",
        scripts: {
            start: "tsx src/index.ts",
            dev: "tsx watch src/index.ts"
        },
        dependencies: {
            express: "^4.18.2",
            cors: "^2.8.5",
            "node-fetch": "^3.3.2",
            "xml2js": "^0.6.2"
        },
        devDependencies: {
            "@types/express": "^4.17.21",
            "@types/cors": "^2.8.17",
            tsx: "^4.7.0",
            typescript: "^5.3.3"
        }
    };
    return JSON.stringify(packageJson, null, 2);
}
