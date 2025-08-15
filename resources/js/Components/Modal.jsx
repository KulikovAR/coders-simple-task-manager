import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { useEffect } from 'react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    fullScreenOnMobile = false,
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    // Улучшенное управление скроллом
    useEffect(() => {
        if (show) {
            // Блокируем скролл и компенсируем ширину скроллбара
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [show]);

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '4xl': 'sm:max-w-4xl',
        '6xl': 'sm:max-w-6xl',
    }[maxWidth];

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className={`fixed inset-0 z-50 overflow-hidden ${
                    fullScreenOnMobile 
                        ? 'flex sm:items-center sm:justify-center sm:p-4' 
                        : 'flex items-center justify-center p-2 sm:p-4'
                }`}
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom={fullScreenOnMobile 
                        ? "opacity-0 translate-y-full sm:translate-y-4 sm:scale-95" 
                        : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    }
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo={fullScreenOnMobile 
                        ? "opacity-0 translate-y-full sm:translate-y-4 sm:scale-95"
                        : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    }
                >
                    <DialogPanel
                        className={`
                            relative transform overflow-hidden bg-card-bg border border-border-color shadow-2xl transition-all
                            ${fullScreenOnMobile 
                                ? `w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:mx-auto sm:w-full ${maxWidthClass}` 
                                : `w-full max-h-[90vh] rounded-2xl mx-auto ${maxWidthClass}`
                            }
                        `}
                    >
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
