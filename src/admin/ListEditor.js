import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '../theme';
import { uid } from '../utils/time';
import { Button, Card, DateField, Field, ImageField, Toggle } from './ui';

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function PostPicker({ label, value, onChange, posts }) {
  const selected = new Set(value || []);
  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.main, fontSize: 13, color: colors.muted, marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {posts.length === 0 ? <Text style={{ color: colors.muted, fontFamily: fonts.main, fontSize: 13 }}>Belum ada kegiatan.</Text> : null}
        {posts.map((p) => {
          const on = selected.has(p.id);
          return (
            <Pressable
              key={p.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(p.id)}
              style={{ borderWidth: 1, borderColor: on ? colors.text : colors.border, backgroundColor: on ? colors.text : 'transparent', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }}
            >
              <Text style={{ fontFamily: fonts.main, fontSize: 13, color: on ? '#000' : colors.text }}>{p.title || '(tanpa judul)'}</Text>
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
    case 'posts':
      return <PostPicker key={spec.key} label={spec.label} value={value} onChange={onChange} posts={extra.posts || []} />;
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
 * Editor daftar generik: tambah, ubah, urutkan, duplikat, hapus.
 * `fixed` = daftar tetap (tanpa tambah/hapus), mis. tab navigasi.
 */
export default function ListEditor({ title, items, onChange, fields, makeItem, itemTitle, addLabel = 'Tambah', fixed, extra = {}, nested }) {
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
    <View style={{ marginBottom: nested ? 8 : 0 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        {title ? <Text style={{ fontFamily: fonts.main, color: nested ? colors.muted : colors.text, fontSize: nested ? 13 : 16, fontWeight: '600' }}>{title} ({items.length})</Text> : <View />}
        {!fixed ? <Button small kind="primary" label={`+ ${addLabel}`} onPress={add} /> : null}
      </View>
      {items.length === 0 ? <Text style={{ color: colors.muted, fontFamily: fonts.main, fontSize: 14, marginBottom: 12 }}>Belum ada data.</Text> : null}
      {items.map((item, index) => {
        const expanded = Boolean(open[item.id]);
        const setItem = (next) => onChange(items.map((it, i) => (i === index ? next : it)));
        return (
          <Card key={item.id} style={nested ? { backgroundColor: colors.panelAlt } : undefined}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => toggleOpen(item.id)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 10 }}
            >
              <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.main, color: colors.text, fontSize: 15, fontWeight: '600' }}>
                {itemTitle(item, index) || '(kosong)'}
              </Text>
              <Text style={{ color: colors.muted, fontFamily: fonts.main, fontSize: 13 }}>{expanded ? 'Tutup' : 'Ubah'}</Text>
            </Pressable>
            {expanded ? (
              <View style={{ marginTop: 14 }}>
                {fields.map((spec) => renderField(spec, item, setItem, extra))}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Button small label="Naik" disabled={index === 0} onPress={() => onChange(move(items, index, index - 1))} />
                  <Button small label="Turun" disabled={index === items.length - 1} onPress={() => onChange(move(items, index, index + 1))} />
                  {!fixed ? <Button small label="Duplikat" onPress={() => duplicate(index)} /> : null}
                  {!fixed ? <Button small kind="danger" label="Hapus" onPress={() => remove(index)} /> : null}
                </View>
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}
