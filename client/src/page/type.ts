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
        height: number;
        length: number;
        width: number;
        weight: number;
    };
    quantity: number;
}
export interface Address {
    id: number;
    customerName: string;
    phoneNumber: string;
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

export interface VoucherIF {
    id: number;
    discription: string;
    type: string;
    discountValue: number;
    maxDiscountValue: number;
    minDiscountValue: number;
    totalQuantity: number;
    status: string;
    startDate: string;
    endDate: string;
    applicableProductsId: number | null;
    usageLimitPerUser: number;
    userRankResponse: {
        id: number;
        name: string;
        minSpent: number;
        status: string;
    };
    shipping: boolean;
}

export interface ShippingData {
    serviceTypeId: number;
    weightTotal: number;
    lengthTotal: number;
    widthTotal: number;
    heightTotal: number;
    itemResponses: Array<{
        name: string;
        length: number;
        width: number;
        height: number;
        weight: number;
        quantity: number;
    }>;
}

// ---------------------------Order -----------------------
interface OrderItemResponse {
    orderItemId: number;
    finalPrice: number;
    listPriceSnapShot: number;
    nameProductSnapShot: string;
    quantity: number;
    returnQuantity: number;
    urlImageSnapShot: string;
    variantSnapShot: string;
    productVariantResponse: {
        id: number;
        weight: number;
        length: number;
        width: number;
        height: number;
        price: number;
        quantity: number;
        sku: string;
        variantAttributes: Array<{
            id: number;
            attribute: string;
            value: string;
        }>;
    };
}

export type DeliveryStatus = "CANCELLED" | "COMPLETED" | "CONFIRMED" | "DELIVERED" | "PACKED" | "PENDING" | "REFUNDED" | "SHIPPED";
export interface OrderItem {
    id: number;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryDistrictId: number;
    deliveryDistrictName: string;
    deliveryProvinceId: number;
    deliveryProvinceName: string;
    deliveryStatus: DeliveryStatus;
    deliveryWardCode: string;
    deliveryWardName: string;
    note: string;
    orderItemResponses: OrderItemResponse[];
    orderTrackingCode: string | null;
    originalOrderAmount: number;
    paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
    paymentType: "BANK_TRANSFER" | "CASH" | "QR_CODE";
    totalAmount: number;
}
