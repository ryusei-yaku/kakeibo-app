// PDFの項目別集計に表示する1行分
export type MonthlyReportCategoryRow = {
    categoryName: string;
    totalAmount: number;
};

// PDFの入出金明細に表示する1行分
export type MonthlyReportDetailRow = {
    id: string;
    date: string;
    itemName: string;
    incomeAmount: number | null;
    expenseAmount: number | null;
    balance: number;
    note: string;
};

// 月次レポートPDFへ渡すデータ
export type MonthlyReportPdfData = {
    selectedMonthLabel: string;
    categoryRows: MonthlyReportCategoryRow[];
    detailRows: MonthlyReportDetailRow[];
};