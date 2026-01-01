declare global {
    interface Window {
        Kakao: any;
    }
}

export const initKakao = () => {
    try {
        if (window.Kakao && !window.Kakao.isInitialized()) {
            const key = import.meta.env.VITE_KAKAO_JS_KEY;
            if (key) {
                window.Kakao.init(key);
                console.log('Kakao SDK Initialized');
            } else {
                console.warn('Kakao JS Key is missing in env');
            }
        }
    } catch (e) {
        console.error('Kakao SDK Init Failed', e);
    }
};

export const shareKakao = (title: string, description: string, imageUrl: string, link: string) => {
    if (!window.Kakao) {
        alert('카카오 SDK가 로드되지 않았습니다.');
        return;
    }

    window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title,
            description,
            imageUrl,
            link: {
                mobileWebUrl: link,
                webUrl: link,
            },
        },
        buttons: [
            {
                title: '상세보기',
                link: {
                    mobileWebUrl: link,
                    webUrl: link,
                },
            },
        ],
    });
};
