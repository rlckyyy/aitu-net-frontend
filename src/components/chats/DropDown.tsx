import {useState, useRef, useEffect} from 'react';
import {MoreVertical} from 'lucide-react';
import Link from "next/link";

export default function Dropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="inline-flex justify-center items-center w-full rounded-md border border-indigo-950 shadow-sm px-4 py-2 bg-indigo-800 text-sm font-medium text-white hover:bg-indigo-900 focus:outline-none focus:ring-indigo-950"
                aria-label={"Open Dropdown Menu"}
            >
                <MoreVertical className={"w-5 h-5 text-gray-600 dark:text-gray-300"}/>
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                        <li>
                            <Link href={"/chat/group/new"}
                                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >New group</Link>
                        </li>
                        <li>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mock</a>
                        </li>
                        <li>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mock</a>
                        </li>
                        <li>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mock</a>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
