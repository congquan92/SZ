import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SlashIcon } from "lucide-react";

export default function BreadcrumbCustom({ title, link_title, subtitle }: { title: string; link_title: string; subtitle: string }) {
    return (
        <>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={link_title}>{title}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <SlashIcon />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <span className="text-gray-600 cursor-default">{subtitle}</span>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </>
    );
}
