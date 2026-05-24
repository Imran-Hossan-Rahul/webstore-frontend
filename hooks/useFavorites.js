import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";

/**
 * 🔖 USE FAVORITES HOOK
 * 
 * Encapsulates all logic for managing saved items, folders, and categories.
 * Provides a clean interface for UI components.
 */
export function useFavorites() {
    const [items, setItems] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchFolders = async () => {
        try {
            const res = await api.get('/favorites/folders');
            if (res.success) setFolders(res.data);
        } catch (err) {
            console.error("Failed to fetch folders:", err);
        }
    };

    const fetchSavedContent = async () => {
        try {
            setLoading(true);
            const res = await api.get('/favorites');
            
            // Type inference logic moved to hook for cleaner UI
            const processedItems = (res.data || []).map(item => {
                if (!item.type) {
                    if (item.slug && !item.priceType && !item.devlogStats) item.type = 'codex';
                    else if (item.code || item.html || item.priceType) item.type = 'artifact';
                    else if (item.budget) item.type = 'job';
                    else item.type = 'devlog';
                }
                return item;
            });

            setItems(processedItems);
        } catch (e) {
            console.error("Failed to fetch saved items:", e);
            showToast("Could not load your saved collection", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id, type) => {
        try {
            if (type === 'note') {
                const res = await api.delete(`/notes/${id}`);
                if (res.success) {
                    setItems(prev => prev.filter(item => (item._id || item.id) !== id));
                    showToast("Note deleted", "success");
                    await fetchFolders();
                }
            } else {
                const res = await api.post('/favorites/toggle', { postId: id, itemType: type });
                if (res.success) {
                    setItems(prev => prev.filter(item => (item._id || item.id) !== id));
                    showToast("Removed from saved items", "success");
                }
            }
        } catch (err) {
            showToast("Failed to remove item", "error");
        }
    };

    const handleMoveToFolder = async (itemId, folderId, itemType) => {
        try {
            const res = await api.post('/favorites/folders/add-item', { itemId, folderId, itemType });
            if (res.success) {
                showToast("Added to folder", "success");
                await fetchFolders(); // Refresh folders to update counts
                window.dispatchEvent(new Event('foldersUpdated'));
            }
        } catch (err) {
            showToast(err.message || "Failed to add to folder", "error");
        }
    };

    const handleRemoveFromFolder = async (itemId, folderId) => {
        try {
            const res = await api.post('/favorites/folders/remove-item', { itemId, folderId });
            if (res.success) {
                showToast("Moved to All Items", "success");
                await fetchFolders();
                window.dispatchEvent(new Event('foldersUpdated'));
            }
        } catch (err) {
            showToast(err.message || "Failed to remove from folder", "error");
        }
    };

    const handleRenameFolder = async (folderId, newName) => {
        try {
            const res = await api.patch(`/favorites/folders/${folderId}/rename`, { name: newName });
            if (res.success) {
                setFolders(prev => prev.map(f => f._id === folderId ? { ...f, name: res.data.name } : f));
                showToast("Folder renamed", "success");
                window.dispatchEvent(new Event('foldersUpdated'));
            }
        } catch (err) {
            showToast(err.message || "Failed to rename folder", "error");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        Promise.all([fetchSavedContent(), fetchFolders()]);

        const handleUpdate = () => fetchFolders();
        window.addEventListener('foldersUpdated', handleUpdate);
        return () => window.removeEventListener('foldersUpdated', handleUpdate);
    }, []);

    return {
        items,
        folders,
        loading,
        handleRemove,
        handleMoveToFolder,
        handleRemoveFromFolder,
        handleRenameFolder,
        refresh: fetchSavedContent
    };
}
