import { defineConfig, type BuildOptions } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// 显式定义 build 配置的类型，避免字面量类型推断错误
const buildConfig: BuildOptions = {
    lib: {
        entry: resolve(__dirname, 'src/lib/index.ts'),
        name: 'MaplibreTDT',
        fileName: (format) => `maplibre-tianditu.${format}.js`,
        formats: ['es', 'umd'] as const, // 字面量类型断言，避免 TS 推断为 string[]
    },
    rollupOptions: {
        external: [], // 打包 maplibre-gl 到库中
        treeshake: false, // 避免漏打包依赖
        output: {
            globals: {},
            compact: true,
            banner: '/*! maplibre-tianditu - MIT License */',
            preserveModules: false,
        },
    },
    minify: "terser", // 关键：使用字符串字面量（而非普通字符串）
    sourcemap: false,
    emptyOutDir: true,
    modulePreload: {
        polyfill: false,
    },
}

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
            outDir: 'dist',
            copyDtsFiles: true,
        }),
    ],
    build: buildConfig,
    server: {
        port: 3000,
        open: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
        mainFields: ['module', 'main', 'browser'] as const,
    },
})
