import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData, UserParams } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import UploadImageFile from '@/components/upload-image-file';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Профиль',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Пароль',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Внешний вид',
        href: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title="Настройки" description="Управление настройками профиля пользователя" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <div className="mb-5">
                        <UploadImageFile
                            defaultImage={{ fileName: auth.params?.avatar, url: auth.params?.url_avatar }}
                            route={route('profile.params.avatar')}
                            onSuccess={(newAvatarUrl) => {
                                // обновить аватар в состоянии или refetch user
                                console.log(newAvatarUrl);
                            }}
                        />
                    </div>
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.href,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
