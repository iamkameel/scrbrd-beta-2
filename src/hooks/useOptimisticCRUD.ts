"use client";

import { useOptimistic, useTransition, useCallback } from "react";
import { toast } from "sonner";

export type OptimisticAction<T> =
    | { type: "add"; item: T }
    | { type: "update"; id: string; updates: Partial<T> }
    | { type: "delete"; id: string };

/**
 * A reusable hook for optimistic CRUD operations.
 * Provides immediate UI feedback while server actions are processing.
 * 
 * @example
 * const { optimisticItems, addItem, updateItem, deleteItem, isPending } = useOptimisticCRUD({
 *   items: transactions,
 *   idKey: 'id',
 *   onAdd: addTransactionAction,
 *   onUpdate: updateTransactionAction,
 *   onDelete: deleteTransactionAction
 * });
 */
export function useOptimisticCRUD<T extends { id: string }>({
    items,
    onAdd,
    onUpdate,
    onDelete,
}: {
    items: T[];
    onAdd?: (item: Omit<T, "id">) => Promise<{ success: boolean; message?: string }>;
    onUpdate?: (id: string, updates: Partial<T>) => Promise<{ success: boolean; message?: string }>;
    onDelete?: (id: string) => Promise<{ success: boolean; message?: string }>;
}) {
    const [isPending, startTransition] = useTransition();

    const [optimisticItems, setOptimisticItems] = useOptimistic<T[], OptimisticAction<T>>(
        items,
        (currentItems, action) => {
            switch (action.type) {
                case "add":
                    return [...currentItems, action.item];
                case "update":
                    return currentItems.map((item) =>
                        item.id === action.id ? { ...item, ...action.updates } : item
                    );
                case "delete":
                    return currentItems.filter((item) => item.id !== action.id);
                default:
                    return currentItems;
            }
        }
    );

    const addItem = useCallback(
        async (newItem: Omit<T, "id">) => {
            if (!onAdd) return { success: false, message: "Add not configured" };

            // Create a temporary item with a temp ID for optimistic update
            const tempItem = { ...newItem, id: `temp-${Date.now()}` } as T;

            startTransition(async () => {
                setOptimisticItems({ type: "add", item: tempItem });
            });

            const result = await onAdd(newItem);

            if (result.success) {
                toast.success("Item added successfully");
            } else {
                toast.error(result.message || "Failed to add item");
            }

            return result;
        },
        [onAdd, setOptimisticItems]
    );

    const updateItem = useCallback(
        async (id: string, updates: Partial<T>) => {
            if (!onUpdate) return { success: false, message: "Update not configured" };

            startTransition(async () => {
                setOptimisticItems({ type: "update", id, updates });
            });

            const result = await onUpdate(id, updates);

            if (result.success) {
                toast.success("Item updated successfully");
            } else {
                toast.error(result.message || "Failed to update item");
            }

            return result;
        },
        [onUpdate, setOptimisticItems]
    );

    const deleteItem = useCallback(
        async (id: string) => {
            if (!onDelete) return { success: false, message: "Delete not configured" };

            startTransition(async () => {
                setOptimisticItems({ type: "delete", id });
            });

            const result = await onDelete(id);

            if (result.success) {
                toast.success("Item deleted successfully");
            } else {
                toast.error(result.message || "Failed to delete item");
            }

            return result;
        },
        [onDelete, setOptimisticItems]
    );

    return {
        optimisticItems,
        addItem,
        updateItem,
        deleteItem,
        isPending,
    };
}

/**
 * Simpler hook for just delete operations with optimistic updates.
 * Useful for list views where you want immediate visual feedback.
 */
export function useOptimisticDelete<T extends { id: string }>({
    items,
    onDelete,
}: {
    items: T[];
    onDelete: (id: string) => Promise<{ success: boolean; message?: string }>;
}) {
    const [isPending, startTransition] = useTransition();

    const [optimisticItems, setOptimisticItems] = useOptimistic<T[], { id: string }>(
        items,
        (currentItems, action) => currentItems.filter((item) => item.id !== action.id)
    );

    const handleDelete = useCallback(
        async (id: string, entityName?: string) => {
            startTransition(async () => {
                setOptimisticItems({ id });
            });

            const result = await onDelete(id);

            if (result.success) {
                toast.success(`${entityName || "Item"} deleted successfully`);
            } else {
                toast.error(result.message || `Failed to delete ${entityName || "item"}`);
            }

            return result;
        },
        [onDelete, setOptimisticItems]
    );

    return {
        optimisticItems,
        handleDelete,
        isPending,
    };
}
