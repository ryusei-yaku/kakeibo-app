import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types/category";

type CategorySelectorProps = {
    categories: Category[];
    selectedCategoryId: string;
    onSelectCategory: (categoryId: string) => void;
    showEditButton?: boolean;
};

function CategorySelector({
    categories,
    selectedCategoryId,
    onSelectCategory,
    showEditButton = false,
}: CategorySelectorProps) {
    const navigate = useNavigate();

    return (
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
                        onClick={() => onSelectCategory(category.id)}
                        sx={{
                            borderRadius: 3,
                            py: 1.5,
                            px: 0.5,
                            fontWeight: "bold",
                            backgroundColor: isSelected
                                ? "#f59e0b"
                                : category.isDeleted
                                    ? "#eeeeee"
                                    : "#fde7cd",
                            color: isSelected
                                ? "#ffffff"
                                : category.isDeleted
                                    ? "text.secondary"
                                    : "#555555",
                            borderColor: category.isDeleted ? "#cccccc" : "#f59e0b",

                            // MUI Button の英字自動大文字化を止める
                            textTransform: "none",

                            // 3列グリッド内で横にはみ出さないようにする
                            minWidth: 0,
                            width: "100%",
                            overflow: "hidden",

                            "&:hover": {
                                backgroundColor: isSelected
                                    ? "#d97706"
                                    : category.isDeleted
                                        ? "#e5e5e5"
                                        : "#fbd4a7",
                                borderColor: category.isDeleted ? "#bbbbbb" : "#d97706",
                            },
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                display: "block",
                                width: "100%",
                                minWidth: 0,

                                // 長いカテゴリー名は1行で省略する
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",

                                // 削除済み表示は少し小さくする
                                fontSize: category.isDeleted ? 12 : 14,
                            }}
                        >
                            {category.isDeleted ? `${category.name}（削除済み）` : category.name}
                        </Box>
                    </Button>
                );
            })}

            {showEditButton && (
                <Button
                    variant="outlined"
                    onClick={() => navigate("/categories/manage")}
                    sx={{
                        borderRadius: 3,
                        py: 1.5,
                        px: 0.5,
                        fontWeight: "bold",
                        backgroundColor: "#f6f4ef",
                        color: "#555555",
                        borderColor: "#f59e0b",
                        whiteSpace: "nowrap",
                        fontSize: {
                            xs: 13,
                            sm: 14,
                        },
                        minWidth: 0,
                        textTransform:"none",
                        "&:hover": {
                            backgroundColor: "#fbd4a7",
                            borderColor: "#d97706",
                        },
                    }}
                >
                    編集・追加＞
                </Button>
            )}
        </Box>
    );
}

export default CategorySelector;