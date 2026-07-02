import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PieChartIcon from "@mui/icons-material/PieChart";
import PersonIcon from "@mui/icons-material/Person";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Skeleton,
    Stack,
} from "@mui/material";

function LoadingScreen() {
    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Stack spacing={3}>
                    {/* ヘッダー部分 */}
                    <Box>
                        <Skeleton variant="text" width="80%" height={40} />
                        <Skeleton variant="text" width="55%" height={26} />
                    </Box>

                    {/* 今月の収支カード */}
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            backgroundColor: "#ffffff",
                            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Skeleton variant="text" width="40%" height={28} />
                            <Skeleton variant="text" width="70%" height={58} />

                            <Stack spacing={1.2} sx={{ mt: 2.5 }}>
                                <Skeleton variant="rounded" height={28} />
                                <Skeleton variant="rounded" height={28} />
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* 入力ボタン */}
                    <Button
                        disabled
                        startIcon={<AddIcon />}
                        sx={{
                            py: 1.8,
                            borderRadius: 3,
                            backgroundColor: "#eeeeee",
                        }}
                    >
                        <Skeleton variant="text" width={80} />
                    </Button>

                    {/* メニュー */}
                    <Stack spacing={1.5}>
                        {[
                            { icon: <CalendarMonthIcon />, width: 120 },
                            { icon: <PieChartIcon />, width: 190 },
                            { icon: <PersonIcon />, width: 130 },
                        ].map((item, index) => (
                            <Button
                                key={index}
                                disabled
                                startIcon={item.icon}
                                endIcon={<ChevronRightIcon />}
                                sx={{
                                    justifyContent: "space-between",
                                    py: 1.6,
                                    px: 2,
                                    borderRadius: 3,
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #eeeeee",
                                }}
                            >
                                <Box sx={{ flex: 1, textAlign: "left" }}>
                                    <Skeleton variant="text" width={item.width} />
                                </Box>
                            </Button>
                        ))}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}

export default LoadingScreen;