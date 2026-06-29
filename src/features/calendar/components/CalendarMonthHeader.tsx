import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
    Box,
    IconButton,
    Typography,
} from "@mui/material";

// CalendarMonthHeader が受け取るデータの型
type CalendarMonthHeaderProps = {
    displayMonthText: string;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
};

function CalendarMonthHeader({
    displayMonthText,
    onPreviousMonth,
    onNextMonth,
}: CalendarMonthHeaderProps) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}
        >
            {/* 前月へ移動するボタン */}
            <IconButton
                onClick={onPreviousMonth}
                aria-label="前月へ移動"
                sx={{ color: "text.secondary" }}
            >
                <ChevronLeftIcon />
            </IconButton>

            {/* 現在表示している年月 */}
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: "#fde7cd",
                    borderRadius: 2,
                    py: 0,
                    textAlign: "center",
                }}
            >
                <Typography
                    sx={{
                        fontWeight: "bold",
                        fontSize: 22,
                        color: "#666666",
                    }}
                >
                    {displayMonthText}
                </Typography>
            </Box>

            {/* 次月へ移動するボタン */}
            <IconButton
                onClick={onNextMonth}
                aria-label="次月へ移動"
                sx={{ color: "text.secondary" }}
            >
                <ChevronRightIcon />
            </IconButton>
        </Box>
    );
}

export default CalendarMonthHeader;