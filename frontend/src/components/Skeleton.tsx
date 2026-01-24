const Skeleton = ({ className }: { className?: string }) => {
    return (
        <div className={`shimmer bg-slate-800/60 rounded-xl border border-white/5 relative overflow-hidden ${className}`}>
            {/* The shimmer pulse is handled via CSS ::after in index.css */}
        </div>
    );
};

export default Skeleton;
