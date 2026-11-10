import { useEffect, useState } from "react";
import { getInventory } from "../scripts/api.js";
 
export function useInventory() {
    const [inventory, setInventory] = useState(null);
    const [error, setError] = useState(null);
 
    useEffect(() => {
        let pageClosed = false;
 
        async function load() {
            try {
                const data = await getInventory();
                if (!pageClosed) {
                    setInventory(data);
                }
            } catch (loadError) {
                if (!pageClosed) {
                    setError(loadError.message);
                }
            }
        }
 
        load();
 
        return () => {
            pageClosed = true;
        };
    }, []);
 
    return { inventory, error };
}