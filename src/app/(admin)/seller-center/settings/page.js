
import { auth } from "@/auth";
import SettingsForm from "./SettingsForm";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    return <SettingsForm user={session.user} />;
}
