var gulp = require("gulp"),
	webpack = require("gulp-webpack"),
	postcss = require("gulp-postcss"),
	px2rem = require("postcss-px2rem"),
	gulpLoadPlugins = require("gulp-load-plugins"),
	plugins = gulpLoadPlugins(),
	browserSync = require("browser-sync").create(),
	reload = browserSync.reload,
	tinypng = require('gulp-tinypng-compress'),
	imageminJpegRecompress = require("imagemin-jpeg-recompress"),
	imageminOptipng = require("imagemin-optipng"),
	spritesmith=require('gulp.spritesmith'),
	imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    base64 = require('gulp-base64'),
	postplus = [
		px2rem({
			remUnit: 75
		})
	];

//清除dist下的所有文件
gulp.task("clean", function() {
    //return gulp.src(["dist/css/*", "dist/js/*", "dist/images/*"])
    //.pipe(plugins.clean());
    return gulp.src(["dist/css/*", "dist/js/*","dist/cn/*"])
        .pipe(plugins.clean());
});

gulp.task("default", ["starts"], function() {
    var files = [
        '*.*'
    ];
    browserSync.init({
        server: {
            baseDir: "./dist",
            index: "index.html"
        }
    });
    gulp.watch("html/scss/**/*", ["starts"]).on("change", reload);
    gulp.watch("html/js/**/*", ["starts"]).on("change", reload);
    gulp.watch("html/cn/**/*", ["starts"]).on("change", reload);
    gulp.watch("html/index.html", ["starts"]).on("change", reload);
});
//启动所有任务
gulp.task("starts", ["clean"], function() {
    return gulp.start("testImagemin","base64","rev-html")
});




//解析sass
gulp.task("sass", function() {
    //解析sass为css
    return gulp.src("html/scss/*.scss")
    // .pipe(plugins.changed("dist/css/", {extension: ".css"}))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 10', 'ios 5', 'android 4'],
            cascade: true,
            remove: true
        }))
        //px转换成rem
        .pipe(plugins.sass())
        // .pipe(postcss(postplus))
        // .pipe(plugins.cssmin())
        .pipe(plugins.rev())
        .pipe(gulp.dest("dist/css/"))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest("dist/rev-css"));
});

gulp.task('base64', function() { 
    // return gulp.src("dist/css/*.css") 
    // .pipe(base64({
    //       baseDir:'dist',
    //       extensions: ['svg', 'png','jpg',/\.jpg#datauri$/i],
    //       exclude:    [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
    //       maxImageSize: 20 * 1024,
    //       debug: false ,
    // })) 
    // .pipe(gulp.dest("dist/css/"));
});

//压缩图片
gulp.task('testImagemin', function () {
    gulp.src('html/images/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/images'));
});


//替换js
gulp.task("jsonjs", ["js", "sass", "otherjs"], function() {
    return gulp.src(["dist/rev-css/*.json", "dist/js/*.json", "html/*.html"])
        .pipe(plugins.revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest('dist/'));
});
//替换cn的js
gulp.task("jsoncnjs", ["js", "sass", "otherjs"], function() {
    return gulp.src(["dist/rev-css/*.json", "dist/js/*.json", "html/cn/*.html"])
    // .pipe(plugins.changed("dist/cn/", {extension: ".html"}))
        .pipe(plugins.revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest('dist/cn/'));
});
//将css和js放在指定的html文件中
gulp.task("rev-html", ["jsonjs", "jsoncnjs"], function() {
    return gulp.src("html/template/**/*")
        .pipe(gulp.dest('dist/template/'))
        .pipe(reload({stream: true}));
});
//结合webpack
gulp.task("js", ["es5"], function() {
    return gulp.src("html/js/")
    // .pipe(plugins.changed("dist/js/", {extension: ".js"}))
        .pipe(webpack(require("./webpack.config.js")))
        .pipe(gulp.dest("dist/js/"));
});
//返回其他js
gulp.task("otherjs", ["es5"], function() {
    gulp.src("html/js/common/**/*")
    //.pipe(plugins.changed("dist/js/common/", {extension: ".js"}))
        .pipe(gulp.dest("dist/js/common/"));

    gulp.src("html/js/function/**/*")
    //.pipe(plugins.changed("dist/js/function/", {extension: ".js"}))
        .pipe(gulp.dest("dist/js/function/"));
});
//ES6转化成ES5
gulp.task("es5", function() {
    return gulp.src("html/jsx/*.jsx")
        .pipe(plugins.react())
        .pipe(plugins.babel({
            "presets": ["es2015"]
        }))
        .pipe(gulp.dest("html/js/"));
});



