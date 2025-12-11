'use client';
import AuthLayout from "../AuthLayout";
import MedicationPage from "../components/MedicationPage";
import SidebarLayout from "../patient/_components/Navbar";

export default function Medication() {
    return (
        <AuthLayout>
            <SidebarLayout activeSection="Medication Prescribed" >
                <MedicationPage />
            </SidebarLayout>
        </AuthLayout>
    );
}