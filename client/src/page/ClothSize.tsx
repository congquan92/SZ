/**
 * ClothSize.tsx
 * Bảng size quần áo (Nam/Nữ) theo phong cách shadcn + Tailwind, dữ liệu tách mảng và render bằng map.
 * - Tabs: Nam / Nữ
 * - Chọn loại: Áo (Tops) / Quần (Bottoms)
 * - Chọn sản phẩm: Tee, Polo, Shirt, Jacket, Hoodie, Sweater / Jeans, Khakis, Shorts, Joggers, Formal
 * - Đổi đơn vị cm/in
 * - Gợi ý chọn size theo số đo người dùng (tuỳ chọn)
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ExternalLink, Info, Ruler } from "lucide-react";
import { useState, useMemo } from "react";

// ====== DỮ LIỆU MẪU (có thể thay bằng API) ======

type SizeRow = {
    size: string; // S, M, L, XL, XXL
    chest?: number; // ngực
    shoulder?: number; // vai
    length?: number; // dài áo
    waist?: number; // eo
    hip?: number; // mông
    thigh?: number; // đùi
    inseam?: number; // dài ống trong
};

// chuẩn cm cho Nam
const MALE_TOPS: Record<string, SizeRow[]> = {
    tee: [
        { size: "S", chest: 94, shoulder: 43, length: 66 },
        { size: "M", chest: 98, shoulder: 45, length: 68 },
        { size: "L", chest: 102, shoulder: 47, length: 70 },
        { size: "XL", chest: 108, shoulder: 49, length: 72 },
        { size: "XXL", chest: 114, shoulder: 51, length: 74 },
    ],
    polo: [
        { size: "S", chest: 92, shoulder: 42, length: 66 },
        { size: "M", chest: 96, shoulder: 44, length: 68 },
        { size: "L", chest: 100, shoulder: 46, length: 70 },
        { size: "XL", chest: 106, shoulder: 48, length: 72 },
        { size: "XXL", chest: 112, shoulder: 50, length: 74 },
    ],
    shirt: [
        { size: "S", chest: 96, shoulder: 43, length: 70 },
        { size: "M", chest: 100, shoulder: 45, length: 72 },
        { size: "L", chest: 104, shoulder: 47, length: 74 },
        { size: "XL", chest: 110, shoulder: 49, length: 76 },
        { size: "XXL", chest: 116, shoulder: 51, length: 78 },
    ],
    jacket: [
        { size: "S", chest: 100, shoulder: 44, length: 66 },
        { size: "M", chest: 104, shoulder: 46, length: 68 },
        { size: "L", chest: 108, shoulder: 48, length: 70 },
        { size: "XL", chest: 114, shoulder: 50, length: 72 },
        { size: "XXL", chest: 120, shoulder: 52, length: 74 },
    ],
    hoodie: [
        { size: "S", chest: 102, shoulder: 45, length: 66 },
        { size: "M", chest: 106, shoulder: 47, length: 68 },
        { size: "L", chest: 110, shoulder: 49, length: 70 },
        { size: "XL", chest: 116, shoulder: 51, length: 72 },
        { size: "XXL", chest: 122, shoulder: 53, length: 74 },
    ],
    sweater: [
        { size: "S", chest: 98, shoulder: 44, length: 64 },
        { size: "M", chest: 102, shoulder: 46, length: 66 },
        { size: "L", chest: 106, shoulder: 48, length: 68 },
        { size: "XL", chest: 112, shoulder: 50, length: 70 },
        { size: "XXL", chest: 118, shoulder: 52, length: 72 },
    ],
};

const MALE_BOTTOMS: Record<string, SizeRow[]> = {
    jeans: [
        { size: "S", waist: 74, hip: 94, thigh: 56, inseam: 74 },
        { size: "M", waist: 78, hip: 98, thigh: 58, inseam: 76 },
        { size: "L", waist: 82, hip: 102, thigh: 60, inseam: 78 },
        { size: "XL", waist: 88, hip: 108, thigh: 62, inseam: 80 },
        { size: "XXL", waist: 94, hip: 114, thigh: 64, inseam: 82 },
    ],
    khakis: [
        { size: "S", waist: 76, hip: 96, thigh: 56, inseam: 74 },
        { size: "M", waist: 80, hip: 100, thigh: 58, inseam: 76 },
        { size: "L", waist: 84, hip: 104, thigh: 60, inseam: 78 },
        { size: "XL", waist: 90, hip: 110, thigh: 62, inseam: 80 },
        { size: "XXL", waist: 96, hip: 116, thigh: 64, inseam: 82 },
    ],
    shorts: [
        { size: "S", waist: 74, hip: 96, thigh: 58, inseam: 20 },
        { size: "M", waist: 78, hip: 100, thigh: 60, inseam: 21 },
        { size: "L", waist: 82, hip: 104, thigh: 62, inseam: 22 },
        { size: "XL", waist: 88, hip: 110, thigh: 64, inseam: 23 },
        { size: "XXL", waist: 94, hip: 116, thigh: 66, inseam: 24 },
    ],
    joggers: [
        { size: "S", waist: 72, hip: 96, thigh: 58, inseam: 72 },
        { size: "M", waist: 76, hip: 100, thigh: 60, inseam: 74 },
        { size: "L", waist: 80, hip: 104, thigh: 62, inseam: 76 },
        { size: "XL", waist: 86, hip: 110, thigh: 64, inseam: 78 },
        { size: "XXL", waist: 92, hip: 116, thigh: 66, inseam: 80 },
    ],
    "formal-pants": [
        { size: "S", waist: 76, hip: 96, thigh: 56, inseam: 76 },
        { size: "M", waist: 80, hip: 100, thigh: 58, inseam: 78 },
        { size: "L", waist: 84, hip: 104, thigh: 60, inseam: 80 },
        { size: "XL", waist: 90, hip: 110, thigh: 62, inseam: 82 },
        { size: "XXL", waist: 96, hip: 116, thigh: 64, inseam: 84 },
    ],
};

// Nữ: tỷ lệ nhỏ hơn một chút (demo). Bạn có thể thay bằng bảng chính thức.
const FEMALE_TOPS: Record<string, SizeRow[]> = {
    tee: MALE_TOPS.tee.map((r) => ({ ...r, chest: (r.chest ?? 0) - 4, shoulder: (r.shoulder ?? 0) - 2, length: (r.length ?? 0) - 2 })),
    polo: MALE_TOPS.polo.map((r) => ({ ...r, chest: (r.chest ?? 0) - 4, shoulder: (r.shoulder ?? 0) - 2, length: (r.length ?? 0) - 2 })),
    shirt: MALE_TOPS.shirt.map((r) => ({ ...r, chest: (r.chest ?? 0) - 4, shoulder: (r.shoulder ?? 0) - 2, length: (r.length ?? 0) - 2 })),
    jacket: MALE_TOPS.jacket.map((r) => ({ ...r, chest: (r.chest ?? 0) - 4, shoulder: (r.shoulder ?? 0) - 2, length: (r.length ?? 0) - 2 })),
    hoodie: MALE_TOPS.hoodie.map((r) => ({ ...r, chest: (r.chest ?? 0) - 4, shoulder: (r.shoulder ?? 0) - 2, length: (r.length ?? 0) - 2 })),
    sweater: MALE_TOPS.sweater.map((r) => ({ ...r, chest: (r.chest ?? 0) - 4, shoulder: (r.shoulder ?? 0) - 2, length: (r.length ?? 0) - 2 })),
};

const FEMALE_BOTTOMS: Record<string, SizeRow[]> = {
    jeans: MALE_BOTTOMS.jeans.map((r) => ({ ...r, waist: (r.waist ?? 0) - 4, hip: (r.hip ?? 0) - 4, inseam: (r.inseam ?? 0) - 2 })),
    khakis: MALE_BOTTOMS.khakis.map((r) => ({ ...r, waist: (r.waist ?? 0) - 4, hip: (r.hip ?? 0) - 4, inseam: (r.inseam ?? 0) - 2 })),
    shorts: MALE_BOTTOMS.shorts.map((r) => ({ ...r, waist: (r.waist ?? 0) - 4, hip: (r.hip ?? 0) - 4 })),
    joggers: MALE_BOTTOMS.joggers.map((r) => ({ ...r, waist: (r.waist ?? 0) - 4, hip: (r.hip ?? 0) - 4, inseam: (r.inseam ?? 0) - 2 })),
    "formal-pants": MALE_BOTTOMS["formal-pants"].map((r) => ({
        ...r,
        waist: (r.waist ?? 0) - 4,
        hip: (r.hip ?? 0) - 4,
        inseam: (r.inseam ?? 0) - 2,
    })),
};

const TOP_OPTIONS = [
    { key: "tee", label: "Áo Thun" },
    { key: "polo", label: "Áo Polo" },
    { key: "shirt", label: "Áo Sơ Mi" },
    { key: "jacket", label: "Áo Khoác" },
    { key: "hoodie", label: "Áo Hoodie" },
    { key: "sweater", label: "Áo Len / Sweater" },
];

const BOTTOM_OPTIONS = [
    { key: "jeans", label: "Quần Jeans" },
    { key: "khakis", label: "Quần Kaki" },
    { key: "shorts", label: "Quần Short" },
    { key: "joggers", label: "Quần Joggers" },
    { key: "formal-pants", label: "Quần Tây" },
];

// ====== COMPONENT CHÍNH ======
export default function ClothSize() {
    const [gender, setGender] = useState<"male" | "female">("male");
    const [kind, setKind] = useState<"tops" | "bottoms">("tops");
    const [productKey, setProductKey] = useState<string>(TOP_OPTIONS[0].key);
    const [unit, setUnit] = useState<"cm" | "in">("cm");

    const data: SizeRow[] = useMemo(() => {
        const source = gender === "male" ? (kind === "tops" ? MALE_TOPS : MALE_BOTTOMS) : kind === "tops" ? FEMALE_TOPS : FEMALE_BOTTOMS;
        return source[productKey] ?? [];
    }, [gender, kind, productKey]);

    const headers = kind === "tops" ? ["Size", "Ngực", "Vai", "Dài áo"] : ["Size", "Eo", "Mông", "Đùi", "Dài trong"];

    const convert = (n?: number) => {
        if (typeof n !== "number") return "-";
        return unit === "cm" ? n : +(n / 2.54).toFixed(1);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto mt-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl">Bảng Size Quần Áo</CardTitle>
                        <CardDescription>Chọn giới tính, loại sản phẩm và đơn vị đo. Số liệu là tham khảo tiêu chuẩn (fit regular).</CardDescription>
                    </div>
                    <a href="https://160store.com/blogs/huong-dan-chon-size/size-quan-ao-nam-nu" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        Tham khảo thêm <ExternalLink size={16} />
                    </a>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Bộ điều khiển */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <Label className="mb-2 inline-block">Giới tính</Label>
                        <Tabs value={gender} onValueChange={(v) => setGender(v as any)}>
                            <TabsList className="w-full">
                                <TabsTrigger value="male" className="flex-1">
                                    Nam
                                </TabsTrigger>
                                <TabsTrigger value="female" className="flex-1">
                                    Nữ
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div>
                        <Label className="mb-2 inline-block">Loại</Label>
                        <Tabs
                            value={kind}
                            onValueChange={(v) => {
                                setKind(v as any);
                                setProductKey(v === "tops" ? TOP_OPTIONS[0].key : BOTTOM_OPTIONS[0].key);
                            }}
                        >
                            <TabsList className="w-full">
                                <TabsTrigger value="tops" className="flex-1">
                                    Áo
                                </TabsTrigger>
                                <TabsTrigger value="bottoms" className="flex-1">
                                    Quần
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div>
                        <Label className="mb-2 inline-block">Sản phẩm</Label>
                        <Select value={productKey} onValueChange={setProductKey}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn sản phẩm" />
                            </SelectTrigger>
                            <SelectContent>
                                {(kind === "tops" ? TOP_OPTIONS : BOTTOM_OPTIONS).map((o) => (
                                    <SelectItem key={o.key} value={o.key}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="mb-2 inline-block">Đơn vị</Label>
                        <ToggleGroup type="single" value={unit} onValueChange={(v) => v && setUnit(v as any)} className="w-full justify-between">
                            <ToggleGroupItem value="cm" className="flex-1">
                                cm
                            </ToggleGroupItem>
                            <ToggleGroupItem value="in" className="flex-1">
                                inch
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

                {/* Bảng size */}
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {headers.map((h) => (
                                    <TableHead key={h} className={cn?.("whitespace-nowrap", "px-4") || "px-4 whitespace-nowrap"}>
                                        {h}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((r) => (
                                <TableRow key={r.size}>
                                    <TableCell className="font-medium px-4">{r.size}</TableCell>
                                    {kind === "tops" ? (
                                        <>
                                            <TableCell className="px-4">{convert(r.chest)}</TableCell>
                                            <TableCell className="px-4">{convert(r.shoulder)}</TableCell>
                                            <TableCell className="px-4">{convert(r.length)}</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="px-4">{convert(r.waist)}</TableCell>
                                            <TableCell className="px-4">{convert(r.hip)}</TableCell>
                                            <TableCell className="px-4">{convert(r.thigh)}</TableCell>
                                            <TableCell className="px-4">{convert(r.inseam)}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Gợi ý chọn size nhanh từ số đo */}
                <QuickSuggest unit={unit} kind={kind} />

                {/* Hướng dẫn đo và lưu ý */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="measure">
                        <AccordionTrigger className="text-base">Cách đo để chọn size</AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc pl-6 space-y-1 text-sm">
                                <li>
                                    <b>Ngực</b>: đo vòng quanh phần đầy nhất của ngực, thả lỏng tay.
                                </li>
                                <li>
                                    <b>Vai</b>: đo thẳng từ đầu vai trái sang đầu vai phải.
                                </li>
                                <li>
                                    <b>Dài áo</b>: đo từ điểm cao nhất của vai xuống gấu áo.
                                </li>
                                <li>
                                    <b>Eo</b>: đo vòng eo chỗ nhỏ nhất (thở bình thường).
                                </li>
                                <li>
                                    <b>Mông</b>: đo vòng to nhất của hông/mông.
                                </li>
                                <li>
                                    <b>Đùi</b>: đo vòng đùi ở điểm to nhất.
                                </li>
                                <li>
                                    <b>Dài ống trong</b>: đo từ đáy quần đến mắt cá chân.
                                </li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="notes">
                        <AccordionTrigger className="text-base">Lưu ý fitting</AccordionTrigger>
                        <AccordionContent className="text-sm space-y-2">
                            <p>
                                Form bảng là <b>regular</b>. Thích <i>oversize</i> có thể lên 1 size, thích ôm giảm 1 size nếu số đo cho phép. Chất liệu co giãn (thun, jogger) có biên độ dao động 1–2cm.
                            </p>
                            <p className="flex items-center gap-2 text-muted-foreground">
                                <Info size={16} /> Số liệu chỉ mang tính tham khảo, có thể khác ±1–2cm do phương pháp đo.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}

// ====== TIỆN ÍCH: GỢI Ý NHANH THEO SỐ ĐO ======
function QuickSuggest({ unit, kind }: { unit: "cm" | "in"; kind: "tops" | "bottoms" }) {
    const [chest, setChest] = useState<string>("");
    const [waist, setWaist] = useState<string>("");

    const toCm = (v: number) => (unit === "cm" ? v : v * 2.54);

    const suggestion = useMemo(() => {
        if (kind === "tops" && chest) {
            const c = toCm(parseFloat(chest));
            if (Number.isFinite(c)) return pickSizeByRange(c, [94, 98, 102, 108, 114], ["S", "M", "L", "XL", "XXL"]);
        }
        if (kind === "bottoms" && waist) {
            const w = toCm(parseFloat(waist));
            if (Number.isFinite(w)) return pickSizeByRange(w, [74, 78, 82, 88, 94], ["S", "M", "L", "XL", "XXL"]);
        }
        return "";
    }, [chest, waist, unit, kind]);

    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
                <Ruler size={18} />
                <p className="font-medium">Gợi ý size nhanh</p>
                <Badge variant="secondary" className="ml-auto">
                    Beta
                </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={cn?.("space-y-2", kind !== "tops" && "opacity-60") || `space-y-2 ${kind !== "tops" ? "opacity-60" : ""}`}>
                    <Label>Vòng ngực ({unit})</Label>
                    <Input inputMode="decimal" placeholder={unit === "cm" ? "ví dụ 100" : "ví dụ 39.5"} value={chest} onChange={(e) => setChest(e.target.value)} disabled={kind !== "tops"} />
                </div>
                <div className={cn?.("space-y-2", kind !== "bottoms" && "opacity-60") || `space-y-2 ${kind !== "bottoms" ? "opacity-60" : ""}`}>
                    <Label>Vòng eo ({unit})</Label>
                    <Input inputMode="decimal" placeholder={unit === "cm" ? "ví dụ 82" : "ví dụ 32.3"} value={waist} onChange={(e) => setWaist(e.target.value)} disabled={kind !== "bottoms"} />
                </div>
                <div className="flex items-end">
                    <div className="text-sm text-muted-foreground">
                        {suggestion ? (
                            <>
                                Gợi ý: <span className="font-semibold text-foreground">{suggestion}</span>
                            </>
                        ) : (
                            <>Nhập số đo để gợi ý size (ước lượng).</>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function pickSizeByRange(value: number, thresholds: number[], labels: string[]) {
    for (let i = 0; i < thresholds.length; i++) {
        if (value <= thresholds[i]) return labels[i];
    }
    return labels[labels.length - 1];
}
