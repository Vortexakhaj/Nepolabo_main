const { src, dest, series } = require('gulp');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');

const handlebars = require('gulp-compile-handlebars');
const htmlmin = require('gulp-htmlmin');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

const csvparse = require('csv-parse/lib/sync');
const message_csv_file = 'src/messages.csv';
const fs = require('fs').promises;

const countries = require("i18n-iso-countries");

const imagemin = require('gulp-imagemin');

function minifycss() {
    return src('src/*.css')
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(dest('dist'));
}

const postageOverrides = {
    /* note: canada uses a P in a maple leaf and we have to handle this in the hbs file. */
    us: "$1.20",
    jp: "84",
    ar: "$65",
    br: "R$2,05",
    cn: "1.20",
    de: "100",
    fr: "€1.30",
    gb: "£4.20",
    hk: "$5",
    id: "5000",
    in: "500",
    it: "[B]",
    kr: "840",
    mx: "$15.00",
    my: "80sen",
    ph: "P100",
    ru: "56P",
    sg: "$1.30",
    tw: "15",
    vn: "15000d",
}

async function build_html() {
    let message_data = []
    let message_table = Object.create(null);
    let content = await fs.readFile(message_csv_file);
    let records = csvparse(content, { from_line: 2 });

    records.map(
        record => {
            const timestamp = record[0];
            const discordmatch = record[1].match(/.*#[0-9_)]*/g);
            const twittermatch = record[1].match(/@.*/g);
            let twitter = twittermatch ? twittermatch[0].trim() : "";
            const nickname = record[2].trim();
            const country = record[3].replace("-"," ");
            const message = record[5];
            const message_jp = record[8];

            let country_code = '';
            let country_name = '';
            let country_name_stamp = '';
            let country_postage = '2021'; // worst case we just write the year instead of postage amt.

            if (country) {
                search_country_code = countries.getAlpha2Code(country, 'en');
                if (search_country_code) {
                    country_code = search_country_code.toLowerCase();
                    country_name = countries.getName(search_country_code, "en");
                    country_name_stamp = countries.getName(search_country_code, "ja", {select: "alias"});
                    country_postage = postageOverrides[country_code] || country_postage;
                    if (country_name_stamp === "アメリカ合衆国") country_name_stamp = "アメリカ";
                    if (country_name_stamp === "ロシア連邦") country_name_stamp = "ロシア";
                }
            }

            // https://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi/15034560
            var jpCharacters = message.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/);

            // if there isn't a match, then message is not in Japanese, pass this value to the handlebars file.
            // if there is no JP character and translation is not provided, then the message is in JP
            var isMsgInJP = !(jpCharacters === null) && record[6] === ""


            if (twitter.startsWith("@") || twitter.startsWith("＠")) {
                twitter = twitter.substring(1);
            }

            message_row = {
                timestamp: timestamp,
                username: nickname,
                twitter: twitter,
                country: country,
                country_name: country_name,
                country_name_stamp: country_name_stamp,
                country_code: country_code,
                country_postage: country_postage,
                message: message,
                isMsgInJP: isMsgInJP,
                message_jp: message_jp
            };
            if (discordmatch) {
                let discord = discordmatch ? discordmatch[0].trim() : "";
                message_table[discord] = message_row;
            } else if (twitter) {
                message_table[twitter] = message_row;
            } else {
                message_table[nickname] = message_row;
            }
        }
    );

    // Use to debug output for missing/duplicate entries
    //console.log(JSON.stringify(Object.keys(message_table)));

    for (var prop in message_table) {
        message_data.push(message_table[prop]);
    }

    let artbook_data = [
        {
            fullpage: "artbook/John_MacDonald.png",
            thumbnail: "artbook/thumbs/John_MacDonald.png",
            thumbnail_small: "artbook/thumbs_small/John_MacDonald_.png",
        },
        {
            fullpage: "artbook/SSRBon_Jobi.png",
            thumbnail: "artbook/thumbs/SSRBon_Jobi.jpg",
            thumbnail_small: "artbook/thumbs_small/SSRBon_Jobi_.jpg",
        },
        {
            fullpage: "artbook/Pericuinkle.png",
            thumbnail: "artbook/thumbs/Pericuinkle.png",
            thumbnail_small: "artbook/thumbs_small/Pericuinkle_.png",
        },
        {
            fullpage: "artbook/Raze_Yukihana.png",
            thumbnail: "artbook/thumbs/Raze_Yukihana.png",
            thumbnail_small: "artbook/thumbs_small/Raze_Yukihana_.png",
        },
        {
            fullpage: "artbook/Jeru_Mercado.png",
            thumbnail: "artbook/thumbs/Jeru_Mercado.png",
            thumbnail_small: "artbook/thumbs_small/Jeru_Mercado_.png",
        },
        {
            fullpage: "artbook/Kotoji_Chang.png",
            thumbnail: "artbook/thumbs/Kotoji_Chang.png",
            thumbnail_small: "artbook/thumbs_small/Kotoji_Chang_.png",
        },
        {
            fullpage: "artbook/三世吾郎.png",
            thumbnail: "artbook/thumbs/三世吾郎.png",
            thumbnail_small: "artbook/thumbs_small/三世吾郎_.png",
        },
        {
            fullpage: "artbook/保村成[ほむらみのり].png",
            thumbnail: "artbook/thumbs/保村成[ほむらみのり].png",
            thumbnail_small: "artbook/thumbs_small/保村成[ほむらみのり]_.png",
        },
        {
            fullpage: "artbook/Lkes.png",
            thumbnail: "artbook/thumbs/Lkes.png",
            thumbnail_small: "artbook/thumbs_small/Lkes_.png",
        },
        {
            fullpage: "artbook/robotta_2.png",
            thumbnail: "artbook/thumbs/robotta_2.png",
            thumbnail_small: "artbook/thumbs_small/robotta_2_.png",
        },
        {
            fullpage: "artbook/蒼泉Izumi.png",
            thumbnail: "artbook/thumbs/蒼泉Izumi.png",
            thumbnail_small: "artbook/thumbs_small/蒼泉Izumi_.png",
        },
        {
            fullpage: "artbook/West_Lee.png",
            thumbnail: "artbook/thumbs/West_Lee.png",
            thumbnail_small: "artbook/thumbs_small/West_Lee_.png",
        },
        {
            fullpage: "artbook/Abigail_Casanova.png",
            thumbnail: "artbook/thumbs/Abigail_Casanova.jpg",
            thumbnail_small: "artbook/thumbs_small/Abigail_Casanova_.jpg",
        },
        {
            fullpage: "artbook/MAV_ItsyoboiBrentブレント.png",
            thumbnail: "artbook/thumbs/MAV_ItsyoboiBrentブレント.png",
            thumbnail_small: "artbook/thumbs_small/MAV_ItsyoboiBrentブレント_.png",
        },
        {
            fullpage: "artbook/Misato_Wakatsuki.png",
            thumbnail: "artbook/thumbs/Misato_Wakatsuki.jpg",
            thumbnail_small: "artbook/thumbs_small/Misato_Wakatsuki_.jpg",
        },
        {
            fullpage: "artbook/研ぎ汁ウェイ___雪風ときみ.png",
            thumbnail: "artbook/thumbs/研ぎ汁ウェイ___雪風ときみ.png",
            thumbnail_small: "artbook/thumbs_small/研ぎ汁ウェイ___雪風ときみ_.png",
        },
        {
            fullpage: "artbook/ひらいいち.jpeg",
            thumbnail: "artbook/thumbs/ひらいいち.jpg",
            thumbnail_small: "artbook/thumbs_small/ひらいいち_.jpg",
        },
        {
            fullpage: "artbook/りさ.png",
            thumbnail: "artbook/thumbs/りさ.png",
            thumbnail_small: "artbook/thumbs_small/りさ_.png",
        },
        {
            fullpage: "artbook/Vlack.png",
            thumbnail: "artbook/thumbs/Vlack.png",
            thumbnail_small: "artbook/thumbs_small/Vlack_.png",
        },
        {
            fullpage: "artbook/Ortrus.png",
            thumbnail: "artbook/thumbs/Ortrus.png",
            thumbnail_small: "artbook/thumbs_small/Ortrus_.png",
        },
        {
            fullpage: "artbook/ミミック.png",
            thumbnail: "artbook/thumbs/ミミック.png",
            thumbnail_small: "artbook/thumbs_small/ミミック_.png",
        },
        {
            fullpage: "artbook/jjtri_tee.png",
            thumbnail: "artbook/thumbs/jjtri_tee.jpg",
            thumbnail_small: "artbook/thumbs_small/jjtri_tee_.jpg",
        }
    ]

    let template_data = {
        messages: message_data,
        artbook_data: artbook_data
    };
    let htmlminoptions = {
        minifyCSS: true,
        minifyJS: true,
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
    }

    return src('src/index.handlebars')
        .pipe(handlebars(template_data, {helpers:{
            'eq': function(arg1, arg2, options) {
                return (arg1 == arg2) ? true : false;
            }
        }}))
        .pipe(htmlmin(htmlminoptions))
        .pipe(rename('index.html'))
        .pipe(dest('.'));
}

function minifyjs() {
    return src('src/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify())
        .pipe(dest('dist'))
}

function minifyimg() {
    return src('src/img/**/*')
        .pipe(imagemin([
            imagemin.optipng({
                interlaced: true
            })
        ]))
        .pipe(dest('dist/img'))
}

exports.build_full = series(minifycss, build_html, minifyjs, minifyimg);
exports.build = series(minifycss, build_html, minifyjs);
