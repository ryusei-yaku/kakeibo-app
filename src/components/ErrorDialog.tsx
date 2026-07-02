import ErrorIcon from "@mui/icons-material/Error";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

type ErrorDialogProps = {
    open: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    onRetry?: () => void;
};

function ErrorDialog({
    open,
    title = "エラーが発生しました",
    message,
    onClose,
    onRetry,
}: ErrorDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle
                sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    borderBottom: "1px solid #e0e0e0",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <ErrorIcon
                        sx={{
                            fontSize: 40,

                            // アプリ全体の柔らかい雰囲気に合わせて、強い赤ではなくテーマカラーのオレンジにする
                            color: "#f59e0b",
                        }}
                    />

                    {title}
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Typography
                    sx={{
                        color: "text.secondary",
                        lineHeight: 1.8,
                        textAlign: "left",
                        fontWeight: "bold",
                    }}
                >
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 0,
                    display: "flex",
                    borderTop: "1px solid #e0e0e0",
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 0,
                        fontWeight: "bold",
                        color: "text.secondary",
                    }}
                >
                    閉じる
                </Button>

                {onRetry !== undefined && (
                    <Button
                        onClick={onRetry}
                        sx={{
                            flex: 1,
                            py: 1.5,
                            borderRadius: 0,
                            fontWeight: "bold",
                            color: "#f59e0b",
                            borderLeft: "1px solid #e0e0e0",
                        }}
                    >
                        再試行
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default ErrorDialog;