import { useState } from "react";
import { registerSW } from "virtual:pwa-register";

export function usePWAUpdate() {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [offlineReady, setOfflineReady] = useState(false);

    const updateSW = registerSW({
        onNeedRefresh() {
            setNeedRefresh(true);
        },
        onOfflineReady() {
            setOfflineReady(true);
        },
        onRegisterError(error) {
            console.error("SW registration failed:", error);
        },
    });

    return { needRefresh, offlineReady, updateSW, setNeedRefresh, setOfflineReady };
}