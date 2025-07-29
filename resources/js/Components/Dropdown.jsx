import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative" ref={dropdownRef}>{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <div onClick={toggleOpen}>
            {children}
        </div>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-card-bg border border-border-color',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    let widthClasses = '';
    if (width === '48') {
        widthClasses = 'w-48';
    } else if (width === '64') {
        widthClasses = 'w-64';
    }

    let alignmentClasses = '';
    if (align === 'left') {
        alignmentClasses = 'origin-top-left left-0';
    } else if (align === 'right') {
        alignmentClasses = 'origin-top-right right-0';
    }

    return (
        <Transition
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div
                className={`absolute ${alignmentClasses} mt-2 ${widthClasses} rounded-lg shadow-lg z-[9999]`}
            >
                <div
                    className={
                        `rounded-lg ring-1 ring-border-color/50 ` +
                        contentClasses
                    }
                >
                    {children}
                </div>
            </div>
        </Transition>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    const { setOpen } = useContext(DropDownContext);

    const handleClick = () => {
        setOpen(false);
    };

    return (
        <Link
            {...props}
            onClick={handleClick}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-text-primary transition duration-150 ease-in-out hover:bg-secondary-bg focus:bg-secondary-bg focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
