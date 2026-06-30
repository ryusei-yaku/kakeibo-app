import { Box, Button } from "@mui/material";
import { categories } from "./categories";

type CategorySelectorProps = {
    selectedCategoryId: string;
    onSelectCategory: (categoryId: string) => void;
    showEditButton?: boolean;
};

function CategorySelector({
    selectedCategoryId,
    onSelectCategory,
    showEditButton = false,
}: CategorySelectorProps) {
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
                            fontWeight: "bold",
                            backgroundColor: isSelected ? "#f59e0b" : "#f6f4ef",
                            color: isSelected ? "#ffffff" : "#555555",
                            borderColor: "#f59e0b",
                            "&:hover": {
                                backgroundColor: isSelected ? "#d97706" : "#fbd4a7",
                                borderColor: "#d97706",
                            },
                        }}
                    >
                        {category.name}
                    </Button>
                );
            })}

            {showEditButton && (
                <Button
                    variant="outlined"
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