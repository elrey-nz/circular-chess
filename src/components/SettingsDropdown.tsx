import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { BOARD_THEMES, type BoardThemeName } from '../types/boardTheme';
import { cn } from '../lib/utils';

interface SettingsDropdownProps {
    currentTheme: BoardThemeName;
    onThemeChange: (theme: BoardThemeName) => void;
}

const SettingsDropdown = ({ currentTheme, onThemeChange }: SettingsDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "p-2 rounded-md transition-colors",
                    "bg-neutral-800 text-neutral-200 hover:bg-neutral-700",
                    "border border-neutral-700"
                )}
                aria-label="Settings"
            >
                <Settings className="w-5 h-5" />
            </button>

            {isOpen && (
                <div
                    className={cn(
                        "absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50",
                        "bg-neutral-800 border border-neutral-700",
                        "py-1"
                    )}
                >
                    <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase">
                        Board Theme
                    </div>
                    {Object.values(BOARD_THEMES).map((theme) => (
                        <button
                            key={theme.name}
                            onClick={() => {
                                onThemeChange(theme.name);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm transition-colors",
                                "flex items-center gap-2",
                                currentTheme === theme.name
                                    ? "bg-neutral-700 text-white"
                                    : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-4 h-4 rounded border-2",
                                    currentTheme === theme.name
                                        ? "border-white"
                                        : "border-neutral-500"
                                )}
                                style={{
                                    background: `linear-gradient(45deg, ${theme.darkSquare} 25%, ${theme.lightSquare} 25%, ${theme.lightSquare} 75%, ${theme.darkSquare} 75%)`,
                                    backgroundSize: '8px 8px',
                                }}
                            />
                            {theme.displayName}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SettingsDropdown;




