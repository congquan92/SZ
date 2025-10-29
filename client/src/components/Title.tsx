export default function Title({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
    );
}
