import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

const SplitText = ({
                       text,
                       className = "",
                       delay = 100,
                       duration = 0.6,
                       ease = "power3.out",
                       splitType = "chars",
                       from = { opacity: 0, y: 40 },
                       to = { opacity: 1, y: 0 },
                       threshold = 0.1,
                       rootMargin = "-100px",
                       textAlign = "center",
                       onLetterAnimationComplete,
                   }) => {
    const ref = useRef(null);
    const splitterRef = useRef(null);
    const timelineRef = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Revert SplitText trước khi tạo mới để tránh tích lũy
        if (splitterRef.current) {
            splitterRef.current.revert();
        }

        const absoluteLines = splitType === "lines";
        if (absoluteLines) el.style.position = "relative";

        // Tạo GSAP SplitText instance
        splitterRef.current = new GSAPSplitText(el, {
            type: splitType,
            absolute: absoluteLines,
            linesClass: "split-line",
        });

        let targets;
        switch (splitType) {
            case "lines":
                targets = splitterRef.current.lines;
                break;
            case "words":
                targets = splitterRef.current.words;
                break;
            case "words, chars":
                targets = [...splitterRef.current.words, ...splitterRef.current.chars];
                break;
            default:
                targets = splitterRef.current.chars;
        }

        targets.forEach((t) => {
            t.style.willChange = "transform, opacity";
        });

        // Tạo timeline mà không dùng ScrollTrigger để kiểm tra
        timelineRef.current = gsap.timeline({
            smoothChildTiming: true,
            onComplete: onLetterAnimationComplete,
        });

        timelineRef.current.set(targets, { ...from, immediateRender: false, force3D: true });
        timelineRef.current.to(targets, {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            force3D: true,
        });

        // Cleanup khi component unmount
        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
            if (splitterRef.current) {
                splitterRef.current.revert();
            }
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, [splitType, from, to, duration, ease, delay, onLetterAnimationComplete]);

    return (
        <p
            ref={ref}
            className={`split-parent overflow-hidden inline-block whitespace-normal ${className}`}
            style={{
                textAlign,
                wordWrap: "break-word",
            }}
        >
            {text}
        </p>
    );
};

export default SplitText;