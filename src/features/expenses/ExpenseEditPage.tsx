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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "../../lib/dayjs";
import type { Expense } from "../../types/expense";
import { formatAmount } from "../../utils/formatAmount";
import { categories } from "../categories/categories";
import { formatDateLabel } from "../../utils/formatDateLabel";
import CategorySelector from "../categories/CategorySelector";

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
    const [selectedCategoryId, setSelectedCategoryId] = useState(expense.categoryId);
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    //削除確認ダイアログを開いているかどうかを管理
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // 1項目分の横並びレイアウト
    // 入力画面と同じように、左に項目名、右に入力欄を置く
    const inputRowSx = {
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        borderBottom: "1px solid #e0e0e0",
        py: 1.5,
    };

    // メモのように複数行になる項目用
    const multilineInputRowSx = {
        ...inputRowSx,
        alignItems: "flex-start",
    };

    // 項目名
    const inputLabelSx = {
        width: 56,
        flexShrink: 0,
        fontWeight: "bold",
        color: "text.secondary",
    };

    // 複数行項目のラベル位置調整
    const multilineInputLabelSx = {
        ...inputLabelSx,
        pt: 0.8,
    };

    // 入力値を入れるBox
    // 色は編集画面に合わせて #fde7cd
    const inputValueBoxSx = {
        flex: 1,
        minWidth: 0,
        backgroundColor: "#fde7cd",
        borderRadius: 2,
        px: 2,
        py: 0.75,
    };

    function handleSubmit() {
        // 金額が未入力の場合は保存しない
        if (amount === "") {
            return;
        }

        //選択中のカテゴリーIDに一致するカテゴリーを探す
        const selectedCategory = categories.find(
            (category) => category.id === selectedCategoryId
        );

        //万が一カテゴリが見つからなければ保存しない
        if (selectedCategory === undefined) {
            return;
        }

        // 編集後の支出データを作る
        const updatedExpense: Expense = {
            ...expense,
            amount: Number(amount),
            categoryId: selectedCategory.id,
            categoryName: selectedCategory.name,
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
                    <Box sx={inputRowSx}>
                        <Typography sx={inputLabelSx}>
                            日付
                        </Typography>

                        <Button
                            onClick={() => setIsDateDialogOpen(true)}
                            fullWidth
                            sx={{
                                flex: 1,
                                backgroundColor: "#fde7cd",
                                borderRadius: 2,
                                py: 1,
                                textAlign: "center",
                                color: "text.primary",
                                fontSize: 18,
                                fontWeight: "bold",
                                "&:hover": {
                                    backgroundColor: "#fbd4a7",
                                },
                            }}
                        >
                            {formatDateLabel(date)}
                        </Button>
                    </Box>

                    {/* 金額 */}
                    <Box
                        sx={inputRowSx}
                    >
                        <Typography sx={inputLabelSx}>
                            支出額
                        </Typography>
                        <Box sx={inputValueBoxSx}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 0.5,
                                    minWidth: 0,
                                }}
                            >
                                <TextField
                                    value={formatAmount(amount)}
                                    onChange={(event) => {
                                        // 数字以外を取り除いて、内部ではカンマなしで管理する
                                        const onlyNumber = event.target.value.replace(/\D/g, "");
                                        setAmount(onlyNumber);
                                    }}
                                    variant="standard"
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            disableUnderline: true,
                                        },
                                        htmlInput: {
                                            inputMode: "numeric",
                                            style: {
                                                textAlign: "right",
                                                fontSize: 20,
                                                fontWeight: "bold",
                                            },
                                        },
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        color: "#333333",
                                        flexShrink: 0,
                                    }}
                                >
                                    円
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    {/* カテゴリー */}
                    <Box sx={{ mt: 0.5 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontWeight: "bold",
                                mb: 1,
                            }}>
                            カテゴリー
                        </Typography>

                        <CategorySelector 
                        selectedCategoryId={selectedCategoryId}
                        onSelectCategory={setSelectedCategoryId}
                        />
                    </Box>

                    {/* 店名 */}
                    <Box sx={inputRowSx}>
                        <Typography sx={inputLabelSx}>
                            店名
                        </Typography>

                        <Box sx={inputValueBoxSx}>
                            <TextField
                                value={shopName}
                                onChange={(event) => setShopName(event.target.value)}
                                variant="standard"
                                fullWidth
                                multiline
                                minRows={1}
                                placeholder="未入力"
                                slotProps={{
                                    input: {
                                        disableUnderline: true,
                                    },
                                }}
                                sx={{
                                    "& textarea": {
                                        fontSize: 18,
                                        lineHeight: 1.6,
                                        overflowWrap: "break-word",
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* メモ */}
                    <Box sx={multilineInputRowSx}>
                        <Typography sx={multilineInputLabelSx}>
                            メモ
                        </Typography>

                        <Box sx={inputValueBoxSx}>
                            <TextField
                                value={memo}
                                onChange={(event) => setMemo(event.target.value)}
                                variant="standard"
                                fullWidth
                                multiline
                                minRows={2}
                                placeholder="未入力"
                                slotProps={{
                                    input: {
                                        disableUnderline: true,
                                    },
                                }}
                                sx={{
                                    "& textarea": {
                                        fontSize: 18,
                                        lineHeight: 1.6,
                                        overflowWrap: "break-word",
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            pt: 1,
                        }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            sx={{
                                flex: 1,
                                fontWeight: "bold",
                                backgroundColor: "#f59e0b",
                                "&:hover": {
                                    backgroundColor: "#d97706"
                                }
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

                    {/* 日付選択ダイアログ */}
                    <Dialog
                        open={isDateDialogOpen}
                        onClose={() => setIsDateDialogOpen(false)}
                    >
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
                            <DateCalendar
                                value={dayjs(date)}
                                onChange={(newDate) => {
                                    if (newDate === null) {
                                        return;
                                    }

                                    setDate(newDate.format("YYYY-MM-DD"));
                                    setIsDateDialogOpen(false);
                                }}
                            />
                        </LocalizationProvider>
                    </Dialog>
                </Stack>
            </Container>
        </Box >
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