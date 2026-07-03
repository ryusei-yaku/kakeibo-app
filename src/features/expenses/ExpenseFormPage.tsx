import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Container, Dialog, Snackbar, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "../../lib/dayjs";
import type { Category } from "../../types/category";
import type { Expense } from "../../types/expense";
import { formatDateLabel } from "../../utils/formatDateLabel";
import CategorySelector from "../categories/CategorySelector";


type ExpenseFormPageProps = {
    expenses: Expense[];
    categories: Category[];
    onAddExpense: (expense: Expense) => void;
}

function ExpenseFormPage({
    categories,
    onAddExpense }: ExpenseFormPageProps) {
    //現在選ばれている日付を保持する。
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    //カレンダーのダイアログが開いているかを保持する。
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    //選択しているカテゴリのIDを保持する。
    const [selectedCategoryId, setSelectedCategoryId] = useState("expense-food");
    //今入力されている金額を保持する。
    const [amount, setAmount] = useState("");
    //メモを保持する
    const [memo, setMemo] = useState("");
    //保存完了メッセージを表示するかどうかを管理する
    const [isSaveMessageOpen, setIsSaveMessageOpen] = useState(false);

    // 支出・収入のどちらを登録するかを管理する
    // 初期値は支出
    const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");

    //選択中の種類に合うカテゴリーだけを表示する
    // 支出なら支出カテゴリー、収入なら収入カテゴリーだけを表示
    const selectableCategories = categories.filter(
        (category) => category.type === transactionType
    )

    const navigate = useNavigate();

    function goToPreviousDate() {
        setSelectedDate((currentDate) => currentDate.subtract(1, "day"));
    }

    function goToNextDate() {
        setSelectedDate((currentDate) => currentDate.add(1, "day"));
    }

    //支出を登録する
    function handleSubmit() {
        if (amount === "") {
            alert("金額を入力してください");
            return;
        }

        const selectedCategory = categories.find(
            (category) => category.id === selectedCategoryId
        );

        if (selectedCategory === undefined) {
            alert("カテゴリーを選択してください");
            return;
        }

        const newExpense: Expense = {
            id: crypto.randomUUID(),
            type: transactionType,
            amount: Number(amount),
            categoryId: selectedCategory.id,
            categoryName: selectedCategory.name,
            date: selectedDate.format("YYYY-MM-DD"),
            memo,
        };

        onAddExpense(newExpense);

        setAmount("");
        setMemo("");
        // 保存できたことを短く表示する
        setIsSaveMessageOpen(true);
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef" }}>
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#f6f4ef",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                }}
            >
                <Container
                    maxWidth="sm">
                    <Button
                        onClick={() => navigate("/")}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            py: 1.2,
                            color: "text.secondary",
                            fontWeight: "bold"
                        }}
                    >
                        ホームへ戻る
                    </Button>
                </Container>
            </Box>

            <Container maxWidth="sm" sx={{ py: 2 }}>
                {/* 支出・収入切り替え */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                        backgroundColor: "#ffffff",
                        borderRadius: 3,
                        p: 0.5,
                    }}
                >
                    <Button
                        onClick={() => {
                            setTransactionType("expense");

                            const firstExpenseCategory = categories.find(
                                (category) =>
                                    category.type === "expense" &&
                                    !category.isDeleted
                            );

                            if (firstExpenseCategory !== undefined) {
                                setSelectedCategoryId(firstExpenseCategory.id)
                            }
                        }}
                        sx={{
                            py: 1.2,
                            borderRadius: 2.5,
                            fontWeight: "bold",
                            backgroundColor: transactionType === "expense" ? "#f59e0b" : "transparent",
                            color: transactionType === "expense" ? "#ffffff" : "#555555",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: transactionType === "expense" ? "#d97706" : "#fde7cd",
                            },
                        }}
                    >
                        支出
                    </Button>

                    <Button
                        onClick={() => {
                            setTransactionType("income");

                            const firstIncomeCategory = categories.find(
                                (category) =>
                                    category.type === "income" &&
                                    !category.isDeleted
                            );

                            if (firstIncomeCategory !== undefined) {
                                setSelectedCategoryId(firstIncomeCategory.id);
                            }
                        }}
                        sx={{
                            py: 1.2,
                            borderRadius: 2.5,
                            fontWeight: "bold",
                            backgroundColor: transactionType === "income" ? "#f59e0b" : "transparent",
                            color: transactionType === "income" ? "#ffffff" : "#555555",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: transactionType === "income" ? "#d97706" : "#fde7cd",
                            },
                        }}
                    >
                        収入
                    </Button>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: "1px solid #e0e0e0",
                        py: 1.5,
                    }}
                >
                    <Typography
                        sx={{
                            width: 56,
                            fontWeight: "bold",
                            color: "text.secondary",
                            flexShrink: 0,
                        }}
                    >
                        日付
                    </Typography>

                    <Button
                        onClick={goToPreviousDate}
                        sx={{
                            minWidth: 40,
                            fontSize: 24,
                            color: "#f59e0b",
                            "&:hover": {
                                backgroundColor: "#fbd4a7",
                            }
                        }}
                    >
                        ＜
                    </Button>

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
                        {formatDateLabel(selectedDate)}
                    </Button>

                    <Button
                        onClick={goToNextDate}
                        sx={{
                            minWidth: 40,
                            fontSize: 24,
                            color: "#f59e0b",
                            "&:hover": {
                                backgroundColor: "#fbd4a7",
                            }
                        }}
                    >
                        ＞
                    </Button>

                </Box>


                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #e0e0e0",
                        py: 1,
                    }}
                >
                    <Typography
                        sx={{
                            width: 56,
                            fontWeight: "bold",
                            color: "text.secondary",
                            flexShrink: 0,
                        }}
                    >
                        {transactionType === "expense" ? "支出額" : "収入額"}
                    </Typography>

                    <TextField
                        value={amount}
                        type="tel"
                        onChange={(event) => {
                            const inputValue = event.target.value;

                            const onlyNumbers = inputValue.replace(/\D/g, "");
                            setAmount(onlyNumbers)
                        }}
                        inputMode="numeric"
                        placeholder="0"
                        variant="standard"
                        fullWidth
                        //TextFieldの中にある実際の入力部分の調整
                        slotProps={{
                            input: {
                                disableUnderline: true,
                            },
                        }}
                        // TextFieldの中にあるinput要素に対してcssを充てるという意味
                        sx={{
                            "& input": {
                                fontSize: 30,
                                fontWeight: "bold",
                                textAlign: "right",
                            },
                        }}
                    />

                    <Typography
                        sx={{
                            ml: 1,
                            fontSize: 24,
                            fontWeight: "bold",
                        }}
                    >
                        円
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        borderBottom: "1px solid #e0e0e0",
                        py: 1.5,
                    }}
                >
                    <Typography
                        sx={{
                            width: 56,
                            fontWeight: "bold",
                            color: "text.secondary",
                            flexShrink: 0,
                            pt: 0.8,
                        }}
                    >
                        メモ
                    </Typography>

                    <TextField
                        value={memo}
                        onChange={(event) => setMemo(event.target.value)}
                        placeholder="未入力"
                        variant="standard"
                        multiline
                        minRows={1}
                        fullWidth
                        slotProps={{
                            input: {
                                disableUnderline: true,
                            },
                        }}
                        sx={{
                            "& textarea": {
                                lineHeight: 1.6,
                                textAlign: "break-word",
                            },
                        }}
                    />
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}
                    >
                        カテゴリー
                    </Typography>

                    <CategorySelector
                        categories={selectableCategories}
                        selectedCategoryId={selectedCategoryId}
                        onSelectCategory={setSelectedCategoryId}
                        showEditButton
                    />
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={handleSubmit}
                    sx={{
                        mt: 3,
                        py: 1.2,
                        borderRadius: 3,
                        fontSize: 18,
                        fontWeight: "bold",
                        backgroundColor: "#f59e0b",
                        "&:hover": {
                            backgroundColor: "#d97706",
                        },
                    }}
                >
                    {transactionType === "expense" ? "支出を登録する" : "収入を登録する"}
                </Button>
            </Container>

            <Dialog open={isDateDialogOpen} onClose={() => setIsDateDialogOpen(false)}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
                    <DateCalendar
                        value={selectedDate}
                        onChange={(newDate) => {
                            if (newDate === null) {
                                return;
                            }

                            setSelectedDate(newDate);
                            setIsDateDialogOpen(false);
                        }}
                    />
                </LocalizationProvider>
            </Dialog>
            <Snackbar
                open={isSaveMessageOpen}
                autoHideDuration={700}
                onClose={() => setIsSaveMessageOpen(false)}
                message="保存しました"
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                slotProps={{
                    content: {
                        sx: {
                            borderRadius: 3,
                            backgroundColor: "#ffffff",
                            color: "text.secondary",
                            fontWeight: "bold",
                            textAlign: "center",
                            justifyContent: "center",
                            mb: 1,
                        },
                    },
                }}
            />
        </Box>
    )
}

export default ExpenseFormPage;