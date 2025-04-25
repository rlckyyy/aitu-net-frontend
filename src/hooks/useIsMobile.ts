import {useEffect, useState} from "react";

export function useIsMobile(MOBILE_BREAKPOINT: number = 768) {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

    function isDeviceMobile() {
        return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
    }

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

        const onChange = () => {
            setIsMobile(isDeviceMobile())
        }

        setIsMobile(isDeviceMobile())

        mql.addEventListener("change", onChange)

        return () => {
            mql.removeEventListener("change", onChange)
        }
    }, [MOBILE_BREAKPOINT]);

    return Boolean(isMobile)
}