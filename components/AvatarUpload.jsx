import React, { useState } from 'react';
import { View, Image, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { storage, avatars, config, account } from '../lib/appwrite';
import { ID } from 'appwrite';

const MAX_FILE_SIZE_MB = 2;

const AvatarUpload = ({ username, avatarFileId, onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handlePickFile = async () => {
    if (uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'We need access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    try {
      setUploading(true);
      const session = await account.get();
      const userId = session.$id;

      const fileResponse = await fetch(asset.uri);
      const fileBlob = await fileResponse.blob();

      if (fileBlob.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        Alert.alert('File too large', `Max size is ${MAX_FILE_SIZE_MB}MB`);
        return;
      }

      if (avatarFileId) {
        try {
          await storage.deleteFile(config.storageId, avatarFileId);
        } catch (error) {
          console.warn('Old avatar not found, skipping delete.');
        }
      }

      const fileId = ID.unique();
      const response = await storage.createFile(
        config.storageId,
        fileId,
        {
          name: asset.fileName || 'avatar.jpg',
          type: asset.mimeType || 'image/jpeg',
          size: fileBlob.size,
          uri: asset.uri,
        },
        [
          `read("user:${userId}")`,
          `write("user:${userId}")`
        ]
      );

      onUpload(response.$id);
    } catch (error) {
      console.error('Upload failed:', error);

      const msg = error?.message?.toLowerCase() || '';
      const isHarmless = msg.includes('not found') || msg.includes('could not be found');

      if (!isHarmless) {
        Alert.alert('Upload Failed', error.message || 'Failed to upload avatar.');
      } else {
        console.log('Ignored harmless error:', error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  // Cache-safe image URL builder
  const getUrlWithTimestamp = (url) =>
    url.includes('?') ? `${url}&ts=${Date.now()}` : `${url}?ts=${Date.now()}`;

  const avatarUrl = avatarFileId
    ? getUrlWithTimestamp(storage.getFileView(config.storageId, avatarFileId).href)
    : avatars.getInitials(username).href;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'flex-start', marginTop: 32, gap: 10 }}>
      <Pressable onPress={handlePickFile} disabled={uploading}>
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            borderWidth: 2,
            borderColor: '#ccc',
            opacity: uploading ? 0.4 : 1
          }}
          onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
        />
        {uploading && (
          <ActivityIndicator
            size="small"
            color="#3DDC84"
            style={{ position: 'absolute', top: 36, left: 36 }}
          />
        )}
      </Pressable>

      <Text style={{ fontSize: 18, fontFamily: 'ossemibold', marginTop: 8 }}>
        {username}
      </Text>
    </View>
  );
};

export default AvatarUpload;
