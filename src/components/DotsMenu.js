import { useState } from 'react';
import { Platform, Pressable, Share, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

async function copy(text) {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export default function DotsMenu({ url, title }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  const flash = (msg) => {
    setNote(msg);
    setTimeout(() => {
      setNote('');
      setOpen(false);
    }, 1200);
  };

  const onCopy = async () => {
    try {
      flash((await copy(url)) ? 'Tautan disalin' : 'Salin tidak didukung');
    } catch {
      flash('Gagal menyalin');
    }
  };

  const onShare = async () => {
    try {
      await Share.share({ message: title, url });
      setOpen(false);
    } catch {
      onCopy();
    }
  };

  const item = { paddingVertical: 10, paddingHorizontal: 14 };
  const label = { color: colors.text, fontFamily: fonts.main, fontSize: 14 };

  return (
    <View style={{ alignItems: 'flex-end', zIndex: open ? 10 : 0 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Opsi lainnya"
        onPress={() => setOpen((v) => !v)}
        hitSlop={12}
        style={{ flexDirection: 'row', columnGap: 3, paddingVertical: 4, paddingLeft: 8 }}
      >
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.text }} />
        ))}
      </Pressable>
      {open ? (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 28,
            minWidth: 150,
            backgroundColor: colors.panelAlt,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {note ? (
            <Text style={[item, label]}>{note}</Text>
          ) : (
            <>
              <Pressable accessibilityRole="button" onPress={onCopy} style={item}>
                <Text style={label}>Salin tautan</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onShare} style={item}>
                <Text style={label}>Bagikan</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}
