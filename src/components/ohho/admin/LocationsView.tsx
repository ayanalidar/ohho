"use client";

import * as React from "react";
import { MapPin, Edit2, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  TextInput,
  NumberInput,
  Toggle,
  AlertBanner,
  EmptyState,
  SectionHeader,
  IconBtn,
} from "./shared";

export type Location = {
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string;
  status: string;
  rating: number;
  customers: number;
  deliveryRadiusKm: number;
  prepTimeExtra: string;
  image: string;
  active: boolean;
};

type Draft = Omit<Location, "id"> & { id?: string };

const emptyDraft: Draft = {
  slug: "",
  name: "",
  city: "",
  area: "",
  status: "operational",
  rating: 4.8,
  customers: 0,
  deliveryRadiusKm: 5,
  prepTimeExtra: "0 min",
  image: "/ohho-images/ohho-cart-1.png",
  active: true,
};

export function LocationsView({ locations }: { locations: Location[] }) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [alert, setAlert] = React.useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [local, setLocal] = React.useState<Location[]>(locations);

  React.useEffect(() => setLocal(locations), [locations]);

  const flash = (kind: "success" | "error", message: string) => {
    setAlert({ kind, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const startEdit = (l: Location) => {
    setEditingId(l.id);
    setDraft({ ...l });
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
    if (!draft.slug || !draft.name || !draft.city) {
      flash("error", "Slug, name and city are required.");
      return;
    }
    setSaving(true);
    try {
      const isNew = editingId === "new";
      const res = await fetch("/api/admin/locations", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? draft : { id: draft.id, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      const saved: Location = isNew
        ? data.location
        : { ...(local.find((i) => i.id === draft.id)!), ...data.location };
      setLocal((cur) =>
        isNew ? [...cur, saved] : cur.map((i) => (i.id === saved.id ? saved : i))
      );
      flash("success", isNew ? "Location created." : "Location updated.");
      cancelEdit();
    } catch (e: any) {
      flash("error", e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this location? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      setLocal((cur) => cur.filter((i) => i.id !== id));
      flash("success", "Location deleted.");
    } catch (e: any) {
      flash("error", e?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-3">
      <SectionHeader title="Locations" count={local.length} onAdd={startAdd} addLabel="New location" />
      {alert && (
        <AlertBanner kind={alert.kind} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {editingId === "new" && draft && (
        <LocEditor draft={draft} setDraft={setDraft} onSave={save} onCancel={cancelEdit} saving={saving} isNew />
      )}

      {local.length === 0 && editingId !== "new" ? (
        <EmptyState icon={MapPin} message="No locations yet. Click 'New location' to add one." />
      ) : (
        local.map((l) =>
          editingId === l.id && draft ? (
            <LocEditor key={l.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancelEdit} saving={saving} />
          ) : (
            <LocCard key={l.id} loc={l} onEdit={() => startEdit(l)} onDelete={() => remove(l.id)} />
          )
        )
      )}
    </div>
  );
}

function LocCard({ loc, onEdit, onDelete }: { loc: Location; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-md bg-ohho-orange/15 border border-ohho-orange/30 grid place-items-center flex-shrink-0">
            <MapPin className="h-5 w-5 text-ohho-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-lg text-ohho-cream">{loc.name}</span>
              {!loc.active && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-ohho-red/15 text-ohho-red border border-ohho-red/30">
                  Inactive
                </span>
              )}
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                  loc.status === "operational"
                    ? "bg-ohho-green/15 text-ohho-green border-ohho-green/40"
                    : "bg-ohho-gold/15 text-ohho-gold border-ohho-gold/40"
                )}
              >
                {loc.status}
              </span>
            </div>
            <div className="text-[11px] text-ohho-cream-dim mt-0.5">
              <span className="text-ohho-gold">{loc.slug}</span> · {loc.city}
              {loc.area ? `, ${loc.area}` : ""}
            </div>
            <div className="text-[11px] text-ohho-cream-dim mt-1 grid grid-cols-2 sm:grid-cols-4 gap-1">
              <span>⭐ {loc.rating}</span>
              <span>👥 {loc.customers}</span>
              <span>🛵 {loc.deliveryRadiusKm} km</span>
              <span>⏱ {loc.prepTimeExtra}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <IconBtn onClick={onEdit} icon={Edit2} label="Edit" />
          <IconBtn onClick={onDelete} icon={Trash2} label="Delete" tone="danger" />
        </div>
      </div>
    </div>
  );
}

function LocEditor({
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
          {isNew ? "New location" : "Edit location"}
        </div>
        <div className="flex gap-2">
          <IconBtn onClick={onSave} icon={Save} label={saving ? "Saving…" : "Save"} tone="primary" />
          <IconBtn onClick={onCancel} icon={X} label="Cancel" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="Slug" hint="unique key, e.g. srinagar-dal-lake">
          <TextInput value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} placeholder="srinagar-dal-lake" />
        </Field>
        <Field label="Name">
          <TextInput value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Dal Lake Cart" />
        </Field>
        <Field label="City">
          <TextInput value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} placeholder="Srinagar" />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
        <Field label="Area">
          <TextInput value={draft.area} onChange={(v) => setDraft({ ...draft, area: v })} />
        </Field>
        <Field label="Status">
          <TextInput value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} placeholder="operational" />
        </Field>
        <Field label="Image path">
          <TextInput value={draft.image} onChange={(v) => setDraft({ ...draft, image: v })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <Field label="Rating">
          <NumberInput value={draft.rating} onChange={(v) => setDraft({ ...draft, rating: v })} step={0.1} min={0} max={5} />
        </Field>
        <Field label="Customers">
          <NumberInput value={draft.customers} onChange={(v) => setDraft({ ...draft, customers: v })} min={0} />
        </Field>
        <Field label="Delivery radius (km)">
          <NumberInput value={draft.deliveryRadiusKm} onChange={(v) => setDraft({ ...draft, deliveryRadiusKm: v })} min={0} />
        </Field>
        <Field label="Prep time extra">
          <TextInput value={draft.prepTimeExtra} onChange={(v) => setDraft({ ...draft, prepTimeExtra: v })} placeholder="0 min" />
        </Field>
      </div>

      <div className="mt-4">
        <Toggle checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label="Active" />
      </div>
    </div>
  );
}
