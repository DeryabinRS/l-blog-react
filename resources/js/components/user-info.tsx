import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type SharedData, type User } from '@/types';
import { usePage } from '@inertiajs/react';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const { auth } = usePage<SharedData>().props;
    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={auth.params.url_avatar} alt={auth.params.full_name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {auth.params.full_name}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{auth.params.full_name}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>
        </>
    );
}
