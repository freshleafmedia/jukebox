#!/usr/bin/env node

const path = require('path')
const esbuild = require('esbuild');
const {sassPlugin} = require('esbuild-sass-plugin');
const assetsManifest = require('esbuild-plugin-manifest');

const esbuildOptions = {
    logLevel: 'info',
    entryPoints: [
        "resources/css/app.scss",
    ],
    bundle: true,
    color: true,
    minify: false,
    sourcemap: true,
    platform: 'browser',
    outdir: 'public/assets',
    entryNames: '[name]-[hash]',
    loader: {
        '.svg': 'file',
        '.png': 'file',
    },
    plugins: [
        assetsManifest(),
        sassPlugin({
            precompile(source, pathname) {
                return source.replace(/(url\(['"])(\.\.?\/)([^'"]+['"]\))/g, `$1${path.dirname(pathname)}/$2$3`)
            },
        }),
    ],
};

esbuild
    .context(esbuildOptions)
    .then(async (ctx) => {
        await ctx.watch();
    });
