export interface Product {
    id: number;
    name: string;
    listPrice: number;
    salePrice: number;
    description: string;
    urlvideo: string;
    urlCoverImage: string;
    soldQuantity: number;
    avgRating: number;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updateAt: string;
}

interface ProductAttribute {
    id: number;
    name: string;
    attributeValue: { id: number; image: string | null; value: string }[];
}
export interface ProductVariant {
    id: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    price: number;
    quantity: number;
    sku: string;
    variantAttributes: { id: number; attribute: string; value: string }[];
}

export interface ProductDetail {
    id: number;
    name: string;
    description: string;
    listPrice: number;
    salePrice: number;
    productStatus: "ACTIVE" | "INACTIVE";
    categoryId: number;
    video: string;
    coverImage: string;
    imageProduct: string[];
    soldQuantity: number;
    avgRating: number | null;
    attributes: ProductAttribute[];
    productVariant: ProductVariant[];
    createAt: string;
    updateAt: string;
}

// review type
export interface Review {
    id: number | string;
    productId: number | null;
    userId: number;
    avatarUser: string | null;
    fullName: string;
    rating: number;
    comment: string;
    status: string | null;
    images: { id: number; url: string }[];
    createdDate: string; // API returns createdDate
    updatedAt?: string;
}
