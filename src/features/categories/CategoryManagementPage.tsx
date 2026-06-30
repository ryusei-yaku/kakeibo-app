import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import {
    Box,
    Button,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types/category";

type CategoryManagementPageProps = {
    categories: Category[];
    onAddCategory: (categoryName: string) => void;
};

function CategoryManagementPage({
    categories,
    onAddCategory,
}: CategoryManagementPageProps) {
    const navigate = useNavigate();

    const [categoryName, setCategoryName] = useState("");

    function handleAddCategory() {
        const trimmedCategoryName = categoryName.trim();

        if (trimmedCategoryName === "") {
            return;
        }

        onAddCategory(trimmedCategoryName);
        setCategoryName("");
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Stack spacing={2.5}>
                    <Button
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            alignSelf: "flex-start",
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        戻る
                    </Button>

                    <Box>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{ fontWeight: "bold", color: "#333333" }}
                        >
                            カテゴリー管理
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mt: 0.5, fontWeight: "bold" }}
                        >
                            支出入力で使うカテゴリーを追加できます。
                        </Typography>
                    </Box>

                    {/* カテゴリー追加フォーム */}
                    <Box
                        sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            p: 2,
                            border: "1px solid #eeeeee",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Typography
                                sx={{
                                    fontWeight: "bold",
                                    color: "text.secondary",
                                }}
                            >
                                新しいカテゴリー
                            </Typography>

                            <TextField
                                value={categoryName}
                                onChange={(event) => setCategoryName(event.target.value)}
                                placeholder="例：美容"
                                variant="standard"
                                fullWidth
                                slotProps={{
                                    input: {
                                        disableUnderline: true,
                                    },
                                }}
                                sx={{
                                    backgroundColor: "#fde7cd",
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1,
                                    "& input": {
                                        fontSize: 18,
                                        fontWeight: "bold",
                                    },
                                }}
                            />

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                                onClick={handleAddCategory}
                                sx={{
                                    py: 1.4,
                                    borderRadius: 3,
                                    fontWeight: "bold",
                                    backgroundColor: "#f59e0b",
                                    "&:hover": {
                                        backgroundColor: "#d97706",
                                    },
                                }}
                            >
                                追加する
                            </Button>
                        </Stack>
                    </Box>

                    {/* 登録済みカテゴリー一覧 */}
                    <Box>
                        <Typography
                            sx={{
                                mb: 1,
                                fontWeight: "bold",
                                color: "text.secondary",
                            }}
                        >
                            登録済みカテゴリー
                        </Typography>

                        <Stack spacing={1}>
                            {categories.map((category) => (
                                <Box
                                    key={category.id}
                                    sx={{
                                        backgroundColor: "#ffffff",
                                        borderRadius: 3,
                                        px: 2,
                                        py: 1.5,
                                        border: "1px solid #eeeeee",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#333333",
                                        }}
                                    >
                                        {category.name}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default CategoryManagementPage;