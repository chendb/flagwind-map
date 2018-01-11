const fs = require("fs");                                                               // node.js 文件系统模块
const path = require("path");                                                           // node.js 路径解析模块
const rimraf = require("rimraf");                                                       // 删除文件或目录工具
const chalk = require("chalk");                                                         // 颜色插件
const zlib = require("zlib");                                                           // js压缩
const uglify = require("uglify-js");                                                    // 压缩优化js文件插件
const rollup = require("rollup");                                                       // 模块打包工具
const replace = require("rollup-plugin-replace");                                       // 查找和替换的工具
const version = process.env.VERSION || require("../package.json").version;              // 版本信息
const resolve = _path => path.resolve(__dirname, "../", _path);                         // 绝对路径解析
const distPath = resolve("dist/");                                                      // dist路径

const banner =
`/*!
* flagwind-map v${version} 
* 
* Authors:
*      chendebao <hbchendb1985@gmail.com>
* 
* Licensed under the MIT License.
* Copyright (C) 2018-${new Date().getFullYear()} Flagwind Inc. All rights reserved. 
*/`;

/**
 * 获取代码大小
 * @param {*} code 
 */
const getSize = function(code)
{
    return (code.length / 1024).toFixed(2) + "kb";
};

const write = function(dest, code, zip)
{
    return new Promise((resolve, reject) =>
    {
        function report(extra)
        {
            // 输出目标路径 文件大小 自定义消息
            console.log(chalk.cyan(path.relative(process.cwd(), dest)) + " " + getSize(code) + (extra || ""));
            
            resolve();
        }

        fs.writeFile(dest, code, (error) =>
        {
            if(error)
            {
                return reject(error);
            }

            if(zip)
            {
                zlib.gzip(code, (error, zipped) =>
                {
                    if(error)
                    {
                        return reject(error);
                    }
                    
                    report(" (gzipped: " + getSize(zipped) + ")");
                })
            }
            else
            {
                report();
            }
        })
    })
};

const buildEntry = function({input, output})
{
    const isProd = /min\.js$/.test(output.file);
    
    // 模块打包
    return rollup.rollup(input)
        .then(bundle => bundle.generate(output))
        .then(({code}) =>
        {
            // min 处理
            if(isProd)
            {
                const minified = uglify.minify(code,
                {
                    output:
                    {
                        preamble: output.banner,
                        ascii_only: true
                    }
                }).code;

                return write(output.file, minified, true);
            }
            else
            {
                return write(output.file, code);
            }
        })
};

const buildDeclaration = function()
{
    const sourceFile = resolve("bin/flagwind-map.d.ts");
    const destPath = resolve("dist/flagwind-map.d.ts");
    const readStream = fs.createReadStream(sourceFile);
    const writeStream = fs.createWriteStream(destPath);

    readStream.pipe(writeStream, { end: false});

    readStream.on("end", () => 
    {
        writeStream.end("\nexport default flagwind;\n");
    });
};

const build = function(builds)
{
    let built = 0;
    const total = builds.length;

    const next = () =>
    {
        buildEntry(builds[built])
        .then(() =>
        {
            built++;

            if(built < total)
            {
                next();
            }
        })
        .catch((error)=>
        {
            // 输出构建错误
            console.log(chalk.red("Build failed with errors.\n"));
            
            // 退出进程
            process.exit(1);
        });
    }

    next();
};

const genConfig = function(opts)
{
    const config = 
    {
        input:
        {
            input: resolve("bin/flagwind-map.js"),
            context: "this",
            plugins: []
        },
        output: 
        {
            file: opts.file,
            format: opts.format,
            banner,
            outro: opts.outro || "",
            name: "flagwind",
            exports: "named"
        }
    };

    if(opts.env)
    {
        config.input.plugins.unshift(replace({"process.env.NODE_ENV": JSON.stringify(opts.env)}));
    }

    return config;
};

// 先清空构建目录
rimraf(distPath, (error) =>
{
    if(error)
    {
        throw error;
    }

    // 重新建立构建目录
    fs.mkdirSync("dist");

    // 生成代码
    build([
        {
            file: resolve("dist/flagwind-map.js"),
            format: "umd",
            outro: "exports['default'] = flagwind;",
            env: 'development'
        },
        {
            file: resolve("dist/flagwind-map.min.js"),
            format: "umd",
            outro: "exports['default'] = flagwind;",
            env: 'production'
        }
    ].map(genConfig));

    // 生成申明文件
    buildDeclaration();
});
