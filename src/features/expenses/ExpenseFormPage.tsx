import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container, Dialog, TextField, Typography } from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/ja";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ResetTvRounded } from "@mui/icons-material";

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

function ExpenseFormPage() {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

    const [selectedCategoryId, setSelectedCategoryId] = useState("food");

    function goToPreviousDate() {
        setSelectedDate((currentDate) => currentDate.subtract(1, "day"));
    }

    function goToNextDate() {
        setSelectedDate((currentDate) => currentDate.add(1, "day"));
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Box
                    sx={{
                        backgroundColor: "#ffffff",
                        borderRadius: 4,
                        p: 3,
                        mb: 3,
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)"
                    }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                        支出を入力
                    </Typography>

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


                <TextField
                    label="金額"
                    type="number"
                    placeholder="金額を数字で入力"
                    fullWidth
                    sx={{ mt: 3 }}
                />

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

                <TextField
                    label="店名"
                    type="string"
                    placeholder="店名を入力"
                    fullWidth
                    sx={{ mt: 2 }}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        }
                    }}
                />

                <TextField
                    label="メモ"
                    placeholder="夕食の買い物"
                    multiline
                    minRows={4}
                    fullWidth
                    sx={{ mt: 2 }}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        }
                    }}
                />

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    fullWidth
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