import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { fonts } from '../theme';
import { uid } from '../utils/time';
import { A, Button, DateField, Field, ImageField, SettingRow, Toggle } from './ui';

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function Chips({ label, options, isOn, onToggle, role, empty }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.main, fontSize: 14, color: A.muted, marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.length === 0 ? <Text style={{ color: A.faint, fontFamily: fonts.main, fontSize: 14 }}>{empty}</Text> : null}
        {options.map((opt) => {
          const on = isOn(opt.value);
          return (
            <Pressable
              key={opt.value}
              accessibilityRole={role}
              accessibilityState={{ checked: on }}
              onPress={() => onToggle(opt.value)}
              style={{ borderWidth: 1, borderColor: on ? A.text : A.inputBorder, backgroundColor: on ? A.text : 'transparent', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 }}
            >
              <Text style={{ fontFamily: fonts.main, fontSize: 14, color: on ? '#000' : A.text }}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function renderField(spec, item, setItem, extra) {
  const value = item[spec.key];
  const onChange = (v) => setItem({ ...item, [spec.key]: v });
  switch (spec.type) {
    case 'multiline':
      return <Field key={spec.key} label={spec.label} value={value} onChange={onChange} multiline />;
    case 'image':
      return <ImageField key={spec.key} label={spec.label} value={value} onChange={onChange} maxSize={spec.maxSize} />;
    case 'date':
      return <DateField key={spec.key} label={spec.label} value={value} onChange={onChange} />;
    case 'toggle':
      return <Toggle key={spec.key} label={spec.label} value={value !== false} onChange={onChange} />;
    case 'choice':
      return (
        <Chips
          key={spec.key}
          label={spec.label}
          role="radio"
          options={spec.options.map((o) => ({ value: o, label: o }))}
          isOn={(v) => value === v}
          onToggle={onChange}
        />
      );
    case 'posts': {
      const selected = new Set(value || []);
      return (
        <Chips
          key={spec.key}
          label={spec.label}
          role="checkbox"
          empty="Belum ada kegiatan."
          options={(extra.posts || []).map((p) => ({ value: p.id, label: p.title || '(tanpa judul)' }))}
          isOn={(id) => selected.has(id)}
          onToggle={(id) => {
            const next = new Set(selected);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            onChange([...next]);
          }}
        />
      );
    }
    case 'list':
      return (
        <View key={spec.key} style={{ marginTop: 6 }}>
          <ListEditor
            title={spec.label}
            items={value || []}
            onChange={onChange}
            fields={spec.fields}
            makeItem={spec.makeItem}
            itemTitle={spec.itemTitle}
            addLabel={spec.addLabel}
            extra={extra}
            nested
          />
        </View>
      );
    default:
      return <Field key={spec.key} label={spec.label} value={value} onChange={onChange} hint={spec.hint} placeholder={spec.placeholder} />;
  }
}

/**
 * Daftar bergaya Settings: tiap data adalah satu baris yang bisa dibuka untuk mengedit.
 * `fixed` = daftar tetap (tanpa tambah/hapus), mis. tab navigasi.
 */
export default function ListEditor({
  title,
  items,
  onChange,
  fields,
  makeItem,
  itemTitle,
  itemSubtitle,
  itemRight,
  addLabel = 'Tambah',
  fixed,
  extra = {},
  nested,
}) {
  const [open, setOpen] = useState({});
  const toggleOpen = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const add = () => {
    const item = { ...makeItem(), id: uid() };
    onChange([item, ...items]);
    setOpen((o) => ({ ...o, [item.id]: true }));
  };
  const remove = (index) => onChange(items.filter((_, i) => i !== index));
  const duplicate = (index) => {
    const copy = JSON.parse(JSON.stringify(items[index]));
    copy.id = uid();
    if (Array.isArray(copy.items)) copy.items = copy.items.map((it) => ({ ...it, id: uid() }));
    onChange([...items.slice(0, index + 1), copy, ...items.slice(index + 1)]);
  };

  return (
    <View style={nested ? { borderLeftWidth: 1, borderLeftColor: A.line, paddingLeft: 16, marginTop: 4 } : undefined}>
      {nested && title ? (
        <Text style={{ fontFamily: fonts.main, color: A.muted, fontSize: 14, marginBottom: 2 }}>{title} ({items.length})</Text>
      ) : null}
      {!fixed ? (
        <SettingRow title={`Tambah ${addLabel.toLowerCase()}`} right="+" onPress={add} />
      ) : null}
      {items.length === 0 ? <Text style={{ color: A.faint, fontFamily: fonts.main, fontSize: 15, paddingVertical: 12 }}>Belum ada data.</Text> : null}
      {items.map((item, index) => {
        const expanded = Boolean(open[item.id]);
        const setItem = (next) => onChange(items.map((it, i) => (i === index ? next : it)));
        return (
          <SettingRow
            key={item.id}
            title={itemTitle(item, index) || '(kosong)'}
            description={itemSubtitle ? itemSubtitle(item, index) : undefined}
            right={expanded ? undefined : itemRight ? itemRight(item, index) : 'Ubah'}
            expanded={expanded}
            onPress={() => toggleOpen(item.id)}
          >
            {fields.map((spec) => renderField(spec, item, setItem, extra))}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              <Button small label="Naik" disabled={index === 0} onPress={() => onChange(move(items, index, index - 1))} />
              <Button small label="Turun" disabled={index === items.length - 1} onPress={() => onChange(move(items, index, index + 1))} />
              {!fixed ? <Button small label="Duplikat" onPress={() => duplicate(index)} /> : null}
              {!fixed ? <Button small kind="danger" label="Hapus" onPress={() => remove(index)} /> : null}
            </View>
          </SettingRow>
        );
      })}
    </View>
  );
}
