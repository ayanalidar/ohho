"use client";

import * as React from "react";
import { Utensils, Edit2, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  TextInput,
  NumberInput,
  TextArea,
  ListInput,
  Toggle,
  AlertBanner,
  EmptyState,
  SectionHeader,
  IconBtn,
} from "./shared";

export type MenuItem = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
  image: string;
  category: string;
  price: number;
  kcal: number;
  prepTime: string;
  spice: number;
  tag: string | null;
  isAddOn: boolean;
  signature: boolean;
  available: boolean;
  sortOrder: number;
};

type Draft = Omit<MenuItem, "id" | "slug"> & { id?: string; slug?: string };

const emptyDraft: Draft = {
  name: "",
  emoji: "🍔",
  description: "",
  ingredients: [],
  image: "/ohho-images/placeholder.png",
  category: "BURGERS",
  price: 0,
  kcal: 0,
  prepTime: "5 min",
  spice: 0,
  tag: "",
  isAddOn: false,
  signature: false,
  available: true,
  sortOrder: 0,
};

export function MenuItemsView({ items }: { items: MenuItem[] }) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [alert, setAlert] = React.useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [localItems, setLocalItems] = React.useState<MenuItem[]>(items);

  React.useEffect(() => setLocalItems(items), [items]);

  const flash = (kind: "success" | "error", message: string) => {
    setAlert({ kind, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setDraft({ ...item });
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
    if (!draft.name || !draft.category || !draft.price) {
      flash("error", "Name, category and price are required.");
      return;
    }
    setSaving(true);
    try {
      const isNew = editingId === "new";
      const res = await fetch("/api/admin/menu-items", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? draft : { id: draft.id, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      const saved: MenuItem = isNew ? data.item : { ...(localItems.find((i) => i.id === draft.id)!), ...data.item };
      setLocalItems((cur) =>
        isNew ? [...cur, saved] : cur.map((i) => (i.id === saved.id ? saved : i))
      );
      flash("success", isNew ? "Menu item created." : "Menu item updated.");
      cancelEdit();
    } catch (e: any) {
      flash("error", e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this menu item? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/menu-items?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      setLocalItems((cur) => cur.filter((i) => i.id !== id));
      flash("success", "Menu item deleted.");
    } catch (e: any) {
      flash("error", e?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-3">
      <SectionHeader
        title="Menu Items"
        count={localItems.length}
        onAdd={startAdd}
        addLabel="New item"
      />
      {alert && (
        <AlertBanner kind={alert.kind} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {/* New-item draft card */}
      {editingId === "new" && draft && (
        <ItemEditor
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={cancelEdit}
          saving={saving}
          isNew
        />
      )}

      {localItems.length === 0 && editingId !== "new" ? (
        <EmptyState icon={Utensils} message="No menu items yet. Click 'New item' to add one." />
      ) : (
        localItems.map((item) =>
          editingId === item.id && draft ? (
            <ItemEditor
              key={item.id}
              draft={draft}
              setDraft={setDraft}
              onSave={save}
              onCancel={cancelEdit}
              saving={saving}
            />
          ) : (
            <ItemCard key={item.id} item={item} onEdit={() => startEdit(item)} onDelete={() => remove(item.id)} />
          )
        )
      )}
    </div>
  );
}

/* ---------- Card view ---------- */
function ItemCard({ item, onEdit, onDelete }: { item: MenuItem; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="text-3xl leading-none flex-shrink-0 mt-0.5">{item.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-lg text-ohho-cream">{item.name}</span>
                {item.signature && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-ohho-gold/15 text-ohho-gold border border-ohho-gold/30">
                    Signature
                  </span>
                )}
                {item.isAddOn && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-ohho-cream/10 text-ohho-cream-dim border border-ohho-cream/20">
                    Add-on
                  </span>
                )}
                {!item.available && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-ohho-red/15 text-ohho-red border border-ohho-red/30">
                    Hidden
                  </span>
                )}
              </div>
              <div className="text-[11px] text-ohho-cream-dim mt-0.5">
                {item.category} · ₹{item.price} · {item.kcal} kcal · {item.prepTime} ·{" "}
                {"🌶".repeat(Math.max(0, Math.min(3, item.spice))) || "mild"}
              </div>
            </div>
            <div className="flex gap-2">
              <IconBtn onClick={onEdit} icon={Edit2} label="Edit" />
              <IconBtn onClick={onDelete} icon={Trash2} label="Delete" tone="danger" />
            </div>
          </div>
          {item.description && (
            <p className="text-sm text-ohho-cream/70 mt-2">{item.description}</p>
          )}
          {item.ingredients.length > 0 && (
            <div className="text-[11px] text-ohho-cream-dim mt-1">
              <span className="text-ohho-gold">Ingredients:</span> {item.ingredients.join(", ")}
            </div>
          )}
          {item.tag && (
            <div className="text-[10px] text-ohho-orange mt-1 uppercase tracking-wider">Tag: {item.tag}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Editor (inline form) ---------- */
function ItemEditor({
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
          {isNew ? "New menu item" : "Edit menu item"}
        </div>
        <div className="flex gap-2">
          <IconBtn onClick={onSave} icon={Save} label={saving ? "Saving…" : "Save"} tone="primary" />
          <IconBtn onClick={onCancel} icon={X} label="Cancel" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Emoji" className="col-span-1">
          <TextInput value={draft.emoji} onChange={(v) => setDraft({ ...draft, emoji: v })} placeholder="🍔" />
        </Field>
        <Field label="Name" className="col-span-2 sm:col-span-2">
          <TextInput value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Crispy Chicken Burger" />
        </Field>
        <Field label="Category" className="col-span-1">
          <TextInput value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="BURGERS" />
        </Field>
      </div>

      <Field label="Description" className="mt-3">
        <TextArea value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} placeholder="Short, mouth-watering description" />
      </Field>

      <Field label="Ingredients" className="mt-3" hint="Comma-separated, e.g. Chicken patty, Lett, Cheese">
        <ListInput value={draft.ingredients} onChange={(v) => setDraft({ ...draft, ingredients: v })} />
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <Field label="Price (₹)">
          <NumberInput value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} min={0} />
        </Field>
        <Field label="Kcal">
          <NumberInput value={draft.kcal} onChange={(v) => setDraft({ ...draft, kcal: v })} min={0} />
        </Field>
        <Field label="Prep time">
          <TextInput value={draft.prepTime} onChange={(v) => setDraft({ ...draft, prepTime: v })} placeholder="5 min" />
        </Field>
        <Field label="Spice (0-3)">
          <NumberInput value={draft.spice} onChange={(v) => setDraft({ ...draft, spice: v })} min={0} max={3} />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
        <Field label="Tag" hint="e.g. NEW, BESTSELLER">
          <TextInput value={draft.tag || ""} onChange={(v) => setDraft({ ...draft, tag: v })} />
        </Field>
        <Field label="Image path">
          <TextInput value={draft.image} onChange={(v) => setDraft({ ...draft, image: v })} placeholder="/ohho-images/..." />
        </Field>
        <Field label="Sort order">
          <NumberInput value={draft.sortOrder} onChange={(v) => setDraft({ ...draft, sortOrder: v })} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4">
        <Toggle checked={draft.available} onChange={(v) => setDraft({ ...draft, available: v })} label="Available" />
        <Toggle checked={draft.signature} onChange={(v) => setDraft({ ...draft, signature: v })} label="Signature" />
        <Toggle checked={draft.isAddOn} onChange={(v) => setDraft({ ...draft, isAddOn: v })} label="Add-on" />
      </div>
    </div>
  );
}
