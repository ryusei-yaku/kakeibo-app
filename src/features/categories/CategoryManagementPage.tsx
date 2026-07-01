import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types/category";

type CategoryManagementPageProps = {
    categories: Category[];
    onAddCategory: (
        categoryName: string,
        categoryType: "expense" | "income",
    ) => void;
    onUpdateCategory: (categoryId: string, categoryName: string) => void;
    onDeleteCategory: (categoryId: string) => void;
};

function CategoryManagementPage({
    categories,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
}: CategoryManagementPageProps) {
    const navigate = useNavigate();

    const [categoryType, setCategoryType] = useState<"expense" | "income">("expense")

    const [categoryName, setCategoryName] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

    const [deleteTargetCategory, setDeleteTargetCategory] = useState<Category | null>(null);

    // 選択中の種類に合うカテゴリーだけを管理画面に表示する
    const displayCategories = categories.filter(
        (category) => category.type === categoryType && !category.isDeleted
    )

    function handleSubmitCategory() {
        const trimmedCategoryName = categoryName.trim();

        if (trimmedCategoryName === "") {
            setErrorMessage("カテゴリー名を入力してください。");
            return;
        }

        const isDuplicateCategory = categories.some(
            (category) =>
                !category.isDeleted &&
                category.type === categoryType &&
                category.name === trimmedCategoryName &&
                category.id !== editingCategoryId
        );

        if (isDuplicateCategory) {
            setErrorMessage("同じ名前のカテゴリーがすでにあります。");
            return;
        }

        if (editingCategoryId === null) {
            onAddCategory(trimmedCategoryName, categoryType);
            setCategoryName("");
            setErrorMessage("");
            return;
        }

        const editingCategory = categories.find(
            (category) => category.id === editingCategoryId
        );

        if (editingCategory === undefined) {
            return;
        }

        // カテゴリー名が変わっていない場合は、確認ダイアログを出さずに編集を終了する
        if (editingCategory.name === trimmedCategoryName) {
            setCategoryName("");
            setEditingCategoryId(null);
            setErrorMessage("");
            return;
        }

        // カテゴリー名が変わっている場合だけ、過去データ変更の確認を出す
        setIsUpdateDialogOpen(true);
    }

    function handleConfirmUpdateCategory() {
        if (editingCategoryId === null) {
            return;
        }

        const trimmedCategoryName = categoryName.trim();

        onUpdateCategory(editingCategoryId, trimmedCategoryName);

        setCategoryName("");
        setEditingCategoryId(null);
        setErrorMessage("");
        setIsUpdateDialogOpen(false);
    }

    function handleConfirmDeleteCategory() {
        if (deleteTargetCategory === null) {
            return;
        }

        onDeleteCategory(deleteTargetCategory.id);

        if (editingCategoryId === deleteTargetCategory.id) {
            setEditingCategoryId(null);
            setCategoryName("");
            setErrorMessage("");
        }

        setDeleteTargetCategory(null);
    }

    function startEditCategory(category: Category) {
        setCategoryType(category.type);
        setEditingCategoryId(category.id);
        setCategoryName(category.name);
        setErrorMessage("");
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
                    </Box>

                    {/* 支出・収入切り替え */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 1,
                            backgroundColor: "#ffffff",
                            borderRadius: 3,
                            p: 0.5,
                        }}
                    >
                        <Button
                            disabled={editingCategoryId !== null}
                            onClick={() => {
                                setCategoryType("expense");
                                setEditingCategoryId(null);
                                setCategoryName("");
                                setErrorMessage("");
                            }}
                            sx={{
                                py: 1.2,
                                borderRadius: 2.5,
                                fontWeight: "bold",
                                backgroundColor: categoryType === "expense" ? "#f59e0b" : "transparent",
                                color: categoryType === "expense" ? "#ffffff" : "#555555",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: categoryType === "expense" ? "#d97706" : "#fde7cd",
                                }
                            }}
                        >
                            支出
                        </Button>
                        <Button
                            disabled={editingCategoryId !== null}
                            onClick={() => {
                                setCategoryType("income");
                                setEditingCategoryId(null);
                                setCategoryName("");
                                setErrorMessage("");
                            }}
                            sx={{
                                py: 1.2,
                                borderRadius: 2.5,
                                fontWeight: "bold",
                                backgroundColor: categoryType === "income" ? "#f59e0b" : "transparent",
                                color: categoryType === "income" ? "#ffffff" : "#555555",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: categoryType === "income" ? "#d97706" : "#fde7cd",
                                }
                            }}
                        >
                            収入
                        </Button>
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
                                {editingCategoryId === null ? "新しいカテゴリー名" : "カテゴリー名を編集"}
                            </Typography>

                            <TextField
                                value={categoryName}
                                onChange={(event) => {
                                    setCategoryName(event.target.value)
                                    setErrorMessage("");
                                }}
                                placeholder={editingCategoryId === null ? "例：美容" : "カテゴリー名を入力"}
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
                            {editingCategoryId !== null && (
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                        fontSize: 13,
                                        fontWeight: "bold",
                                    }}
                                >
                                    保存すると、このカテゴリーを使った過去の支出データにも反映されます。
                                </Typography>
                            )}
                            {errorMessage !== "" && (
                                <Typography
                                    sx={{
                                        color: "#dc2626",
                                        fontSize: 14,
                                        fontWeight: "bold",
                                    }}
                                >
                                    ※{errorMessage}
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={editingCategoryId === null ? <AddIcon /> : undefined}
                                onClick={handleSubmitCategory}
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
                                {editingCategoryId === null ? "追加する" : "保存する"}
                            </Button>
                            {editingCategoryId !== null && (
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setEditingCategoryId(null);
                                        setCategoryName("");
                                        setErrorMessage("");
                                    }}
                                    sx={{
                                        py: 1.2,
                                        borderRadius: 3,
                                        fontWeight: "bold",
                                        color: "#555555",
                                        borderColor: "#f59e0b",
                                        backgroundColor: "#ffffff",
                                        "&:hover": {
                                            backgroundColor: "#fbd4a7",
                                            borderColor: "#d97706",
                                        },
                                    }}
                                >
                                    キャンセル
                                </Button>
                            )}
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
                            {displayCategories.length === 0 ? (
                                <Box
                                    sx={{
                                        backgroundColor: "#ffffff",
                                        borderRadius: 3,
                                        px: 2,
                                        py: 1.5,
                                        border: "1px solid #eeeeee",
                                    }}
                                >
                                    <Typography color="#text.secondary">
                                        登録済みカテゴリーはありません。
                                    </Typography>
                                </Box>
                            ) : (

                                displayCategories.map((category) => {
                                    const isEditing = editingCategoryId === category.id;

                                    return (
                                        <Box
                                            key={category.id}
                                            sx={{
                                                backgroundColor: isEditing ? "#fde7cd" : "#ffffff",
                                                borderRadius: 3,
                                                px: 2,
                                                py: 1.5,
                                                border: isEditing
                                                    ? "1px solid #f59e0b"
                                                    : "1px solid #eeeeee",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 2,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "#333333",
                                                    minWidth: 0,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {category.name}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Button
                                                    size="medium"
                                                    variant="outlined"
                                                    onClick={() => startEditCategory(category)}
                                                    sx={{
                                                        minWidth: 52,
                                                        borderRadius: 2,
                                                        fontWeight: "bold",
                                                        color: "#f59e0b",
                                                        borderColor: "#f59e0b",
                                                        backgroundColor: "#fffaf2",
                                                        "&:hover": {
                                                            backgroundColor: "#fde7cd",
                                                            borderColor: "#d97706",
                                                        },
                                                    }}
                                                >
                                                    編集
                                                </Button>

                                                <Button
                                                    size="medium"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => setDeleteTargetCategory(category)}
                                                    sx={{
                                                        minWidth: 52,
                                                        borderRadius: 2,
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    削除
                                                </Button>
                                            </Box>
                                        </Box>
                                    );
                                })

                            )}
                            {/* カテゴリー名変更確認ダイアログ */}
                            <Dialog
                                open={isUpdateDialogOpen}
                                onClose={() => setIsUpdateDialogOpen(false)}
                                maxWidth="xs"
                                fullWidth
                            >
                                <DialogTitle
                                    sx={{
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        borderBottom: "1px solid #e0e0e0",
                                    }}
                                >
                                    カテゴリー名を変更しますか？
                                </DialogTitle>

                                <DialogActions
                                    sx={{
                                        p: 0,
                                        display: "flex",
                                        borderTop: "1px solid #e0e0e0",
                                    }}
                                >
                                    <Button
                                        onClick={() => setIsUpdateDialogOpen(false)}
                                        sx={{
                                            flex: 1,
                                            py: 1.5,
                                            borderRadius: 0,
                                            fontWeight: "bold",
                                            color: "text.secondary",
                                        }}
                                    >
                                        キャンセル
                                    </Button>

                                    <Button
                                        onClick={handleConfirmUpdateCategory}
                                        sx={{
                                            flex: 1,
                                            py: 1.5,
                                            borderRadius: 0,
                                            fontWeight: "bold",
                                            color: "#f59e0b",
                                            borderLeft: "1px solid #e0e0e0",
                                        }}
                                    >
                                        変更する
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* カテゴリー削除確認ダイアログ */}
                            <Dialog
                                open={deleteTargetCategory !== null}
                                onClose={() => setDeleteTargetCategory(null)}
                                maxWidth="xs"
                                fullWidth
                            >
                                <DialogTitle
                                    sx={{
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        borderBottom: "1px solid #e0e0e0",
                                    }}
                                >
                                    カテゴリーを削除しますか？
                                </DialogTitle>

                                <DialogContent sx={{ pt: 2 }}>
                                    <DialogContentText
                                        sx={{
                                            color: "text.secondary",
                                            lineHeight: 1.8,
                                        }}
                                    >
                                        「{deleteTargetCategory?.name}」は入力画面の選択肢から削除されます。
                                        <br />
                                        過去に登録した支出データは変更されません。
                                    </DialogContentText>
                                </DialogContent>

                                <DialogActions
                                    sx={{
                                        p: 0,
                                        display: "flex",
                                        borderTop: "1px solid #e0e0e0",
                                    }}
                                >
                                    <Button
                                        onClick={() => setDeleteTargetCategory(null)}
                                        sx={{
                                            flex: 1,
                                            py: 1.5,
                                            borderRadius: 0,
                                            fontWeight: "bold",
                                            color: "text.secondary",
                                        }}
                                    >
                                        キャンセル
                                    </Button>

                                    <Button
                                        color="error"
                                        onClick={handleConfirmDeleteCategory}
                                        sx={{
                                            flex: 1,
                                            py: 1.5,
                                            borderRadius: 0,
                                            fontWeight: "bold",
                                            borderLeft: "1px solid #e0e0e0",
                                        }}
                                    >
                                        削除する
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </Box >
    );
}

export default CategoryManagementPage;