import React, { useCallback, useEffect, useState } from "react";
import HouseholdHeader from "./components/HouseholdHeader";
import HouseholdTable from "./components/HouseholdTable";
import HouseholdFormDialog from "./components/HouseholdFormDialog";
import HouseholdDeleteDialog from "./components/HouseholdDeleteDialog";
import HouseholdSplitDialog from "./components/HouseholdSplitDialog";

const EMPTY_FORM = {
    id: null,
    household_code: "",
    head_id: "",
    house_number: "",
    street: "",
};

function Household() {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [createSaving, setCreateSaving] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createForm, setCreateForm] = useState(EMPTY_FORM);

    const [editOpen, setEditOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteSaving, setDeleteSaving] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [residents, setResidents] = useState([]);
    const [residentsLoading, setResidentsLoading] = useState(false);
    const [residentsError, setResidentsError] = useState(null);

    const [editMembers, setEditMembers] = useState([]);
    const [editMembersLoading, setEditMembersLoading] = useState(false);
    const [editMembersError, setEditMembersError] = useState(null);

    const [splitOpen, setSplitOpen] = useState(false);
    const [splitSaving, setSplitSaving] = useState(false);
    const [splitError, setSplitError] = useState(null);
    const [splitTarget, setSplitTarget] = useState(null);
    const [splitResidents, setSplitResidents] = useState([]);
    const [splitResidentsLoading, setSplitResidentsLoading] = useState(false);
    const [splitResidentsError, setSplitResidentsError] = useState(null);
    const [splitSelectedIds, setSplitSelectedIds] = useState([]);
    const [splitForm, setSplitForm] = useState({
        new_household_code: "",
        house_number: "",
        street: "",
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

    const loadResidents = useCallback(async () => {
        setResidentsLoading(true);
        setResidentsError(null);
        try {
            const res = await fetch("/api/residents");
            if (!res.ok) throw new Error("Lỗi tải danh sách nhân khẩu");
            const json = await res.json();
            const rows = Array.isArray(json?.data) ? json.data : [];
            setResidents(rows);
        } catch (e) {
            setResidentsError(e?.message || "Có lỗi xảy ra");
        } finally {
            setResidentsLoading(false);
        }
    }, []);

    const openCreate = useCallback(() => {
        setCreateError(null);
        setCreateForm(EMPTY_FORM);
        setCreateOpen(true);
        // load residents for head search (only when adding)
        if (!residentsLoading && residents.length === 0 && !residentsError) {
            loadResidents();
        }
    }, [loadResidents, residents.length, residentsError, residentsLoading]);

    const openEdit = useCallback((row) => {
        setEditError(null);
        setEditForm({
            id: row?.id ?? null,
            household_code: row?.household_code ?? "",
            head_id: row?.head_id ?? "",
            house_number: row?.house_number ?? "",
            street: row?.street ?? "",
        });
        setEditOpen(true);

        setEditMembers([]);
        setEditMembersError(null);
        if (row?.household_code) {
            (async () => {
                setEditMembersLoading(true);
                try {
                    const res = await fetch(`/api/households/${row.household_code}/residents`);
                    const json = await res.json().catch(() => null);
                    if (!res.ok) throw new Error(json?.error || "Lỗi tải danh sách nhân khẩu của hộ");
                    const rows = Array.isArray(json?.data) ? json.data : [];
                    setEditMembers(rows);
                } catch (e) {
                    setEditMembersError(e?.message || "Có lỗi xảy ra");
                    setEditMembers([]);
                } finally {
                    setEditMembersLoading(false);
                }
            })();
        }

        // load residents for head search (when editing)
        if (!residentsLoading && residents.length === 0 && !residentsError) {
            loadResidents();
        }
    }, [loadResidents, residents.length, residentsError, residentsLoading]);

    const updateMemberRelation = useCallback(async (member, nextRelationRaw) => {
        if (!member?.id) throw new Error("Thiếu ID nhân khẩu");

        const payload = {
            household_id: member.household_id,
            full_name: member.full_name,
            date_of_birth: member.date_of_birth,
            place_of_birth: member.place_of_birth,
            native_place: member.native_place,
            ethnicity: member.ethnicity,
            occupation: member.occupation,
            id_number: member.id_number,
            id_issue_date: member.id_issue_date,
            id_issue_place: member.id_issue_place,
            registration_date: member.registration_date,
            relation_to_head: nextRelationRaw ? nextRelationRaw : null,
            gender: member.gender,
            status: member.status,
        };

        const res = await fetch(`/api/residents/${member.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Cập nhật quan hệ thất bại");

        setEditMembers((prev) =>
            Array.isArray(prev)
                ? prev.map((m) => (Number(m?.id) === Number(member.id) ? { ...m, relation_to_head: payload.relation_to_head } : m))
                : prev
        );
    }, []);

    const openDelete = useCallback((row) => {
        setDeleteError(null);
        setDeleteTarget(row);
        setDeleteOpen(true);
    }, []);

    const openSplit = useCallback(async (row) => {
        setSplitError(null);
        setSplitResidentsError(null);
        setSplitTarget(row);
        setSplitSelectedIds([]);
        setSplitForm({
            new_household_code: "",
            house_number: row?.house_number ?? "",
            street: row?.street ?? "",
        });
        setSplitOpen(true);

        if (!row?.household_code) return;
        setSplitResidentsLoading(true);
        try {
            const res = await fetch(`/api/households/${row.household_code}/residents`);
            if (!res.ok) throw new Error("Lỗi tải danh sách nhân khẩu của hộ");
            const json = await res.json();
            const rows = Array.isArray(json?.data) ? json.data : [];
            setSplitResidents(rows);
        } catch (e) {
            setSplitResidentsError(e?.message || "Có lỗi xảy ra");
            setSplitResidents([]);
        } finally {
            setSplitResidentsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHouseholds();
    }, [loadHouseholds]);

    function normalizeHeadId(head_id) {
        if (head_id === "" || head_id === null || head_id === undefined) return null;
        const n = Number(head_id);
        if (Number.isNaN(n)) throw new Error("Head ID phải là số");
        return n;
    }

    async function submitCreate(e) {
        e.preventDefault();
        setCreateSaving(true);
        setCreateError(null);
        try {
            const payload = {
                household_code: createForm.household_code,
                head_id: normalizeHeadId(createForm.head_id),
                house_number: createForm.house_number,
                street: createForm.street,
            };

            const res = await fetch("/api/households", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => null);
            if (!res.ok) throw new Error(json?.error || "Thêm hộ gia đình thất bại");

            setCreateOpen(false);
            await loadHouseholds();
        } catch (err) {
            setCreateError(err?.message || "Có lỗi xảy ra");
        } finally {
            setCreateSaving(false);
        }
    }

    async function submitEdit(e) {
        e.preventDefault();
        if (!editForm.id) return;

        setEditSaving(true);
        setEditError(null);
        try {
            const payload = {
                household_code: editForm.household_code,
                head_id: normalizeHeadId(editForm.head_id),
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

    async function confirmDelete() {
        if (!deleteTarget?.id) return;
        setDeleteSaving(true);
        setDeleteError(null);
        try {
            const res = await fetch(`/api/households/${deleteTarget.id}`, {
                method: "DELETE",
            });
            const json = await res.json().catch(() => null);
            if (!res.ok) throw new Error(json?.error || "Xóa hộ gia đình thất bại");

            setDeleteOpen(false);
            setDeleteTarget(null);
            await loadHouseholds();
        } catch (err) {
            setDeleteError(err?.message || "Có lỗi xảy ra");
        } finally {
            setDeleteSaving(false);
        }
    }

    async function submitSplit(extra) {
        if (!splitTarget?.id) return;
        if (extra?.__clientError) {
            setSplitError(extra.__clientError);
            return;
        }
        if (!splitForm.new_household_code) {
            setSplitError("Vui lòng nhập mã hộ mới");
            return;
        }
        if (!Array.isArray(splitSelectedIds) || splitSelectedIds.length === 0) {
            setSplitError("Vui lòng chọn ít nhất 1 nhân khẩu để tách");
            return;
        }

        setSplitSaving(true);
        setSplitError(null);
        try {
            const payload = {
                new_household_code: splitForm.new_household_code,
                house_number: splitForm.house_number,
                street: splitForm.street,
                resident_ids: splitSelectedIds,
                head_id: extra?.head_id ?? null,
                relations: Array.isArray(extra?.relations) ? extra.relations : [],
            };

            const res = await fetch(`/api/households/${splitTarget.id}/split`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => null);
            if (!res.ok) throw new Error(json?.error || "Tách hộ thất bại");

            setSplitOpen(false);
            setSplitTarget(null);
            setSplitResidents([]);
            setSplitSelectedIds([]);
            await loadHouseholds();
        } catch (err) {
            setSplitError(err?.message || "Có lỗi xảy ra");
        } finally {
            setSplitSaving(false);
        }
    }

    return (
        <div className="space-y-4 p-6">
            <HouseholdHeader onCreate={openCreate} />

            {error ? (
                <div className="text-sm text-destructive">{error}</div>
            ) : null}

            {loading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
            ) : (
                <HouseholdTable
                    data={households}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    onSplit={openSplit}
                />
            )}

            <HouseholdFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                title="Thêm hộ gia đình"
                description="Nhập thông tin hộ gia đình và bấm Lưu."
                form={createForm}
                onChange={setCreateForm}
                onSubmit={submitCreate}
                saving={createSaving}
                error={createError}
                submitLabel="Lưu"
                enableHeadSearch
                residents={residents}
                residentsLoading={residentsLoading}
                residentsError={residentsError}
            />

            <HouseholdFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                title="Chỉnh sửa hộ gia đình"
                description="Cập nhật thông tin hộ gia đình và bấm Lưu."
                form={editForm}
                onChange={setEditForm}
                onSubmit={submitEdit}
                saving={editSaving}
                error={editError}
                submitLabel="Lưu"
                enableHeadSearch
                residents={residents}
                residentsLoading={residentsLoading}
                residentsError={residentsError}
                members={editMembers}
                membersLoading={editMembersLoading}
                membersError={editMembersError}
                onUpdateMemberRelation={updateMemberRelation}
            />

            <HouseholdDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                household={deleteTarget}
                onConfirm={confirmDelete}
                saving={deleteSaving}
                error={deleteError}
            />

            <HouseholdSplitDialog
                open={splitOpen}
                onOpenChange={setSplitOpen}
                household={splitTarget}
                residents={splitResidents}
                loadingResidents={splitResidentsLoading}
                residentsError={splitResidentsError}
                selectedIds={splitSelectedIds}
                onSelectedIdsChange={setSplitSelectedIds}
                form={splitForm}
                onFormChange={setSplitForm}
                saving={splitSaving}
                error={splitError}
                onSubmit={submitSplit}
            />
        </div>
    );
}

export default Household;