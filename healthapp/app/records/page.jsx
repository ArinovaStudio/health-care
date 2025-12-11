'use client';
import AuthLayout from "../AuthLayout"; // Import the AuthLayout
import RecordsPage from "../components/RecordsPage";
import SidebarLayout from "../patient/_components/Navbar";
export default function Records() {
    return (
        <AuthLayout>
            <SidebarLayout activeSection="Medical Records">
                <RecordsPage />
            </SidebarLayout>
        </AuthLayout>
    );
}