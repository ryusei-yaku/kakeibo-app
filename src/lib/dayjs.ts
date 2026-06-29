import dayjs from "dayjs";
import "dayjs/locale/ja";
import updateLocale from "dayjs/plugin/updateLocale";

// Day.js のロケール設定を変更できるようにする
dayjs.extend(updateLocale);

// アプリ全体で日本語表示を使う
dayjs.locale("ja");

// 日本語ロケールの週の開始曜日を月曜日にする
// weekStart: 1 は「月曜日始まり」という意味
dayjs.updateLocale("ja", {
  weekStart: 1,
});

// 設定済みの dayjs を他のファイルで使えるようにする
export default dayjs;