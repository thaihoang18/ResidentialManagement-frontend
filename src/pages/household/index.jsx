import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function Household() {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [editOpen, setEditOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState(null);
    const [editForm, setEditForm] = useState({
        id: null,
        household_code: "",
        head_id: "",
        house_number: "",
        street: "",
        head_name: "",
    });

    const loadHouseholds = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/households");
            if (!res.ok) throw new Error("Lỗi tải danh sách hộ gia đình");
            const json = await res.json();
            const rows = Array.isArray(json?.data) ? json.data : [];
            setHouseholds(rows);
        } catch (e) {
            setError(e?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    }, []);

    const openEdit = useCallback((row) => {
        setEditError(null);
        setEditForm({
            id: row?.id ?? null,
            household_code: row?.household_code ?? "",
            head_id: row?.head_id ?? "",
            house_number: row?.house_number ?? "",
            street: row?.street ?? "",
            head_name: row?.head_name ?? "",
        });
        setEditOpen(true);
    }, []);

    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "STT",
                cell: ({ row }) => row.original.id,
            },
            {
                accessorKey: "household_code",
                header: "Mã hộ",
            },
            {
                accessorKey: "house_number",
                header: "Số nhà",
                cell: ({ row }) => row.original.house_number || "-",
            },
            {
                accessorKey: "street",
                header: "Tên đường",
                cell: ({ row }) => row.original.street || "-",
            },
            {
                accessorKey: "head_name",
                header: "Tên chủ hộ",
                cell: ({ row }) => row.original.head_name || "-",
            },
            {
                id: "actions",
                header: "Chỉnh sửa",
                cell: ({ row }) => (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(row.original)}>
                        Sửa
                    </Button>
                ),
            },
        ],
        [openEdit]
    );

    useEffect(() => {
        loadHouseholds();
    }, [loadHouseholds]);

    async function submitEdit(e) {
        e.preventDefault();
        if (!editForm.id) return;

        setEditSaving(true);
        setEditError(null);
        try {
            const headIdValue =
                editForm.head_id === "" || editForm.head_id === null
                    ? null
                    : Number(editForm.head_id);
            if (headIdValue !== null && Number.isNaN(headIdValue)) {
                throw new Error("Head ID phải là số");
            }

            const payload = {
                household_code: editForm.household_code,
                head_id: headIdValue,
                house_number: editForm.house_number,
                street: editForm.street,
            };

            const res = await fetch(`/api/households/${editForm.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(json?.error || "Cập nhật thất bại");
            }

            setEditOpen(false);
            await loadHouseholds();
        } catch (err) {
            setEditError(err?.message || "Có lỗi xảy ra");
        } finally {
            setEditSaving(false);
        }
    }

    return (
        <div className="p-6 space-y-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Hộ gia đình</h1>
                <p className="text-sm text-muted-foreground">
                    Danh sách hộ gia đình trong khu dân cư.
                </p>
            </div>

            {error ? (
                <div className="text-sm text-destructive">{error}</div>
            ) : null}

            {loading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
            ) : (
                <DataTable columns={columns} data={households} />
            )}

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa hộ gia đình</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin hộ gia đình và bấm Lưu.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-3" onSubmit={submitEdit}>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Mã hộ</label>
                            <Input
                                value={editForm.household_code}
                                onChange={(e) =>
                                    setEditForm((p) => ({
                                        ...p,
                                        household_code: e.target.value,
                                    }))
                                }
                                placeholder="HK001"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Head ID</label>
                            <Input
                                type="number"
                                value={editForm.head_id}
                                onChange={(e) =>
                                    setEditForm((p) => ({
                                        ...p,
                                        head_id: e.target.value,
                                    }))
                                }
                                placeholder="1"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Số nhà</label>
                            <Input
                                value={editForm.house_number}
                                onChange={(e) =>
                                    setEditForm((p) => ({
                                        ...p,
                                        house_number: e.target.value,
                                    }))
                                }
                                placeholder="12A"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Tên đường</label>
                            <Input
                                value={editForm.street}
                                onChange={(e) =>
                                    setEditForm((p) => ({
                                        ...p,
                                        street: e.target.value,
                                    }))
                                }
                                placeholder="Nguyễn Trãi"
                            />
                        </div>

                        {editError ? (
                            <div className="text-sm text-destructive">{editError}</div>
                        ) : null}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={editSaving}>
                                {editSaving ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Household;