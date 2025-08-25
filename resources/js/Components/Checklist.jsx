import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const Checklist = forwardRef(({
    taskId,
    checklists = [],
    onChecklistChange,
    isModal = false,
    className = '',
    useAjax = true
}, ref) => {
    const [items, setItems] = useState(checklists);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [localChanges, setLocalChanges] = useState([]);
    const newItemInputRef = useRef(null);
    const editInputRef = useRef(null);

    useEffect(() => {
        setItems(checklists);
    }, [checklists]);

    useEffect(() => {
        if (isAdding && newItemInputRef.current) {
            newItemInputRef.current.focus();
        }
    }, [isAdding]);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const handleAddItem = async () => {
        if (!newItemTitle.trim()) return;

        if (useAjax) {
            setIsProcessing(true);
            try {
                const response = await fetch(route('tasks.checklists.store', taskId), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    },
                    body: JSON.stringify({ title: newItemTitle.trim() }),
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const result = await response.json();
                    const newItem = result.checklist;
                    const updatedItems = [...items, newItem];
                    setItems(updatedItems);
                    setNewItemTitle('');
                    setIsAdding(false);
                    
                    if (onChecklistChange) {
                        onChecklistChange(updatedItems);
                    }
                }
            } catch (error) {
                console.error('Ошибка при создании чек-листа:', error);
            } finally {
                setIsProcessing(false);
            }
        } else {
            // Локальное добавление без AJAX
            const newItem = {
                id: `temp_${Date.now()}`,
                title: newItemTitle.trim(),
                is_completed: false,
                sort_order: items.length + 1,
                task_id: taskId
            };
            const updatedItems = [...items, newItem];
            setItems(updatedItems);
            setNewItemTitle('');
            setIsAdding(false);
            
            // Сохраняем изменение для последующей отправки
            setLocalChanges(prev => [...prev, { type: 'create', item: newItem }]);
            
            if (onChecklistChange) {
                onChecklistChange(updatedItems);
            }
        }
    };

    const handleToggleItem = async (item) => {
        if (useAjax) {
            setIsProcessing(true);
            try {
                const response = await fetch(route('tasks.checklists.toggle', [taskId, item.id]), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    },
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const updatedItems = items.map(i => 
                        i.id === item.id ? { ...i, is_completed: !i.is_completed } : i
                    );
                    setItems(updatedItems);
                    
                    if (onChecklistChange) {
                        onChecklistChange(updatedItems);
                    }
                }
            } catch (error) {
                console.error('Ошибка при переключении статуса:', error);
            } finally {
                setIsProcessing(false);
            }
        } else {
            // Локальное переключение без AJAX
            const updatedItems = items.map(i => 
                i.id === item.id ? { ...i, is_completed: !i.is_completed } : i
            );
            setItems(updatedItems);
            
            // Сохраняем изменение для последующей отправки
            setLocalChanges(prev => [...prev, { type: 'toggle', item: { ...item, is_completed: !item.is_completed } }]);
            
            if (onChecklistChange) {
                onChecklistChange(updatedItems);
            }
        }
    };

    const handleStartEdit = (item) => {
        setEditingId(item.id);
        setEditingTitle(item.title);
    };

    const handleSaveEdit = async (item) => {
        if (!editingTitle.trim()) return;

        if (useAjax) {
            setIsProcessing(true);
            try {
                const response = await fetch(route('tasks.checklists.update', [taskId, item.id]), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    },
                    body: JSON.stringify({ title: editingTitle.trim() }),
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const updatedItems = items.map(i => 
                        i.id === item.id ? { ...i, title: editingTitle.trim() } : i
                    );
                    setItems(updatedItems);
                    setEditingId(null);
                    setEditingTitle('');
                    
                    if (onChecklistChange) {
                        onChecklistChange(updatedItems);
                    }
                }
            } catch (error) {
                console.error('Ошибка при обновлении чек-листа:', error);
            } finally {
                setIsProcessing(false);
            }
        } else {
            // Локальное обновление без AJAX
            const updatedItems = items.map(i => 
                i.id === item.id ? { ...i, title: editingTitle.trim() } : i
            );
            setItems(updatedItems);
            setEditingId(null);
            setEditingTitle('');
            
            // Сохраняем изменение для последующей отправки
            setLocalChanges(prev => [...prev, { type: 'update', item: { ...item, title: editingTitle.trim() } }]);
            
            if (onChecklistChange) {
                onChecklistChange(updatedItems);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingTitle('');
    };

    const handleDeleteItem = async (item) => {
        if (!confirm('Вы уверены, что хотите удалить этот пункт?')) return;

        if (useAjax) {
            setIsProcessing(true);
            try {
                const response = await fetch(route('tasks.checklists.destroy', [taskId, item.id]), {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    },
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const updatedItems = items.filter(i => i.id !== item.id);
                    setItems(updatedItems);
                    
                    if (onChecklistChange) {
                        onChecklistChange(updatedItems);
                    }
                }
            } catch (error) {
                console.error('Ошибка при удалении чек-листа:', error);
            } finally {
                setIsProcessing(false);
            }
        } else {
            // Локальное удаление без AJAX
            const updatedItems = items.filter(i => i.id !== item.id);
            setItems(updatedItems);
            
            // Сохраняем изменение для последующей отправки
            setLocalChanges(prev => [...prev, { type: 'delete', item }]);
            
            if (onChecklistChange) {
                onChecklistChange(updatedItems);
            }
        }
    };

    const handleKeyPress = (e, action, ...args) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action(...args);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (action === handleCancelEdit) {
                handleCancelEdit();
            } else if (action === handleAddItem) {
                setIsAdding(false);
                setNewItemTitle('');
            }
        }
    };

    const completedCount = items.filter(item => item.is_completed).length;
    const totalCount = items.length;

    // Функция для получения локальных изменений (для TaskForm)
    const getLocalChanges = () => localChanges;

    // Экспортируем методы через ref
    useImperativeHandle(ref, () => ({
        getLocalChanges,
        getItems: () => items
    }));

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-primary">Чек-лист</h3>
                {totalCount > 0 && (
                    <span className="text-xs text-text-secondary">
                        {completedCount} из {totalCount} выполнено
                    </span>
                )}
            </div>

            {items.length > 0 && (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 group">
                            <button
                                onClick={() => handleToggleItem(item)}
                                disabled={isProcessing}
                                className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-card-bg ${
                                    item.is_completed
                                        ? 'bg-accent-green border-accent-green text-white'
                                        : 'border-border-color hover:border-accent-blue'
                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {item.is_completed && (
                                    <svg className="w-3 h-3 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>

                            <div className="flex-1 min-w-0">
                                {editingId === item.id ? (
                                    <input
                                        ref={editInputRef}
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, handleSaveEdit, item)}
                                        className="w-full bg-card-bg border border-border-color rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
                                        placeholder="Название пункта"
                                    />
                                ) : (
                                    <span className={`text-sm ${item.is_completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                                        {item.title}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {editingId === item.id ? (
                                    <>
                                        <button
                                            onClick={() => handleSaveEdit(item)}
                                            disabled={isProcessing}
                                            className="p-1 text-accent-green hover:text-accent-green/80 transition-colors duration-200"
                                            title="Сохранить"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="p-1 text-accent-red hover:text-accent-red/80 transition-colors duration-200"
                                            title="Отменить"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleStartEdit(item)}
                                            disabled={isProcessing}
                                            className="p-1 text-accent-blue hover:text-accent-blue/80 transition-colors duration-200"
                                            title="Редактировать"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item)}
                                            disabled={isProcessing}
                                            className="p-1 text-accent-red hover:text-accent-red/80 transition-colors duration-200"
                                            title="Удалить"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding ? (
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5">
                        <div className="w-5 h-5 border-2 border-border-color rounded"></div>
                    </div>
                    <input
                        ref={newItemInputRef}
                        type="text"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, handleAddItem)}
                        placeholder="Добавить новый пункт..."
                        className="flex-1 bg-card-bg border border-border-color rounded px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
                    />
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleAddItem}
                            disabled={isProcessing || !newItemTitle.trim()}
                            className="p-1 text-accent-green hover:text-accent-green/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Добавить"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                setIsAdding(false);
                                setNewItemTitle('');
                            }}
                            className="p-1 text-accent-red hover:text-accent-red/80 transition-colors duration-200"
                            title="Отменить"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors duration-200"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Добавить пункт
                </button>
            )}

            {totalCount > 0 && (
                <div className="pt-2">
                    <div className="w-full bg-border-color rounded-full h-2">
                        <div 
                            className="bg-accent-green h-2 rounded-full transition-all duration-300"
                            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Checklist;
