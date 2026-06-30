import { useParams, useNavigate } from "react-router-dom";
import type { Expense } from "../../types/expense";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";

type ExpenseEditPageProps = {
    expenses: Expense[];
    onUpdateExpense: (expense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
};

type ExpenseEditFormProps = {
    expense: Expense;
    onUpdateExpense: (expense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
};

function ExpenseEditForm({
    expense,
    onUpdateExpense,
    onDeleteExpense
}: ExpenseEditFormProps) {
    //ページを移動するための関数
    const navigate = useNavigate();
    //編集フォーム用のstate
    //既存の支出データを初期値として入れる
    const [amount, setAmount] = useState(String(expense.amount));
    const [date, setDate] = useState(expense.date);
    const [shopName, setShopName] = useState(expense.shopName);
    const [memo, setMemo] = useState(expense.memo);
    //削除確認ダイアログを開いているかどうかを管理
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    function handleSubmit() {
        // 金額が未入力の場合は保存しない
        if (amount === "") {
            return;
        }
        // 編集後の支出データを作る
        const updatedExpense: Expense = {
            ...expense,
            amount: Number(amount),
            date,
            shopName,
            memo,
        };

        // App.tsxのexpensesを更新する
        onUpdateExpense(updatedExpense);

        // 保存後は前の画面に戻る
        navigate(-1);
    }

    function handleDelete() {
        //この支出を削除する
        onDeleteExpense(expense.id);

        //削除後は前の画面に戻る
        navigate(-1);
    }

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
                        value={amount === "" ? "" : Number(amount).toLocaleString()}
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
                        value={shopName}
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
                        value={memo}
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

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            sx={{
                                flex: 1,
                                fontWeight: "bold",
                            }}
                        >
                            保存する
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            size="large"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            sx={{
                                flex: 1,
                                fontWeight: "bold",
                            }}
                        >
                            削除する
                        </Button>
                    </Box>

                    {/* 削除確認ダイアログ */}
                    <Dialog
                        open={isDeleteDialogOpen}
                        onClose={() => setIsDeleteDialogOpen(false)}
                        maxWidth="xs"
                    >
                        <DialogTitle
                            sx={{
                                textAlign: "center",
                                borderBottom: "1px solid #e0e0e0"
                            }}
                        >
                            この支出を削除しますか？
                        </DialogTitle>


                        <DialogActions
                            sx={{
                                p: 0,
                                display: "flex",
                            }}
                        >
                            <Button
                                onClick={() => setIsDeleteDialogOpen(false)}
                                sx={{
                                    flex: 1,
                                    py: 1.5,
                                    borderRadius: 0,
                                    fontWeight: "bold"
                                }}
                            >
                                キャンセル
                            </Button>

                            <Button
                                color="error"
                                onClick={handleDelete}
                                sx={{
                                    flex: 1,
                                    py: 1.5,
                                    borderRadius: 0,
                                    fontWeight: "bold",
                                    borderLeft: "1px solid #e0e0e0",
                                }}
                            >
                                削除する
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Stack>
            </Container>
        </Box>
    );
}

function ExpenseEditPage({
    expenses,
    onUpdateExpense,
    onDeleteExpense,
}: ExpenseEditPageProps) {
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

    return (
        <ExpenseEditForm
            expense={expense}
            onUpdateExpense={onUpdateExpense}
            onDeleteExpense={onDeleteExpense}
        />
    )

}

export default ExpenseEditPage;