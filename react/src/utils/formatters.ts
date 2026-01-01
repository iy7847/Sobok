export const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return '신규';
    return status;
};

export const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending' || status === '신규') return 'bg-red-400/10 text-red-400 border-red-400/20';

    switch (status) {
        case '확인': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
        case '완료': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
        case '취소': return 'bg-white/5 text-gray-400 border-white/10';
        default: return 'bg-white/5 text-text-muted border-white/10';
    }
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
};

export const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};
