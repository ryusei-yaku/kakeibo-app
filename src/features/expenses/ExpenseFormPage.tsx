import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";

const categories = [
    { id: "food", name: "食費" },
    { id: "daily", name: "日用品" },
    { id: "transportation", name: "交通費" },
    { id: "medical", name: "医療費" },
    { id: "entertainment", name: "娯楽" },
    { id: "other", name: "その他" },
];

const years = [2025, 2026, 2027, 2028];
const months = Array.from({ length: 12 }, (_, index) => index + 1);
const days = Array.from({ length: 31 }, (_, index) => index + 1);

function ExpenseFormPage() {
    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Typography variant="h4" component="h1" sx={{ fontSize: "bold" }}>
                    支出を入力する
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    金額や店名を入力して、支出を記録します。
                </Typography>

                <Typography sx={{ mt: 3, fontWeight: "bold" }}>
                    日付
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>


                    <TextField select label="年" defaultValue={2026} fullWidth>
                        {years.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}年
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField select label="月" defaultValue={1} fullWidth>
                        {months.map((month) => (
                            <MenuItem key={month} value={month}>
                                {month}月
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField select label="日" defaultValue={1} fullWidth>
                        {days.map((day) => (
                            <MenuItem key={day} value={day}>
                                {day}日
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
                <TextField
                    label="金額"
                    type="number"
                    placeholder="金額を数字で入力"
                    fullWidth
                    sx={{ mt: 3 }}
                />

                <TextField
                    select
                    label="カテゴリー"
                    defaultValue="food"
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            {category.name}
                        </MenuItem>
                    ))}
                </TextField>

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
        </Box>
    )
}

export default ExpenseFormPage;