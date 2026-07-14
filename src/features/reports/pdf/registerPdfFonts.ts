import { Font } from "@react-pdf/renderer";

// PDF内で日本語を表示するため、静的TTFのIPAexゴシックを登録する
const fontUrl =
    `${window.location.origin}${import.meta.env.BASE_URL}` +
    "fonts/ipaexg.ttf";

Font.register({
    family: "IPAexGothic",
    src: fontUrl,
    fontWeight: 400,
});

// 長い日本語の備考を1文字単位で折り返せるようにする
Font.registerHyphenationCallback((word) => Array.from(word));