import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const importModel = (fileOrUrl, onLoad = () => {}, onProgress = () => {}, onError = () => {}) => {
    const loader = new GLTFLoader();

    if (fileOrUrl instanceof File) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            loader.parse(contents, '', function (gltf) {
                onLoad(gltf);
            }, onError);
        };
        reader.readAsArrayBuffer(fileOrUrl);
    } else if (typeof fileOrUrl === 'string') {
        loader.load(fileOrUrl, onLoad, onProgress, onError);
    } else {
        console.error('Invalid input type. Expected File object or URL string.');
        onError('Invalid input type');
    }
};
