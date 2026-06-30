import { Box, Button } from "@mui/material";
import type { Category } from "../../types/category";
import { useNavigate } from "react-router-dom";

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
                            whiteSpace: "nowrap",
                            minWidth: 0,
                            fontSize: category.isDeleted ? 12 : 14,
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
                        {category.isDeleted ? `${category.name}（削除済み）` : category.name}
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