import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container, Dialog, TextField, Typography } from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/ja";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const categories = [
    { id: "food", name: "食費" },
    { id: "daily", name: "日用品" },
    { id: "transportation", name: "交通費" },
    { id: "medical", name: "医療費" },
    { id: "entertainment", name: "娯楽" },
    { id: "other", name: "その他" },
];

const today = new Date();

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

function ExpenseFormPage() {
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

    function goToPreviousDate() {
        setSelectedDate((currentDate) => currentDate.subtract(1, "day"));
    }

    function goToNextDate() {
        setSelectedDate((currentDate) => currentDate.add(1, "day"));
    }

    function handleSubmit() {
        if (amount === "") {
            alert("金額を入力してください");
            return;
        }

        const newExpense = {
            amount: Number(amount),
            categoryId: selectedCategoryId,
            date: selectedDate.format("YYYY-MM-DD"),
            shopName,
            memo,
        };

        console.log(newExpense)
        alert("入力内容を確認しました");
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 5 }}>
            <Container maxWidth="sm">

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