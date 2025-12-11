'use client';
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { verifyFromExternalAPI } from "@/lib/verifyFromExternalAPI";

const AuthLayout = ({ children }) => {
    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await verifyFromExternalAPI(`/api/auth/status`);
            if (!isAuthenticated) {
                redirect("/");
            }
        };
        checkAuth();
    }, []);

    return <>{children}</>;
};

export default AuthLayout;