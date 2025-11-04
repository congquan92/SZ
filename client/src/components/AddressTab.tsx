import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GHNAPI, type GHNProvince, type GHNDistrict, type GHNWard } from "@/api/ghn.api";
import { AddressAPI } from "@/api/address.api";
import { useAuthStore } from "@/stores/useAuthStores";

interface Address {
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

export default function AddressTabGHN() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    // GHN Data
    const [provinces, setProvinces] = useState<GHNProvince[]>([]);
    const [districts, setDistricts] = useState<GHNDistrict[]>([]);
    const [wards, setWards] = useState<GHNWard[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        id: 0,
        province: "",
        district: "",
        ward: "",
        provinceId: 0,
        districtId: 0,
        wardId: "",
        streetAddress: "",
        addressType: "HOME",
        status: "",
        defaultAddress: false,
    });

    const loadProvinces = async () => {
        try {
            setLoadingProvinces(true);
            const data = await GHNAPI.getProvinces();
            setProvinces(data);
        } catch (error) {
            toast.error("Không thể tải danh sách tỉnh/thành");
            console.error(error);
        } finally {
            setLoadingProvinces(false);
        }
    };

    // Load addresses from API
    const loadAddresses = async () => {
        try {
            const response = await AddressAPI.getAddress();
            setAddresses(response.data.data);
            console.log("Addresses loaded:", response.data.data);
        } catch (error) {
            console.error("Load addresses failed", error);
            toast.error("Không thể tải danh sách địa chỉ");
        }
    };
    // Load provinces on mount
    useEffect(() => {
        loadProvinces();
        loadAddresses();
    }, []);

    const loadDistricts = async (provinceId: number, skipReset = false) => {
        try {
            setLoadingDistricts(true);
            const data = await GHNAPI.getDistricts(provinceId);
            setDistricts(data);
            // Reset district and ward when province changes (skip when editing)
            if (!skipReset) {
                setFormData((prev) => ({
                    ...prev,
                    district: "",
                    ward: "",
                    districtId: 0,
                    wardId: "",
                }));
                setWards([]);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách quận/huyện");
            console.error(error);
        } finally {
            setLoadingDistricts(false);
        }
    };
    // Load districts when province changes
    useEffect(() => {
        if (formData.provinceId && !editingAddress) {
            loadDistricts(formData.provinceId);
        } else if (!formData.provinceId) {
            setDistricts([]);
            setWards([]);
        }
    }, [formData.provinceId, editingAddress]);

    const loadWards = async (districtId: number, skipReset = false) => {
        try {
            setLoadingWards(true);
            const data = await GHNAPI.getWards(districtId);
            setWards(data);
            // Reset ward when district changes (skip when editing)
            if (!skipReset) {
                setFormData((prev) => ({
                    ...prev,
                    ward: "",
                    wardId: "",
                }));
            }
        } catch (error) {
            toast.error("Không thể tải danh sách phường/xã");
            console.error(error);
        } finally {
            setLoadingWards(false);
        }
    };
    // Load wards when district changes
    useEffect(() => {
        if (formData.districtId && !editingAddress) {
            loadWards(formData.districtId);
        } else if (!formData.districtId) {
            setWards([]);
        }
    }, [formData.districtId, editingAddress]);

    // Open dialog for adding new address
    const handleAddNew = () => {
        setEditingAddress(null);
        setFormData({
            id: 0,
            province: "",
            district: "",
            ward: "",
            provinceId: 0,
            districtId: 0,
            wardId: "",
            streetAddress: "",
            addressType: "HOME",
            status: "",
            defaultAddress: false,
        });
        setDistricts([]);
        setWards([]);
        setIsDialogOpen(true);
    };

    // Open dialog for editing
    const handleEdit = async (address: Address) => {
        try {
            setEditingAddress(address);

            console.log("Editing address:", address);

            // Load districts and wards FIRST before setting form data
            if (address.provinceId) {
                await loadDistricts(address.provinceId, true); // skipReset = true

                if (address.districtId) {
                    await loadWards(address.districtId, true); // skipReset = true
                }
            }

            // Set form data AFTER loading districts and wards
            setFormData({
                id: address.id,
                province: address.province,
                district: address.district,
                ward: address.ward,
                provinceId: address.provinceId,
                districtId: address.districtId,
                wardId: address.wardId,
                streetAddress: address.streetAddress,
                addressType: address.addressType,
                status: address.status,
                defaultAddress: address.defaultAddress,
            });

            setIsDialogOpen(true);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin địa chỉ");
        }
    };

    // Validate form
    const validateForm = () => {
        if (!formData.provinceId) {
            toast.error("Vui lòng chọn tỉnh/thành phố");
            return false;
        }
        if (!formData.districtId) {
            toast.error("Vui lòng chọn quận/huyện");
            return false;
        }
        if (!formData.wardId) {
            toast.error("Vui lòng chọn phường/xã");
            return false;
        }
        if (!formData.streetAddress.trim()) {
            toast.error("Vui lòng nhập địa chỉ cụ thể");
            return false;
        }

        return true;
    };

    // Save address
    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            if (editingAddress) {
                // Update existing address
                await AddressAPI.updateAddress(editingAddress.id, formData.province, formData.district, formData.ward, formData.provinceId, formData.districtId, formData.wardId, formData.streetAddress, formData.addressType);

                // If set as default, call default API
                if (formData.defaultAddress && !editingAddress.defaultAddress) {
                    await AddressAPI.defaultAddress(editingAddress.id);
                }

                toast.success("Cập nhật địa chỉ thành công");
            } else {
                // Add new address
                const response = await AddressAPI.addAddress(formData.province, formData.district, formData.ward, formData.provinceId, formData.districtId, formData.wardId, formData.streetAddress, formData.addressType);
                console.log("Add address response:", response);
                // If set as default, call default API with new address id
                // if (formData.defaultAddress) {
                //     await AddressAPI.defaultAddress(response.id);
                // }

                toast.success("Thêm địa chỉ thành công");
            }

            // Reload addresses from server
            await loadAddresses();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Set as default
    const handleSetDefault = async (id: number) => {
        try {
            await AddressAPI.defaultAddress(id);

            // Update local state
            setAddresses((prev) => prev.map((addr) => ({ ...addr, defaultAddress: addr.id === id })));
            toast.success("Đã đặt làm địa chỉ mặc định");
        } catch (error) {
            console.error("Set default address failed", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại");
        }
    };

    // Delete address
    const handleDelete = async (id: number) => {
        try {
            const address = addresses.find((a) => a.id === id);
            if (address?.defaultAddress) {
                toast.error("Không thể xóa địa chỉ mặc định");
                return;
            }

            await AddressAPI.deleteAddress(id);

            // Update local state
            setAddresses((prev) => prev.filter((addr) => addr.id !== id));
            toast.success("Đã xóa địa chỉ");
        } catch (error) {
            console.error("Delete address failed", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại");
        }
    };

    // GHN
    const handleProvinceChange = (value: string) => {
        const provinceId = Number(value);
        const province = provinces.find((p) => p.ProvinceID === provinceId);
        if (province) {
            setFormData({
                ...formData,
                provinceId: province.ProvinceID,
                province: province.ProvinceName,
            });
        }
    };

    const handleDistrictChange = (value: string) => {
        const districtId = Number(value);
        const district = districts.find((d) => d.DistrictID === districtId);
        if (district) {
            setFormData({
                ...formData,
                districtId: district.DistrictID,
                district: district.DistrictName,
            });
        }
    };

    const handleWardChange = (value: string) => {
        const ward = wards.find((w) => w.WardCode === value);
        if (ward) {
            setFormData({
                ...formData,
                wardId: ward.WardCode,
                ward: ward.WardName,
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Sổ địa chỉ</h3>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm địa chỉ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
                            <DialogDescription>Điền đầy đủ thông tin địa chỉ giao hàng</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="fullName" value={user?.fullName} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="phone" value={user?.phone} disabled className="bg-muted" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="province">
                                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.provinceId ? formData.provinceId.toString() : ""} onValueChange={handleProvinceChange} disabled={loadingProvinces}>
                                        <SelectTrigger id="province">
                                            <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map((province) => (
                                                <SelectItem key={province.ProvinceID} value={province.ProvinceID.toString()}>
                                                    {province.ProvinceName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="district">
                                        Quận/Huyện <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.districtId ? formData.districtId.toString() : ""} onValueChange={handleDistrictChange} disabled={!formData.provinceId || loadingDistricts}>
                                        <SelectTrigger id="district">
                                            <SelectValue placeholder={loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map((district) => (
                                                <SelectItem key={district.DistrictID} value={district.DistrictID.toString()}>
                                                    {district.DistrictName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ward">
                                        Phường/Xã <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.wardId} onValueChange={handleWardChange} disabled={!formData.districtId || loadingWards}>
                                        <SelectTrigger id="ward">
                                            <SelectValue placeholder={loadingWards ? "Đang tải..." : "Chọn phường/xã"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards.map((ward) => (
                                                <SelectItem key={ward.WardCode} value={ward.WardCode}>
                                                    {ward.WardName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">
                                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                                </Label>
                                <Input id="address" value={formData.streetAddress} onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })} placeholder="Số nhà, tên đường..." />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="isDefault" checked={formData.defaultAddress} onChange={(e) => setFormData({ ...formData, defaultAddress: e.target.checked })} className="h-4 w-4" />
                                <Label htmlFor="isDefault" className="cursor-pointer">
                                    Đặt làm địa chỉ mặc định
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>
                                Hủy
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? "Đang lưu..." : "Lưu địa chỉ"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {addresses.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Chưa có địa chỉ nào</p>
                        <Button onClick={handleAddNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm địa chỉ đầu tiên
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {addresses.map((address) => (
                        <Card key={address.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle className="text-base">{user?.fullName}</CardTitle>
                                            {address.defaultAddress && (
                                                <Badge variant="default" className="text-xs">
                                                    Mặc định
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{user?.phone}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(address)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)} disabled={address.defaultAddress}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <p className="text-sm">{address.streetAddress}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {address.ward}, {address.district}, {address.province}
                                    </p>
                                </div>
                                {!address.defaultAddress && (
                                    <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSetDefault(address.id)}>
                                        Đặt làm mặc định
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
