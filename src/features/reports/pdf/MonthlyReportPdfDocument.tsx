import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";
import "./registerPdfFonts";
import type { MonthlyReportPdfData } from "./monthlyReportPdfTypes";

type MonthlyReportPdfDocumentProps = {
    data: MonthlyReportPdfData;
};

// 金額をカンマ付きの数字へ変換する
// 入出金明細では「円」を付けない
function formatNumber(amount: number) {
    return amount.toLocaleString("ja-JP");
}

// 項目別集計では「円」を付けて表示する
function formatYen(amount: number) {
    return `${formatNumber(amount)}円`;
}

// PDF専用のスタイル
const styles = StyleSheet.create({
    page: {
        fontFamily: "IPAexGothic",
        fontSize: 9,
        paddingTop: 34,
        paddingRight: 34,
        paddingBottom: 42,
        paddingLeft: 34,
        color: "#000000",
        backgroundColor: "#ffffff",
    },

    title: {
        fontSize: 20,
        fontWeight: 400,
        textAlign: "center",
        marginBottom: 8,
    },

    monthTitle: {
        fontSize: 14,
        fontWeight: 400,
        textAlign: "center",
        marginBottom: 28,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: 400,
        borderBottomWidth: 1.5,
        borderBottomColor: "#000000",
        paddingBottom: 5,
        marginBottom: 10,
    },

    emptyMessage: {
        fontSize: 10,
        color: "#555555",
        paddingTop: 8,
    },

    summaryTable: {
        width: 320,
        alignSelf: "flex-start",
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: "#777777",
    },

    summaryRow: {
        flexDirection: "row",
        minHeight: 28,
    },

    summaryHeaderCell: {
        backgroundColor: "#eeeeee",
        fontWeight: 400,
        textAlign: "center",
        justifyContent: "center",
    },

    summaryNameCell: {
        width: "68%",
    },

    summaryAmountCell: {
        width: "32%",
        textAlign: "right",
    },

    summaryCell: {
        paddingVertical: 7,
        paddingHorizontal: 8,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#777777",
        justifyContent: "center",
    },

    detailPage: {
        fontFamily: "IPAexGothic",
        fontSize: 8,
        paddingTop: 70,
        paddingRight: 24,
        paddingBottom: 42,
        paddingLeft: 24,
        color: "#000000",
        backgroundColor: "#ffffff",
    },

    detailFixedHeader: {
        position: "absolute",
        top: 26,
        left: 24,
        right: 24,
    },

    detailPageTitle: {
        fontSize: 13,
        fontWeight: 400,
        marginBottom: 8,
    },

    detailTable: {
        width: "100%",
    },

    detailHeaderRow: {
        flexDirection: "row",
        minHeight: 24,
        backgroundColor: "#eeeeee",
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#777777",
    },

    detailRow: {
        flexDirection: "row",
        minHeight: 24,
        borderTopWidth: 0.4,
        borderLeftWidth: 1,
        borderBottomWidth: 0.4,
        borderColor: "#777777",
    },

    detailCell: {
        paddingVertical: 5,
        paddingHorizontal: 4,
        borderRightWidth: 1,
        borderColor: "#777777",
        justifyContent: "center",
    },

    detailHeaderCell: {
        fontWeight: 400,
        textAlign: "center",
    },

    dateColumn: {
        width: "12%",
    },

    itemColumn: {
        width: "17%",
    },

    incomeColumn: {
        width: "13%",
        textAlign: "right",
    },

    expenseColumn: {
        width: "13%",
        textAlign: "right",
    },

    balanceColumn: {
        width: "14%",
        textAlign: "right",
    },

    noteColumn: {
        width: "31%",
    },

    pageNumber: {
        position: "absolute",
        bottom: 18,
        right: 24,
        fontSize: 8,
        color: "#555555",
        textAlign: "right",
    },
});

function MonthlyReportPdfDocument({
    data,
}: MonthlyReportPdfDocumentProps) {
    const {
        selectedMonthLabel,
        categoryRows,
        detailRows,
    } = data;

    return (
        <Document
            title={`${selectedMonthLabel} 月次家計簿レポート`}
            author="家計簿アプリ"
            subject="月次家計簿レポート"
        >
            {/* 1ページ目：タイトルと項目別集計 */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>
                    月次家計簿レポート
                </Text>

                <Text style={styles.monthTitle}>
                    {selectedMonthLabel} 家計簿
                </Text>

                <Text style={styles.sectionTitle}>
                    1. 項目別集計
                </Text>

                {categoryRows.length === 0 ? (
                    <Text style={styles.emptyMessage}>
                        この月の出金データはありません。
                    </Text>
                ) : (
                    <View style={styles.summaryTable}>
                        {/* 項目別集計の見出し */}
                        <View style={styles.summaryRow}>
                            <View
                                style={[
                                    styles.summaryCell,
                                    styles.summaryHeaderCell,
                                    styles.summaryNameCell,
                                ]}
                            >
                                <Text>項目</Text>
                            </View>

                            <View
                                style={[
                                    styles.summaryCell,
                                    styles.summaryHeaderCell,
                                    styles.summaryAmountCell,
                                ]}
                            >
                                <Text>金額</Text>
                            </View>
                        </View>

                        {/* 項目別集計のデータ */}
                        {categoryRows.map((row) => (
                            <View
                                key={row.categoryName}
                                style={styles.summaryRow}
                                wrap={false}
                            >
                                <View
                                    style={[
                                        styles.summaryCell,
                                        styles.summaryNameCell,
                                    ]}
                                >
                                    <Text>{row.categoryName}</Text>
                                </View>

                                <View
                                    style={[
                                        styles.summaryCell,
                                        styles.summaryAmountCell,
                                    ]}
                                >
                                    <Text>
                                        {formatYen(row.totalAmount)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* 全ページ共通のページ番号 */}
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) =>
                        `${pageNumber} / ${totalPages}`
                    }
                    fixed
                />
            </Page>

            {/* 2ページ目以降：入出金明細 */}
            <Page size="A4" style={styles.detailPage} wrap>
                {/* ページが増えても繰り返し表示する見出し */}
                <View style={styles.detailFixedHeader} fixed>
                    <Text style={styles.detailPageTitle}>
                        2. {selectedMonthLabel} 入出金明細
                    </Text>

                    <View style={styles.detailTable}>
                        <View style={styles.detailHeaderRow}>
                            <View
                                style={[
                                    styles.detailCell,
                                    styles.detailHeaderCell,
                                    styles.dateColumn,
                                ]}
                            >
                                <Text>日付</Text>
                            </View>

                            <View
                                style={[
                                    styles.detailCell,
                                    styles.detailHeaderCell,
                                    styles.itemColumn,
                                ]}
                            >
                                <Text>項目</Text>
                            </View>

                            <View
                                style={[
                                    styles.detailCell,
                                    styles.detailHeaderCell,
                                    styles.incomeColumn,
                                ]}
                            >
                                <Text>入金</Text>
                            </View>

                            <View
                                style={[
                                    styles.detailCell,
                                    styles.detailHeaderCell,
                                    styles.expenseColumn,
                                ]}
                            >
                                <Text>出金</Text>
                            </View>

                            <View
                                style={[
                                    styles.detailCell,
                                    styles.detailHeaderCell,
                                    styles.balanceColumn,
                                ]}
                            >
                                <Text>残高</Text>
                            </View>

                            <View
                                style={[
                                    styles.detailCell,
                                    styles.detailHeaderCell,
                                    styles.noteColumn,
                                ]}
                            >
                                <Text>備考</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {detailRows.length === 0 ? (
                    <Text style={styles.emptyMessage}>
                        この月のデータはありません。
                    </Text>
                ) : (
                    <View style={styles.detailTable}>
                        {detailRows.map((row) => (
                            /*
                             * 1件の明細がページをまたいで分断されないようにする
                             * 備考が長い場合は行全体を次ページへ移動する
                             */
                            <View
                                key={row.id}
                                style={styles.detailRow}
                                wrap={false}
                            >
                                <View
                                    style={[
                                        styles.detailCell,
                                        styles.dateColumn,
                                    ]}
                                >
                                    <Text>{row.date}</Text>
                                </View>

                                <View
                                    style={[
                                        styles.detailCell,
                                        styles.itemColumn,
                                    ]}
                                >
                                    <Text>{row.itemName}</Text>
                                </View>

                                <View
                                    style={[
                                        styles.detailCell,
                                        styles.incomeColumn,
                                    ]}
                                >
                                    <Text>
                                        {row.incomeAmount === null
                                            ? ""
                                            : formatNumber(row.incomeAmount)}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.detailCell,
                                        styles.expenseColumn,
                                    ]}
                                >
                                    <Text>
                                        {row.expenseAmount === null
                                            ? ""
                                            : formatNumber(row.expenseAmount)}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.detailCell,
                                        styles.balanceColumn,
                                    ]}
                                >
                                    <Text>
                                        {formatNumber(row.balance)}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.detailCell,
                                        styles.noteColumn,
                                    ]}
                                >
                                    <Text>{row.note}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* 全ページ共通のページ番号 */}
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) =>
                        `${pageNumber} / ${totalPages}`
                    }
                    fixed
                />
            </Page>
        </Document>
    );
}

export default MonthlyReportPdfDocument;
