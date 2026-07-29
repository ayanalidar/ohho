"use client";

import * as React from "react";
import { PartyPopper, Edit2, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  TextInput,
  TextArea,
  ListInput,
  NumberInput,
  Toggle,
  AlertBanner,
  EmptyState,
  SectionHeader,
  IconBtn,
} from "./shared";

export type CateringPackage = {
  id: string;
  name: string;
  pax: string;
  price: string;
  items: string[];
  note: string | null;
  color: string;
  sortOrder: number;
  available: boolean;
};

type Draft = Omit<CateringPackage, "id"> & { id?: string };

const emptyDraft: Draft = {
  name: "",
  pax: "",
  price: "0",
  items: [],
  note: "",
  color: "#ff6a00",
  sortOrder: 0,
  available: true,
};

export function CateringPackagesView({ packages }: { packages: CateringPackage[] }) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [alert, setAlert] = React.useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [local, setLocal] = React.useState<CateringPackage[]>(packages);

  React.useEffect(() => setLocal(packages), [packages]);

  const flash = (kind: "success" | "error", message: string) => {
    setAlert({ kind, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const startEdit = (p: CateringPackage) => {
    setEditingId(p.id);
    setDraft({ ...p });
  };
  const startAdd = () => {
    setEditingId("new");
    setDraft({ ...emptyDraft });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.name || !draft.price) {
      flash("error", "Name and price are required.");
      return;
    }
    setSaving(true);
    try {
      const isNew = editingId === "new";
      const res = await fetch("/api/admin/catering-packages", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? draft : { id: draft.id, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      const saved: CateringPackage = isNew
        ? data.package
        : { ...(local.find((i) => i.id === draft.id)!), ...data.package };
      setLocal((cur) =>
        isNew ? [...cur, saved] : cur.map((i) => (i.id === saved.id ? saved : i))
      );
      flash("success", isNew ? "Package created." : "Package updated.");
      cancelEdit();
    } catch (e: any) {
      flash("error", e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this package? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/catering-packages?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      setLocal((cur) => cur.filter((i) => i.id !== id));
      flash("success", "Package deleted.");
    } catch (e: any) {
      flash("error", e?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-3">
      <SectionHeader title="Catering Packages" count={local.length} onAdd={startAdd} addLabel="New package" />
      {alert && (
        <AlertBanner kind={alert.kind} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {editingId === "new" && draft && (
        <PkgEditor draft={draft} setDraft={setDraft} onSave={save} onCancel={cancelEdit} saving={saving} isNew />
      )}

      {local.length === 0 && editingId !== "new" ? (
        <EmptyState icon={PartyPopper} message="No catering packages yet. Click 'New package' to add one." />
      ) : (
        local.map((p) =>
          editingId === p.id && draft ? (
            <PkgEditor key={p.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancelEdit} saving={saving} />
          ) : (
            <PkgCard key={p.id} pkg={p} onEdit={() => startEdit(p)} onDelete={() => remove(p.id)} />
          )
        )
      )}
    </div>
  );
}

function PkgCard({ pkg, onEdit, onDelete }: { pkg: CateringPackage; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="glass-card rounded-xl p-4" style={{ borderLeft: `3px solid ${pkg.color}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg text-ohho-cream">{pkg.name}</span>
            {!pkg.available && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-ohho-red/15 text-ohho-red border border-ohho-red/30">
                Hidden
              </span>
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
              style={{ color: pkg.color, borderColor: `${pkg.color}66`, background: `${pkg.color}15` }}
            >
              ₹{pkg.price}
            </span>
          </div>
          <div className="text-[11px] text-ohho-cream-dim mt-0.5">
            {pkg.pax || "—"} · order #{pkg.sortOrder}
          </div>
          {pkg.items.length > 0 && (
            <div className="text-sm text-ohho-cream/80 mt-2">{pkg.items.join(" · ")}</div>
          )}
          {pkg.note && <div className="text-[11px] text-ohho-gold mt-1 italic">{pkg.note}</div>}
        </div>
        <div className="flex gap-2">
          <IconBtn onClick={onEdit} icon={Edit2} label="Edit" />
          <IconBtn onClick={onDelete} icon={Trash2} label="Delete" tone="danger" />
        </div>
      </div>
    </div>
  );
}

function PkgEditor({
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
  isNew,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isNew?: boolean;
}) {
  return (
    <div className={cn("glass-card rounded-xl p-4", isNew && "border-ohho-orange/50")}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-lg text-ohho-cream">
          {isNew ? "New package" : "Edit package"}
        </div>
        <div className="flex gap-2">
          <IconBtn onClick={onSave} icon={Save} label={saving ? "Saving…" : "Save"} tone="primary" />
          <IconBtn onClick={onCancel} icon={X} label="Cancel" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Name" className="col-span-2">
          <TextInput value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Family Feast" />
        </Field>
        <Field label="Pax">
          <TextInput value={draft.pax} onChange={(v) => setDraft({ ...draft, pax: v })} placeholder="Serves 8-10" />
        </Field>
        <Field label="Price (₹)">
          <TextInput value={String(draft.price)} onChange={(v) => setDraft({ ...draft, price: v })} placeholder="1499" />
        </Field>
      </div>

      <Field label="Items" className="mt-3" hint="Comma-separated, e.g. 4x Burger, 2x Pizza, Fries">
        <ListInput value={draft.items} onChange={(v) => setDraft({ ...draft, items: v })} />
      </Field>

      <Field label="Note" className="mt-3">
        <TextArea value={draft.note || ""} onChange={(v) => setDraft({ ...draft, note: v })} rows={2} placeholder="Optional note" />
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 items-end">
        <Field label="Color (hex)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
              className="h-9 w-12 rounded border border-ohho-gold/20 bg-ohho-black/60 cursor-pointer"
              aria-label="Pick color"
            />
            <TextInput value={draft.color} onChange={(v) => setDraft({ ...draft, color: v })} />
          </div>
        </Field>
        <Field label="Sort order">
          <NumberInput value={draft.sortOrder} onChange={(v) => setDraft({ ...draft, sortOrder: v })} />
        </Field>
        <div className="pb-1">
          <Toggle checked={draft.available} onChange={(v) => setDraft({ ...draft, available: v })} label="Available" />
        </div>
      </div>
    </div>
  );
}
