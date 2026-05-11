import { getAuthSession } from "@/lib/auth/auth-sessions";
import UserDropdownMenu from "@/components/header/UserSection/UserDropDownMenu";
import HeaderAuthControlsButton from "@/components/header/UserSection/HeaderAuthControlsButton";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function HeaderUserSection() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const [userSession, messages] = await Promise.all([
        getAuthSession(),
        getMessages()
    ]);

    return (
        <>
            <NextIntlClientProvider messages={messages}>
                {userSession ? (
                    <UserDropdownMenu user={userSession.user} />
                ) : (
                    <HeaderAuthControlsButton />
                )}
            </NextIntlClientProvider>
        </>
    )
}