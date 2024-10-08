import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@artifacts': path.resolve(__dirname, '../../UspTokenContract/artifacts/contracts')
        }
    },
    build: {
        rollupOptions: {
            external: [
                '@artifacts/USPToken.sol/USPToken.json' 
            ]
        }
    }
});
