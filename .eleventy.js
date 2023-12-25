'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

function slugify(s) {
    return encodeURIComponent(
        String(s).trim().toLowerCase()
        .replace(/[\(\)]/g, '')
        .replace(/\s+/g, '-')
    );
}

function clearDirectory(directory) {
  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        fs.unlinkSync(filePath);
      } else if (stat.isDirectory()) {
        clearDirectory(filePath);
        fs.rmdirSync(filePath);
      }
    });
  }
}

module.exports = function(eleventyConfig) {
  const src = process.env.publicDIR || '.';
  eleventyConfig.addPassthroughCopy(src+"/public/css/*.css");
  eleventyConfig.addPassthroughCopy(src+"/public/js");
  eleventyConfig.addPassthroughCopy(src+"/public/img");
  eleventyConfig.addPassthroughCopy(src+"/public/fonts");
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.setLibrary("md",
    markdownIt({
      html: true,
      linkify: true,
      typographer: true
    }).use(markdownItAnchor, {
        slugify: slugify
    })
  );
 // 清除 CSS 文件夹下的所有文件
  eleventyConfig.on('beforeBuild', () => {
    const outputDir = 'dist'; // 输出目录路径
    const cssDir = `public/css`; // CSS 文件所在目录路径

    const files = `${outputDir}/${cssDir}`;
    clearDirectory(files);
  })
  if(process.env.MY_ENVIRONMENT === 'production') {
    eleventyConfig.on('afterBuild', () => {
      const outputDir = 'dist'; // 输出目录路径
      const cssDir = 'public/css'; // CSS 文件所在目录路径
  
      const files = fs.readdirSync(`${outputDir}/${cssDir}`);
  
      const random = crypto.randomBytes(4).toString('hex');
  
      files.forEach(file => {
        if (file.endsWith('.css')) {
          const filePath = `${outputDir}/${cssDir}/${file}`;
          const randomFilename = file.replace('.css', `-${random}.css`);
          const randomFilePath = `${outputDir}/${cssDir}/${randomFilename}`;
  
          fs.renameSync(filePath, randomFilePath);
        }
      });
      const filePath = `${outputDir}/index.html`;
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      const updatedContent = htmlContent.replace(/(<link\s+[^>]*href=")(?!https)([^"]+)(\.css)"/g, (match, prefix, filename, extension) => {
        const updatedFilename = `${filename}-${random}${extension}`;
        return `${prefix}${updatedFilename}"`;
      });
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    });
  }
 
  return {
    dir: {
      output: "dist"
    }
  }
};
