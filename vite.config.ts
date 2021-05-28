import {defineConfig} from 'vite';
import json from '@rollup/plugin-json';
import {babel} from '@rollup/plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import vue from '@vitejs/plugin-vue';
import ts2 from 'rollup-plugin-typescript2';
import {injectHtml} from 'vite-plugin-html';

// @ts-ignore
import dotenv from 'dotenv';

const path = require('path');
const fs = require('fs');

try {
  // 根据环境变量加载环境变量文件
  const file = dotenv.parse(fs.readFileSync(`.env.${process.env.BUILD_TARGET}`));
  // 根据获取的key给对应的环境变量赋值
  for (const key in file as object) {
    process.env[key] = file[key];
  }
} catch (e) {
  console.error(e);
}

console.log(process.env.VITE_APP_DEV_EXCLUDE)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    json(),
    {
      ...ts2({
        check: true,
        tsconfig: path.resolve(__dirname, 'tsconfig.json'), // your tsconfig.json path
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: false,
            declaration: true,
            declarationMap: false,
            declarationDir: 'dist',
          }
        },
        exclude: process.env.VITE_APP_DEV_EXCLUDE === 'example' ? ['example/**/*.ts'] : []
      }),
      enforce: 'pre'
    },
    babel({
      exclude: 'node_modules/**', // 只编译源代码
      extensions: ['.ts', '.vue', '.js'],
      babelHelpers: 'runtime'
    }),
    injectHtml({
      injectData: {
        entry: process.env.VITE_APP_DEV_ENTRY
      }
    }),
    nodeResolve(),
    commonjs()
  ],
  build: {
    target: 'es2015',
    outDir: 'dist',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.ts'),
      output: [
        {
          // Provide global variables to use in the UMD build
          // for externalized deps
          exports: 'auto',
          format: 'umd',
          entryFileNames: 'index.js',
          name: 'IndexDB',
        }
      ]
    },
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      name: 'IndexDB',
      fileName: 'index'
    },
    terserOptions: {
      ecma: 2016
    }
  }
})
