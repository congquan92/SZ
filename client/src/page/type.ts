export interface Category {
    id: number;
    name: string;
    status: string;
    createAt: string;
    updatedAt: string;
    childCategory: Category[];
}

export interface CartProduct {
    id: number;
    productBaseResponse: {
        id: number;
        name: string;
        description: string;
        listPrice: number;
        salePrice: number;
        status: string;
        urlCoverImage: string;
        urlvideo: string | null;
        avgRating: number;
        soldQuantity: number;
        createdAt: string;
        updateAt: string;
    };

    productVariantResponse: {
        id: number;
        sku: string;
        price: number;
        quantity: number; // Số lượng tồn kho của biến thể này
        variantAttributes: [{ attribute: string; id: number; value: string }];
        height: number | null;
        length: number | null;
        width: number | null;
        weight: number | null;
    };
    quantity: number;
}
export interface Address {
    id: number;
    province: string;
    district: string;
    ward: string;
    provinceId: number;
    districtId: number;
    wardId: string;
    streetAddress: string;
    addressType: "HOME" | "WORK";
    status: string;
    defaultAddress: boolean;
}
