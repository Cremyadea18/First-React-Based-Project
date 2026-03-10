import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Definimos la entrada principal (si cambiaste main.jsx a main.tsx, cámbialo aquí también)
      input: './src/main.jsx', 
      output: {
        // Archivo principal que WordPress va a cargar
        entryFileNames: 'index.js',
        // Los chunks deben tener un nombre distinto para no chocar
        chunkFileNames: 'chunks/[name].js',
        // Estilos y otros archivos
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'index.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
})