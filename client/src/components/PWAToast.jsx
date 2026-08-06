import { usePWAUpdate } from "../hooks/usePWAUpdate";

export default function PWAToast() {
    const { needRefresh, offlineReady, updateSW, setNeedRefresh, setOfflineReady } = usePWAUpdate();

    if (!needRefresh && !offlineReady) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-[#1a1a1a] border border-[#7C3AED]/30 shadow-lg p-4 flex items-center gap-3">
            {needRefresh ? (
                <>
                    <p className="text-sm text-white">A new version of CaptionFlow is available.</p>
                    <button
                        onClick={() => updateSW(true)}
                        className="shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm px-3 py-1.5 rounded-md cursor-pointer transition-colors"
                    >
                        Update now
                    </button>
                    <button
                        onClick={() => setNeedRefresh(false)}
                        className="shrink-0 text-gray-400 hover:text-white text-sm cursor-pointer"
                    >
                        Later
                    </button>
                </>
            ) : (
                <>
                    <p className="text-sm text-white">CaptionFlow is ready to work offline.</p>
                    <button
                        onClick={() => setOfflineReady(false)}
                        className="shrink-0 text-gray-400 hover:text-white text-sm cursor-pointer"
                    >
                        Dismiss
                    </button>
                </>
            )}
        </div>
    );
}