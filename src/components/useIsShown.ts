import React, {useEffect, useRef, useState} from "react";

export function useIsShown<T extends Element>(): [React.RefObject<T | null>, boolean] {
    const ref = useRef<T>(null)
    const [isShown, setIsShown] = useState<boolean>(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entries]) => {
            setIsShown(entries.isIntersecting)
        });

        if (!ref.current) {
            return
        }

        observer.observe(ref.current)

        return () => {
            ref.current && observer.unobserve(ref.current)
        }
    }, [ref]);

    return [ref, isShown]
}