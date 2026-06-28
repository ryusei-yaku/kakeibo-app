import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Box,
    Button,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function MonthlyCategorySummaryPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Stack spacing={2}>
                    <Button
                        onClick={() => navigate("/")}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            alignSelf: "flex-start",
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        ホームへ戻る
                    </Button>

                    <Box>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{ fontWeight: "bold" }}
                        >
                            今月のカテゴリー別内訳
                        </Typography>

                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            今月の支出をカテゴリーごとに確認します。
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default MonthlyCategorySummaryPage;