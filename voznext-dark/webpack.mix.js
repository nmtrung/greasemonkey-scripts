const mix = require('laravel-mix');
// require('laravel-mix-purgecss');

// mix.sass('darkmode.scss', 'dist')
// .purgeCss({
//     content: [],
//     css: ['dist/darkmode.css'],
//     whitelist: ["html", "body"],
// })
// ;
mix.sass('darkmode.scss', 'dist');

mix.options({
    postCss: [
        require('postcss-discard-comments')({ removeAll: true }),
        require('postcss-unmq'),
        require('postcss-combine-duplicated-selectors')({removeDuplicatedProperties: true}),
        // require('postcss-discard-duplicates'),
    ],
});
