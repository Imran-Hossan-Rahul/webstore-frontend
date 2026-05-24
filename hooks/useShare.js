import { useToast } from "@/components/ui/ToastProvider";

export const useShare = () => {
    const { showToast } = useToast();

    const share = async ({ title, text, url }) => {
        const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title || "Check this out",
                    text: text || "",
                    url: fullUrl
                });
            } catch (err) {
                // Ignore AbortError as it means the user cancelled the share menu
                if (err.name !== 'AbortError') {
                    fallbackShare(fullUrl);
                }
            }
        } else {
            fallbackShare(fullUrl);
        }
    };

    const fallbackShare = async (fullUrl) => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            showToast("Link copied to clipboard!", "success");
        } catch (err) {
            showToast("Failed to copy link", "error");
        }
    };

    return { share };
};
