import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Container, Dialog, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "../../lib/dayjs";
import type { Expense } from "../../types/expense";
import { categories } from "../categories/categories";

type ExpenseFormPageProps = {
    expenses: Expense[];
    onAddExpense: (expense: Expense) => void;
}

function formatDateLabel(date: Dayjs) {
    return date.locale("ja").format("YYYY年M月D日(ddd)")
}
//金額をカンマ付きにする。
function formatAmount(value: string) {
    if (value === "") {
        return "";
    }
    return Number(value).toLocaleString();
}

function ExpenseFormPage({ expenses, onAddExpense }: ExpenseFormPageProps) {
    //現在選ばれている日付を保持する。
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    //カレンダーのダイアログが開いているかを保持する。
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    //選択しているカテゴリのIDを保持する。
    const [selectedCategoryId, setSelectedCategoryId] = useState("food");
    //今入力されている金額を保持する。
    const [amount, setAmount] = useState("");
    //店名を保持する
    const [shopName, setShopName] = useState("");
    //メモを保持する
    const [memo, setMemo] = useState("");

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
            amount: Number(amount),
            categoryId: selectedCategory.id,
            categoryName: selectedCategory.name,
            date: selectedDate.format("YYYY-MM-DD"),
            shopName,
            memo,
        };

        onAddExpense(newExpense);

        setAmount("");
        setShopName("");
        setMemo("");
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 2 }}>
            <Container maxWidth="sm">
                <Button
                    onClick={() => navigate("/")}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        mb: 1,
                        color: "text.secondary",
                        fontWeight: "bold"
                    }}
                >
                    ホームへ戻る
                </Button>

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

                    <Button onClick={goToPreviousDate} sx={{ minWidth: 40, fontSize: 24 }}>
                        ＜
                    </Button>

                    <Button
                        onClick={() => setIsDateDialogOpen(true)}
                        fullWidth
                        sx={{
                            flex: 1,
                            background: "#eaf6fd",
                            borderRadius: 2,
                            py: 1,
                            textAlign: "center",
                            color: "text.primary",
                            fontSize: 18,
                            fontWeight: "bold",
                            "&:hover": {
                                backgroundColor: "#dff1fb",
                            },
                        }}
                    >
                        {formatDateLabel(selectedDate)}
                    </Button>

                    <Button onClick={goToNextDate} sx={{ minWidth: 40, fontSize: 24 }}>＞</Button>

                </Box>


                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #e0e0e0",
                        py: 2,
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
                        支出
                    </Typography>

                    <TextField
                        value={formatAmount(amount)}
                        onChange={(event) => {
                            const onlyNumbers = event.target.value.replace(/\D/g, "");
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
                                fontSize: 36,
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

                <Box sx={{ mt: 3 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, fontWeight: "bold" }}
                    >
                        カテゴリー
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 1,
                        }}
                    >
                        {categories.map((category) => {
                            const isSelected = selectedCategoryId === category.id;

                            return (
                                <Button
                                    key={category.id}
                                    variant={isSelected ? "contained" : "outlined"}
                                    onClick={() => setSelectedCategoryId(category.id)}
                                    sx={{
                                        borderRadius: 3,
                                        py: 1.5,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {category.name}
                                </Button>
                            );
                        })}

                        <Button
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                fontWeight: "bold",
                            }}
                        >
                            編集・追加＞
                        </Button>
                    </Box>
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
                        店名
                    </Typography>

                    <TextField
                        value={shopName}
                        onChange={(event) => setShopName(event.target.value)}
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
                                fontSize: 18,
                                lineHeight: 1.6,
                                overflowWrap: "break-word",
                            },
                        }}
                    />
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

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={handleSubmit}
                    sx={{
                        mt: 3,
                        py: 1.8,
                        borderRadius: 3,
                        fontSize: 18,
                        fontWeight: "bold"
                    }}
                >
                    登録する
                </Button>
                <Box sx={{ mt: 4 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, fontWeight: "bold" }}
                    >
                        登録済みの支出
                    </Typography>

                    {expenses.length === 0 ? (
                        <Typography color="text.secondary">
                            まだ支出は登録されていません。
                        </Typography>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {expenses.map((expense) => (
                                <Box
                                    key={expense.id}
                                    sx={{
                                        backgroundColor: "#ffffff",
                                        borderRadius: 3,
                                        p: 2,
                                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 2,
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {expense.categoryName}
                                        </Typography>

                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {expense.amount.toLocaleString()}円
                                        </Typography>
                                    </Box>

                                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                        {expense.date}
                                    </Typography>

                                    {expense.shopName !== "" && (
                                        <Typography sx={{ mt: 1 }}>{expense.shopName}</Typography>
                                    )}

                                    {expense.memo !== "" && (
                                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                            {expense.memo}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
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
        </Box>
    )
}

export default ExpenseFormPage;