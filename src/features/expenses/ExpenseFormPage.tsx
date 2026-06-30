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
import { formatAmount } from "../../utils/formatAmount";
import { categories } from "../categories/categories";
import { formatDateLabel } from "../../utils/formatDateLabel";

type ExpenseFormPageProps = {
    expenses: Expense[];
    onAddExpense: (expense: Expense) => void;
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
                        支出額
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
                        sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}
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
                                        backgroundColor: isSelected ? "#f59e0b" : "#f6f4ef",
                                        color: isSelected ? "#ffffff" : "#555555",
                                        borderColor: "#f59e0b",
                                        "&:hover": {
                                            backgroundColor: isSelected ? "#d97706" : "#fbd4a7",
                                            borderColor: "#d97706",
                                        },
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
                                backgroundColor: "#f6f4ef",
                                color: "#555555",
                                borderColor: "#f59e0b",
                                whiteSpace: "nowrap",
                                minWidth: "fit-content",
                                px: 1.5,
                                "&:hover": {
                                    backgroundColor: "#fbd4a7",
                                    borderColor: "#d97706",
                                },
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
                        fontWeight: "bold",
                        backgroundColor: "#f59e0b",
                        "&:hover": {
                            backgroundColor: "#d97706",
                        },
                    }}
                >
                    登録する
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
        </Box>
    )
}

export default ExpenseFormPage;