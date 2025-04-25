import Link from "next/link";
import {Group, Home, MessageCircle, User, Users} from "lucide-react";
import {User as UserModel} from "../models/user"
import {useIsMobile} from "@/hooks/useIsMobile";
import React, {ReactNode} from "react";

const defaultIconClassName = "text-indigo-500";
const defaultIconSize = 20;

const authLinks: { href: string, label: string, icon: ReactNode }[] = [
    {href: '/', label: 'Home', icon: <Home size={defaultIconSize} className={defaultIconClassName}/>},
    {href: '/users/profile', label: 'Me', icon: <User size={defaultIconSize} className={defaultIconClassName}/>},
    {href: '/chat', label: 'Chat', icon: <MessageCircle size={defaultIconSize} className={defaultIconClassName}/>},
    {href: '/group', label: 'Group', icon: <Group size={defaultIconSize} className={defaultIconClassName}/>},
    {href: '/friends', label: 'Friends', icon: <Users size={defaultIconSize} className={defaultIconClassName}/>},
];

const publicLinks: { href: string, label: string, icon: ReactNode }[] = [
    {href: '/', label: 'Home', icon: <Home size={defaultIconSize} className={defaultIconClassName}/>},
    {href: '/auth/login', label: 'Login', icon: <User size={defaultIconSize} className={defaultIconClassName}/>},
    {href: '/auth/register', label: 'Register', icon: <Users size={defaultIconSize} className={defaultIconClassName}/>},
];

const linksMap = new Map<boolean, { href: string, label: string, icon: ReactNode }[]>([
    [false, publicLinks],
    [true, authLinks]
])

interface NavLinkProps {
    href: string;
    label: string;
    icon: ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({href, label, icon}) => (
    <Link href={href}
          className={`flex flex-col items-center text-xs text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
        {icon}
        <span className={'text-[10px]'}>{label}</span>
    </Link>
);

interface SidebarComponentProps {
    user: UserModel | null
}

const SidebarComponent: React.FC<SidebarComponentProps> = ({user}) => {
    const navLinks = linksMap.get(!!user) ?? [];
    const isMobile = useIsMobile();

    return (
        <>
            {isMobile ? (
                <nav
                    className="fixed bottom-0 left-0 right-0 z-20 flex md:hidden justify-around items-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-14">
                    {navLinks.map((link, index) => (
                        <NavLink key={index} {...link}/>
                    ))}
                </nav>
            ) : (
                <aside
                    className="hidden md:flex fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-md flex-col">
                    <nav className="p-4 space-y-2">
                        {navLinks.map((link, index) => (
                            <Link key={index} href={link.href}
                                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>
            )}
        </>
    );
};

export default SidebarComponent;