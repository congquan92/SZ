import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function SizeZoom({
    isOpen,
    onClose,
    media,
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onResetZoom,
}: {
    isOpen: boolean;
    onClose: () => void;
    media: { url: string; isVideo: boolean } | null;
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
}) {
    return (
        <>
            {/* Lightbox Dialog */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl w-full p-0 overflow-hidden bg-black/95">
                    <div className="relative w-full h-[85vh] flex items-center justify-center overflow-auto p-4">
                        {media?.isVideo ? (
                            <video src={media.url} className="max-w-full max-h-full object-contain transition-transform duration-200" style={{ transform: `scale(${zoomLevel})` }} controls autoPlay />
                        ) : (
                            <img src={media?.url} alt="Preview" className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-zoom-in" style={{ transform: `scale(${zoomLevel})` }} onClick={onZoomIn} />
                        )}
                    </div>

                    {/* Hướng dẫn */}
                    {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">Click ảnh hoặc dùng nút +/- để phóng to/thu nhỏ</div> */}
                    {/* Zoom Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
                        <Button variant="secondary" size="icon" onClick={onZoomOut} disabled={zoomLevel <= 0.5} className="bg-white/20 hover:bg-white/30 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                                <line x1="8" x2="14" y1="11" y2="11" />
                            </svg>
                        </Button>
                        <Button variant="secondary" size="sm" onClick={onResetZoom} className="bg-white/20 hover:bg-white/30 text-white px-3">
                            {Math.round(zoomLevel * 100)}%
                        </Button>
                        <Button variant="secondary" size="icon" onClick={onZoomIn} disabled={zoomLevel >= 3} className="bg-white/20 hover:bg-white/30 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                                <line x1="11" x2="11" y1="8" y2="14" />
                                <line x1="8" x2="14" y1="11" y2="11" />
                            </svg>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
