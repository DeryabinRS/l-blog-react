import React, { FC, useState } from 'react';
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
    defaultImage?: string;
    onSuccess?: (fileUrl: string) => void;
}

const UploadImageFile: FC<IUploadImageFile> = ({ route, defaultImage, onSuccess }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(defaultImage || '');
    const [currentFile, setCurrentFile] = useState<UploadFile | null>(null);
    const { data, setData, post, progress, reset } = useForm({
        avatar: null as File | null,
    });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview && file.originFileObj) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ file }) => {
        if (file.status === 'done') {
            message.success('Аватар успешно загружен');
            if (file.response?.url) {
                setPreviewImage(file.response.url);
                onSuccess?.(file.response.url);
            }
            setCurrentFile(file);
        } else if (file.status === 'error') {
            message.error('Ошибка при загрузке аватара');
        }
    };

    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        if (currentFile) {
            message.error('Вы можете загрузить только один файл');
            return Upload.LIST_IGNORE;
        }

        // Обновляем данные формы перед отправкой
        reset();
        setData('avatar', file);

        return false; // Отключаем автоматическую загрузку
    };

    const handleSubmit = () => {
        if (!data.avatar) {
            message.error('Пожалуйста, выберите файл');
            return;
        }

        post(route, {
            forceFormData: true,
            onSuccess: () => {
                message.success('Аватар успешно обновлен');
                reset();
            },
            onError: () => {
                message.error('Ошибка при загрузке аватара');
            },
        });
    };

    return (
        <div className="space-y-4">
            <Upload
                customRequest={handleSubmit}
                name="avatar"
                listType="picture-circle"
                fileList={currentFile ? [currentFile] : []}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={beforeUpload}
                maxCount={1}
                accept="image/*"
                showUploadList={false}
            >
                {!currentFile ? (
                    <button className="flex flex-col items-center" type="button">
                        <PlusIcon />
                        <div style={{ marginTop: 8 }}>Загрузить</div>
                    </button>
                ) : (
                    <div className="w-full h-full rounded-full overflow-hidden">
                        <Image
                            wrapperStyle={{ display: 'none' }}
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    </div>
                )}
            </Upload>

            {/*{data.avatar && (*/}
            {/*    <button*/}
            {/*        onClick={handleSubmit}*/}
            {/*        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"*/}
            {/*        disabled={progress}*/}
            {/*    >*/}
            {/*        {progress ? 'Загрузка...' : 'Сохранить аватар'}*/}
            {/*    </button>*/}
            {/*)}*/}

            {/*{progress && (*/}
            {/*    <div className="w-full bg-gray-200 rounded-full h-2.5">*/}
            {/*        <div*/}
            {/*            className="bg-blue-600 h-2.5 rounded-full"*/}
            {/*            style={{ width: `${progress.percentage}%` }}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};

export default UploadImageFile;
