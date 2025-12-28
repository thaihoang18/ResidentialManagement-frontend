import React, { useEffect, useState } from "react";
import TemporaryStayLeaveHeader from "./components/TemporaryStayLeaveHeader";
import TemporaryStayLeaveTable from "./components/TemporaryStayLeaveTable";
import TemporaryStayLeaveFormDialog from "./components/TemporaryStayLeaveFormDialog";
import TemporaryStayLeaveDeleteDialog from "./components/TemporaryStayLeaveDeleteDialog";

export default function TemporaryStayLeave() {
  const [items, setItems] = useState([]);
  const [residents, setResidents] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/temporary-stay-leave");
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    try {
      const res = await fetch("/api/residents");
      const json = await res.json();
      if (json.success) setResidents(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHouseholds = async () => {
    try {
      const res = await fetch("/api/households");
      const json = await res.json();
      if (json.success) setHouseholds(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchResidents();
    fetchHouseholds();
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
    await fetchItems();
  };

  const handleDeleted = async () => {
    setDeleteTarget(null);
    await fetchItems();
  };

  return (
    <div className="p-6">
      <TemporaryStayLeaveHeader onCreate={handleCreate} />
      <TemporaryStayLeaveTable
        data={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <TemporaryStayLeaveFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={handleFormSaved}
        initialData={editTarget}
        residents={residents}
        households={households}
      />

      <TemporaryStayLeaveDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}