import { useCallback, useEffect, useState } from "react";
import { getCarbonFactor } from "../scripts/api.js";

//loads the carbon factor for a material once, separately from matching,
export function useCarbonFactor(material) {
  const [carbonFactor, setCarbonFactor] = useState(null);

  useEffect(() => {
    let closed = false;
    fetchCarbonFactor(material).then((factor) => {
      if (!closed && factor !== null) setCarbonFactor(factor);
    });
    return () => {
      closed = true;
    };
  }, [material]);

  const retry = useCallback(() => {
    if (carbonFactor !== null) return;
    fetchCarbonFactor(material).then((factor) => {
      if (factor !== null) setCarbonFactor(factor);
    });
  }, [carbonFactor, material]);

  return { carbonFactor, retry };
}

//resolves to the factor, or null if the API couldn't provide it
async function fetchCarbonFactor(material) {
  try {
    return await getCarbonFactor(material);
  } catch (error) {
    console.warn("Could not load the carbon factor:", error.message);
    return null;
  }
}
