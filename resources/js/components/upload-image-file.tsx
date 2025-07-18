import React, { FC, FormEvent, useState } from 'react';
import { GetProp, Image, Upload, UploadFile, UploadProps, message } from 'antd';
import { PlusIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

interface IUploadImageFile {
    route: string;
    defaultImage?: { url: string, fileName: string };
    onSuccess?: (fileUrl: string) => void;
}

const UploadImageFile: FC<IUploadImageFile> = ({ route, defaultImage, onSuccess }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[] | []>(() => {
        return defaultImage?.fileName ? [
            {
                uid: '1',
                name: defaultImage?.fileName || 'image.jpg',
                status: 'done',
                url: defaultImage?.url,
            }
        ] : [];
    });

    const { setData, post, reset } = useForm({
        image: null as File | null,
    });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList }) => {
        // Берем последний загруженный файл
        const lastFile = fileList[0];
        setFileList(fileList || null);
        // Обновляем данные формы
        if (lastFile?.originFileObj) {

            setData('image', lastFile?.originFileObj);


            post(route, {
                preserveScroll: true,
                onSuccess: () => {
                    message.success('Аватар успешно загружен');
                    onSuccess?.(lastFile.response?.url);
                },
                onError: (errors) => {
                    message.error('Ошибка при загрузке аватара');
                    console.error(errors);
                }
            });
        }
    };

    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        // Проверяем тип файла (разрешены только изображения)
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Можно загружать только изображения!');
            return Upload.LIST_IGNORE; // Игнорируем файл
        }

        // Проверяем размер файла (например, не больше 5MB)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Изображение должно быть меньше 5MB!');
            return Upload.LIST_IGNORE;
        }

        setData('image', file);

        return false; // Отключаем автоматическую загрузку
    };

    const uploadButton = (
        <button className="flex flex-col items-center" style={{ border: 0, background: 'none' }} type="button">
            <PlusIcon />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <Upload
                listType="picture-circle"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                maxCount={1}
                showUploadList={true}
                beforeUpload={beforeUpload}
            >
                {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewImage && (
                <Image
                    width={200}
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}

                />
            )}
        </div>
    );
};

export default UploadImageFile;
