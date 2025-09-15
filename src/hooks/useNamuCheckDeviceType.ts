import { useEffect } from "react";
import { useAtom } from "jotai";
import { isMobileAtom, isTabletAtom } from "~/utils/atoms";

export const useNamuCheckDeviceType = () => {
  const [isMobile, setIsMobile] = useAtom(isMobileAtom);
  const [isTablet, setIsTablet] = useAtom(isTabletAtom);

  useEffect(() => {
    const checkDeviceType = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth < 1280);
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);

    return () => {
      window.removeEventListener("resize", checkDeviceType);
    };
  }, []);

  return { isMobile, setIsMobile, isTablet, setIsTablet };
};
