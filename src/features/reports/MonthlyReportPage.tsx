import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "../../lib/dayjs";
import type { Expense } from "../../types/expense";


type MonthlyReportPageProps = {
    expenses: Expense[];
};

function MonthlyReportPage({ expenses }: MonthlyReportPageProps) {
    const navigate = useNavigate();

    // 印刷対象の月を管理する
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));

    // 画面や印刷用タイトルに表示する年月
    const selectedMonthLabel = dayjs(selectedMonth).format("YYYY年M月");

    // 選択した月の支出・収入データだけを取り出す
    const monthlyExpenses = expenses.filter((expense) =>
        expense.date.startsWith(selectedMonth)
    );

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef" }}>
            {/* 通常画面でだけ表示する操作エリア */}
            <Box
                className="no-print"
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#f6f4ef",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                }}
            >
                <Container maxWidth="md">
                    <Stack direction="row" spacing={1} sx={{ py: 1 }}>
                        <Button
                            onClick={() => navigate("/")}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                color: "text.secondary",
                                fontWeight: "bold",
                            }}
                        >
                            ホームへ戻る
                        </Button>

                        <TextField
                            label="印刷する月"
                            type="month"
                            value={selectedMonth}
                            onChange={(event) => setSelectedMonth(event.target.value)}
                            size="small"
                            sx={{
                                backgroundColor: "#ffffff",
                                minWidth: 180,
                            }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={() => window.print()}
                            sx={{
                                ml: "auto",
                                fontWeight: "bold",
                                backgroundColor: "#333333",
                                "&:hover": {
                                    backgroundColor: "#000000",
                                },
                            }}
                        >
                            印刷する
                        </Button>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ py: 3 }}>
                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        p: 4,
                        borderRadius: 1,
                        border: "1px solid #d0d0d0",
                    }}
                >
                    <Stack spacing={3}>
                        {/* レポートのタイトル */}
                        <Box sx={{ textAlign: "center" }}>
                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: 24,
                                    fontWeight: "bold",
                                    letterSpacing: 1,
                                }}
                            >
                                月次家計簿レポート
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 1,
                                    fontSize: 18,
                                    fontWeight: "bold",
                                }}
                            >
                                {selectedMonthLabel} 家計簿
                            </Typography>
                        </Box>

                        {/* 項目別集計エリア */}
                        <Box>
                            <Typography
                                component="h2"
                                sx={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    borderBottom: "2px solid #000000",
                                    pb: 0.5,
                                    mb: 1.5,
                                }}
                            >
                                1. 項目別集計
                            </Typography>

                            <Typography>
                                ここに項目別集計を表示します。
                            </Typography>
                        </Box>

                        {/* 支出一覧エリア */}
                        <Box>
                            <Typography
                                component="h2"
                                sx={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    borderBottom: "2px solid #000000",
                                    pb: 0.5,
                                    mb: 1.5,
                                }}
                            >
                                2. 支出一覧
                            </Typography>

                            <Typography>
                                登録件数：{monthlyExpenses.length}件
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Container>

            {/* 印刷時だけ、操作ボタンなどを消す */}
            <style>
                {`
        @page {
            size: A4 landscape;
            margin: 12mm;
        }

        @media print {
            .no-print {
                display: none !important;
            }

            body {
                background: #ffffff !important;
            }
        }
    `}
            </style>
        </Box>
    );
}

export default MonthlyReportPage;