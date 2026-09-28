import { ElectionClosed } from "@/components/election/ElectionClosed";

export default function ElectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <ElectionClosed />
            <div hidden inert>
                {children}
            </div>
        </>
    );
}
