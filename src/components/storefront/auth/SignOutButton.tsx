"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/storefront/ui/Icon";

interface SignOutButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    return (
        <button onClick={handleSignOut} className={className}>
            {children || (
                <>
                    <Icon name="logout" className="text-xl" />
                    <span>Sign Out</span>
                </>
            )}
        </button>
    );
}
