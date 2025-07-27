import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);
    const triggerRef = useRef(null);

    return (
        <>
            <div ref={triggerRef} data-dropdown-trigger onClick={toggleOpen}>{children}</div>
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-card-bg border border-border-color',
    fillContainer = true,
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (open) {
            // Находим триггер в DOM
            const triggerElement = document.querySelector('[data-dropdown-trigger]');
            if (triggerElement) {
                const rect = triggerElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                let left = rect.left + scrollLeft;
                if (align === 'right') {
                    const dropdownWidth = width === '48' ? 192 : width === '64' ? 256 : rect.width;
                    left = rect.right + scrollLeft - dropdownWidth;
                }

                setPosition({
                    top: rect.bottom + scrollTop + 8,
                    left: left,
                    width: width === '48' ? 192 : width === '64' ? 256 : rect.width
                });
            }
        }
    }, [open, align, width]);

    let widthClasses = '';
    if (width === '48') {
        widthClasses = 'w-48';
    } else if (width === '64') {
        widthClasses = 'w-64';
    }
    if (fillContainer) {
        widthClasses = 'w-full';
    }

    if (!open) return null;

    const dropdownContent = (
        <>
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
                    className={`fixed rounded-lg shadow-lg ${widthClasses}`}
                    style={{
                        top: position.top,
                        left: position.left,
                        width: position.width,
                        zIndex: 9999
                    }}
                    onClick={() => setOpen(false)}
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
            
            {/* Overlay */}
            <div
                className="fixed inset-0"
                style={{ zIndex: 9998 }}
                onClick={() => setOpen(false)}
            />
        </>
    );

    return createPortal(dropdownContent, document.body);
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
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
