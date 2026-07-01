export type Category = {
    id: string;
    name: string;
    type: "expense" | "income";
    displayOrder: number;
    isDeleted: boolean;
};