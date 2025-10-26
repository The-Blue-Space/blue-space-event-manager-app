import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

type Props = {
    trigger: React.ReactNode;
    children: React.ReactNode;
    contentClassName?: string;
    triggerClassName?: string;
    side?: "top" | "bottom" | "left" | "right";
    delay?:number 
}

export default function AppHoverCard({ trigger, children, contentClassName, triggerClassName, side , delay }: Props) {
    return (
        <HoverCard openDelay={delay}>
            <HoverCardTrigger asChild className={triggerClassName}>{trigger}</HoverCardTrigger>
            <HoverCardContent className={contentClassName} side={side}>{children}</HoverCardContent>
        </HoverCard>
    );
}