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
import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Expense } from "../../types/expense";
import { categories } from "../categories/categories";

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
    //削除確認ダイアログを開いているかどうかを管理
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const dateInputRef = useRef<HTMLInputElement | null>(null);

    function openDatePicker() {
        const dateInput = dateInputRef.current;

        if (dateInput === null) {
            return;
        }

        // ブラウザがshowPickerに対応していれば、日付選択UIを開く
        if (typeof dateInput.showPicker === "function") {
            dateInput.showPicker();
            return;
        }

        // showPickerに対応していない場合の処理
        dateInput.focus();
    }

    // 1項目分の横並びレイアウト
    const inputRowSx = {
        display: "flex",
        alignItems: "center",
        gap: 1.5,
    };

    // 項目名はBoxの外に置き、ページ背景の上に表示する
    const inputLabelSx = {
        width: 88,
        flexShrink: 0,
        fontSize: 18,
        fontWeight: "bold",
        color: "#555555",
    };

    //入力値を入れるBox
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

                        <Box
                            sx={{
                                ...inputValueBoxSx,
                                cursor: "pointer",
                            }}
                            onClick={openDatePicker}
                        >
                            <TextField
                                inputRef={dateInputRef}
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                variant="standard"
                                fullWidth
                                sx={{
                                    "& .MuiInputBase-root": {
                                        cursor: "pointer",
                                    },
                                    "& input": {
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        textAlign: "right",
                                        cursor: "pointer",
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        disableUnderline: true,
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* 金額 */}
                    <Box
                        sx={inputRowSx}
                    >
                        <Typography sx={inputLabelSx}>
                            金額
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
                                    value={amount === "" ? "" : Number(amount).toLocaleString()}
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
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#555555",
                                mt: 0.5,
                                mb: 1,
                            }}>
                            カテゴリー
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 1,
                            }}
                        >
                            {categories.map((category => {
                                const isSelected = selectedCategoryId === category.id;

                                return (
                                    <Button
                                        key={category.id}
                                        variant={isSelected ? "contained" : "outlined"}
                                        onClick={() => setSelectedCategoryId(category.id)}
                                        sx={{
                                            fontWeight: "bold",
                                            py: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: isSelected ? "#f59e0b" : "#f6f4ef",
                                            color: isSelected ? "#ffffff" : "#555555",
                                            borderColor: "#f59e0b",
                                            "&:hover": {
                                                backgroundColor: isSelected ? "#d97706" : "#fbd4a7",
                                                borderColor: "#d97706"
                                            },
                                        }}
                                    >
                                        {category.name}
                                    </Button>
                                );
                            }))}
                        </Box>
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
                                placeholder="未入力"
                                slotProps={{
                                    input: {
                                        disableUnderline: true,
                                    },
                                    htmlInput: {
                                        style: {
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            textAlign: "right",
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* メモ */}
                    <Box>
                        {/* メモだけは項目名を左上に表示する */}
                        <Typography
                            sx={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#555555",
                                mb: 1,
                            }}
                        >
                            メモ
                        </Typography>

                        <Box
                            sx={{
                                backgroundColor: "#fde7cd",
                                borderRadius: 2,
                                px: 2,
                                py: 1.25,
                            }}
                        >
                            <TextField
                                value={memo}
                                onChange={(event) => setMemo(event.target.value)}
                                variant="standard"
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="未入力"
                                slotProps={{
                                    input: {
                                        disableUnderline: true,
                                    },
                                    htmlInput: {
                                        style: {
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            textAlign: "right",
                                        },
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