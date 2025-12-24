import React, { useEffect, useMemo, useState } from "react";
import ResidentHeader from "./components/ResidentHeader";
import ResidentTable from "./components/ResidentTable";
import ResidentFormDialog from "./components/ResidentFormDialog";
import ResidentDeleteDialog from "./components/ResidentDeleteDialog";

export default function ResidentPage() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/residents");
      const json = await res.json();
      if (json.success) setResidents(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleCreate = () => {
    setEditTarget(null);
    setShowForm(true);
  };

  const handleEdit = (row) => {
    setEditTarget(row);
    setShowForm(true);
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const handleFormSaved = async () => {
    setShowForm(false);
    await fetchResidents();
  };

  const handleDeleted = async () => {
    setDeleteTarget(null);
    await fetchResidents();
  };

  return (
    <div className="p-4">
      <ResidentHeader onCreate={handleCreate} />
      <ResidentTable
        data={residents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <ResidentFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={handleFormSaved}
        initialData={editTarget}
      />

      <ResidentDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
