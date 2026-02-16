// Remotion-inspired "Cinematic" Physics
// Source: skills/remotion-best-practices (Organic Motion)

export const SPRING_PHYSICS: any = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
};

export const SPRING_SLOW: any = {
    type: "spring",
    stiffness: 200,
    damping: 40,
    mass: 1
};

// Orchestration Variants
export const STAGGER_CONTAINER: any = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const FADE_UP_ITEM: any = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: SPRING_PHYSICS
    }
};

export const SCALE_UP_ITEM: any = {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
        opacity: 1,
        scale: 1,
        transition: SPRING_PHYSICS
    }
};

export const SLIDE_IN_RIGHT: any = {
    hidden: { x: 20, opacity: 0 },
    show: {
        x: 0,
        opacity: 1,
        transition: SPRING_PHYSICS
    }
};
