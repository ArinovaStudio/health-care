'use client';
import AuthLayout from "../AuthLayout";
import EmergencyAccessPage from "../components/EmergencyAccessPage"
import SidebarLayout from "../patient/_components/Navbar";

export default function EmergencyAccess() {
    return (
        <AuthLayout>
            <SidebarLayout activeSection="Emergency Access">
                <EmergencyAccessPage />
            </SidebarLayout>
        </AuthLayout>
    );
}