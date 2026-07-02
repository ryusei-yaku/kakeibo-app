import { Box, Container, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type AuthLayoutProps = {
    title: string;
    description: string;
    children: ReactNode;
};

function AuthLayout({ title, description, children }: AuthLayoutProps) {
    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 4 }}>
            <Container maxWidth="sm">
                <Stack spacing={2.5}>
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{ fontWeight: "bold", color: "#333333" }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mt: 1, fontWeight: "bold", lineHeight: 1.7 }}
                        >
                            {description}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            p: 2.5,
                            border: "1px solid #eeeeee",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        {children}
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default AuthLayout;