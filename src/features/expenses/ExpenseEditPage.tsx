import { useParams, useNavigate } from "react-router-dom";
import type { Expense } from "../../types/expense";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Box,
    Button,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";

type ExpenseEditPageProps = {
    expenses: Expense[];
}

function ExpenseEditPage({ expenses }: ExpenseEditPageProps) {
    //ページを移動するための関数
    const navigate = useNavigate();

    //URLの:expenseIdに入っている支出IDを取得する
    const { expenseId } = useParams();

    //URLの支出IDと一致する支出データを探す
    const expense = expenses.find((expense) => expense.id === expenseId);


    if (expense === undefined) {
        return (
            <Container maxWidth="sm" sx={{ px: 3 }}>
                <Typography>
                    支出が見つかりませんでした。
                </Typography>
            </Container>
        );
    }

    //編集フォーム用のstate
    //既存の支出データを初期値として入れる
    const [amount, setAmount] = useState(String(expense.amount));
    const [date, setDate] = useState(expense.date);
    const [shopName, setShopName] = useState(expense.shopName);
    const [memo, setMemo] = useState(expense.memo);



    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Stack spacing={2}>
                    {/* 前の画面に戻るボタン */}
                    <Button
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            alignSelf: "flex-start",
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        戻る
                    </Button>

                    <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
                        支出を編集
                    </Typography>

                    {/* 日付 */}
                    <TextField
                        label="日付"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        fullWidth
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            }
                        }}
                    />

                    {/* 金額 */}
                    <TextField
                        label="金額"
                        value={Number(amount || 0).toLocaleString()}
                        onChange={(event) => {
                            // 数字以外を取り除いて、内部ではカンマなしで管理する
                            const onlyNumber = event.target.value.replace(/\D/g, "")
                            setAmount(onlyNumber);
                        }}
                        fullWidth
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                            htmlInput: {
                                inputMode: "numeric",
                            },
                        }}
                    />

                    {/* カテゴリー */}
                    <TextField
                        label="カテゴリー"
                        value={expense.categoryName}
                        fullWidth
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            }
                        }}
                        disabled
                        helperText="カテゴリー編集は後で対応します"
                    />

                    {/* 店名 */}
                    <TextField
                        label="店名"
                        value={expense.shopName}
                        onChange={(event) => setShopName(event.target.value)}
                        fullWidth
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            }
                        }}
                    />

                    {/* メモ */}
                    <TextField
                        label="メモ"
                        value={expense.memo}
                        onChange={(event) => setMemo(event.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        sx={{ fontWeight: "bold" }}
                    >
                        保存する
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
}

export default ExpenseEditPage;