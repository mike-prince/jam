// PostCSS plugins
// ===============
const postCSSPlugins = `['autoprefixer', 'rucksack-css']`


// File paths
// ==========

const srcDir = {
  root: 'src',
  templates: 'src/templates',
  styles: 'src/styles',
  scripts: 'src/scripts',
  media: 'src/media'
}

const dstDir = {
  root: 'dist',
  templates: 'dist',
  styles: 'dist/assets',
  scripts: 'dist/assets',
  media: 'dist/media'
}


// Script config
// =============

module.exports = {
  scripts: {


    // Utils
    // =====
    // 1. Delete output directory.
    // 2. Delete output directory, node_modules and package-lock.json.
    // 3. Create styles output directory. The Stylus CLI doesn't appear to create intermediate directories.

    clean: `rm -rf ${dstDir.root}`, // 1
    nuke: `nps clean; rm -rf ./node_modules; rm -f package-lock.json`, // 2
    setup: `mkdir -p ${dstDir.styles}`, // 3


    // Build tasks
    // ===========
    // Delete output directory and transpile source code.

    build: {
      default: `nps clean && nps setup && nps build.html; nps build.css; nps build.js; nps build.img`,
      html: `pug ${srcDir.templates} --basedir ${srcDir.root} --out ${dstDir.templates} --pretty --silent`,
      css: `stylus ${srcDir.styles}/main.styl --include src --include-css --use poststylus --with "${postCSSPlugins}" --out ${dstDir.styles}/main.css > /dev/null`,
      js: `rollup --sourcemap --input ${srcDir.scripts}/main.js --output.file ${dstDir.scripts}/main.js --output.format cjs`,
      img: `rsync -ru --delete-before ${srcDir.media} ${dstDir.media}`
    },


    // Dev build
    // =========
    // Run build tasks, watches for changes and starts server.

    dev: {
      default: `nps build && nps dev.serve & nps dev.watch`,
      watch: {
        default: `nps dev.watch.html & nps dev.watch.css & nps dev.watch.js & nps dev.watch.img`,
        html: `chokidar '${srcDir.templates}/**/*.pug' -c 'nps build.html'`,
        css: `chokidar '${srcDir.styles}/**/*.styl' -c 'nps build.css'`,
        js: `chokidar '${srcDir.scripts}/**/*.js' -c 'nps build.js'`,
        img: `chokidar '${srcDir.media}/media/**/*' -c 'nps build.img'`
      },
      serve: `browser-sync start --server ${dstDir.root} --files ${dstDir.root} --no-ui --no-notify`
    },


    // Production build
    // ================
    // Run build tasks, compressing output.

    production: {
      default: `nps clean && nps setup & nps production.html; nps production.css; nps production.js && nps production.js_uglify`,
      html: `pug ${srcDir.templates} --basedir ${srcDir.root} --out ${dstDir.root}`,
      css: `nps build.css && cleancss ${dstDir.styles}/main.css -o ${dstDir.styles}/main.css`,
      js: `rollup --input ${srcDir.scripts}/main.js --output.file ${dstDir.scripts}/main.js --output.format cjs`,
      js_uglify: `uglifyjs --compress --verbose ${dstDir.scripts}/main.js --output ${dstDir.scripts}/main.js`,
      img: `nps build.img`
    },


    // Release
    // =======
    // Increments package.json version and commits.

    release: {
      patch: `npm version patch -m 'Patch release %s'`,
      minor: `npm version minor -m 'Minor release %s'`,
      major: `npm version major -m 'Major release %s'`
    }
  }
}
