import React, { useEffect, useState, useCallback } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';
import {
    ClipboardList,
    Search,
    Calendar,
    ExternalLink,
    Share2,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    MessageSquare,
    Copy,
    User,
    Phone,
    CreditCard,
    Edit,
    Save,
    ChevronRight,
    RefreshCw,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order, OrderItem } from '../types';

declare global {
    interface Window {
        Kakao: any;
    }
}

const OrdersPage: React.FC = () => {
    const { user, profile } = useAuth();
    const { orders, loading, fetchOrders, updateOrderStatus, updateOrderDetails, deleteOrder } = useOrders();

    const [activeTab, setActiveTab] = useState<'Active' | 'Completed' | 'All'>('Active');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // Editing state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editingItems, setEditingItems] = useState<OrderItem[]>([]);
    const [currentRemarks, setCurrentRemarks] = useState('');

    const loadData = useCallback(() => {
        fetchOrders({ startDate, endDate, status: statusFilter });
    }, [fetchOrders, startDate, endDate, statusFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const shopLink = user ? `${window.location.origin}${import.meta.env.BASE_URL}shop/${user.id}?v=${new Date().getTime()}` : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shopLink);
        alert('링크가 복사되었습니다.');
    };

    const shareViaKakao = () => {
        if (!window.Kakao) {
            alert('카카오 SDK가 로드되지 않았습니다.');
            return;
        }
        // Logic to share via Kakao (similar to Blazor shareKakaoOrderLink)
        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: profile?.company_name || '소복 주문서',
                description: '간편하게 주문하고 소복하게 받아 가세요~~',
                imageUrl: 'https://ypyogighzmdgzxpwlmof.supabase.co/storage/v1/object/public/assets/logo_sq.png', // Placeholder
                link: {
                    mobileWebUrl: shopLink,
                    webUrl: shopLink,
                },
            },
            buttons: [
                {
                    title: '주문하기',
                    link: {
                        mobileWebUrl: shopLink,
                        webUrl: shopLink,
                    },
                },
            ],
        });
    };

    const getStatusLabel = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'pending') return '신규';
        return status;
    };

    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'pending' || status === '신규') return <AlertCircle className="text-red-400" size={16} />;

        switch (status) {
            case '확인': return <Clock className="text-amber-400" size={16} />;
            case '완료': return <CheckCircle2 className="text-emerald-400" size={16} />;
            case '취소': return <XCircle className="text-gray-400" size={16} />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'pending' || status === '신규') return 'bg-red-400/10 text-red-400 border-red-400/20';

        switch (status) {
            case '확인': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
            case '완료': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
            case '취소': return 'bg-white/5 text-gray-400 border-white/10';
            default: return 'bg-white/5 text-text-muted border-white/10';
        }
    };

    const formConfigMap = React.useMemo(() => {
        if (!profile?.order_form_config) return {};
        try {
            const config = JSON.parse(profile.order_form_config);
            return config.reduce((acc: any, el: any) => {
                acc[el.id] = el.label;
                return acc;
            }, {});
        } catch {
            return {};
        }
    }, [profile]);

    const getDisplayFields = (order: Order) => {
        const data = order.custom_data;
        if (!data) return [];

        let parsed: any;
        if (typeof data === 'string') {
            try { parsed = JSON.parse(data); } catch { return []; }
        } else {
            parsed = data;
        }

        if (Array.isArray(parsed)) return parsed;

        if (parsed && typeof parsed === 'object' && parsed.answers) {
            return Object.entries(parsed.answers).map(([key, value]) => ({
                label: formConfigMap[key] || '추가 정보',
                value: String(value)
            }));
        }

        return [];
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.customer_phone?.includes(searchQuery));

        if (statusFilter !== 'All') {
            return matchesSearch && order.status === statusFilter;
        }

        if (activeTab === 'Active') return matchesSearch && (order.status !== '완료' && order.status !== '취소');
        if (activeTab === 'Completed') return matchesSearch && (order.status === '완료' || order.status === '취소');
        return matchesSearch;
    });

    const toggleExpand = (order: Order) => {
        if (expandedOrderId === order.id) {
            setExpandedOrderId(null);
            setIsEditMode(false);
        } else {
            setExpandedOrderId(order.id);
            setIsEditMode(false);
            setEditingOrder(order);
            setEditingItems(order.Items || []);
            setCurrentRemarks(order.remarks || '');
        }
    };

    const handleUpdateQty = (itemId: number, qty: number) => {
        const newItems = editingItems.map(item =>
            item.id === itemId ? { ...item, quantity: qty } : item
        );
        setEditingItems(newItems);
        if (editingOrder) {
            const newTotal = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            setEditingOrder({ ...editingOrder, total_amount: newTotal });
        }
    };

    const saveChanges = async () => {
        if (!editingOrder) return;
        await updateOrderDetails({
            ...editingOrder,
            remarks: currentRemarks
        }, editingItems);
        setIsEditMode(false);
    };

    const handleStatusChange = async (order: Order, newStatus: string) => {
        if (confirm(`주문 상태를 [${newStatus}](으)로 변경할까요?`)) {
            await updateOrderStatus(order.id, newStatus, currentRemarks);
            setExpandedOrderId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <ClipboardList className="text-primary" size={40} />
                        주문 관리
                    </h1>
                    <p className="text-text-muted font-medium">실시간 접수된 주문을 확인하고 프로세스를 관리하세요.</p>
                </div>
            </div>

            {/* Shop Link Sharing Container */}
            <div className="glass p-6 border-l-4 border-l-primary flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Share2 className="text-primary" size={20} />
                        내 가게 주문서 공유하기
                    </h3>
                    <div className="flex items-center gap-2 group">
                        <code className="bg-white/5 px-3 py-1.5 rounded-lg text-primary text-sm font-mono truncate max-w-[300px]">
                            {shopLink}
                        </code>
                        <button onClick={handleCopyLink} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all">
                            <Copy size={16} />
                        </button>
                        <a href={shopLink} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all">
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
                <button
                    onClick={shareViaKakao}
                    className="btn h-14 px-8 rounded-2xl bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90 font-bold flex items-center gap-3 shadow-xl shadow-[#FEE500]/10"
                >
                    <MessageSquare size={20} fill="currentColor" />
                    카카오톡으로 주문서 공유
                </button>
            </div>

            {/* Filter Panel */}
            <div className="glass p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} /> 조회 기간
                        </label>
                        <div className="flex gap-2">
                            <input type="date" className="input-field h-11 py-0 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <span className="self-center text-text-muted opacity-50">~</span>
                            <input type="date" className="input-field h-11 py-0 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                            <User size={14} /> 고객명/연락처 검색
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                className="input-field h-11"
                                style={{ paddingLeft: '3.5rem' }}
                                placeholder="이름 또는 전화번호..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                            <RefreshCw size={14} /> 상태 필터
                        </label>
                        <select className="input-field h-11" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All" className="text-black">전체 상태 보기</option>
                            <option value="신규" className="text-black">🔴 신규 주문</option>
                            <option value="확인" className="text-black">🟡 확인 중</option>
                            <option value="완료" className="text-black">🟢 처리 완료</option>
                            <option value="취소" className="text-black">⚪ 주문 취소</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl overflow-hidden">
                    {(['Active', 'Completed', 'All'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-xl' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                        >
                            {tab === 'Active' ? '미완료 주문' : tab === 'Completed' ? '처리 완료/취소' : '전체 내역'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="glass overflow-hidden">
                {/* Orders List */}
                <div className="glass overflow-hidden">
                    {/* Desktop Table Header */}
                    <div className="hidden md:grid grid-cols-[1fr_2fr_3fr_1fr_1fr] gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-black text-text-muted uppercase tracking-widest bg-white/[0.02]">
                        <div>상태</div>
                        <div>고객명 / 연락처</div>
                        <div>주문 요약</div>
                        <div className="text-right">총 금액</div>
                        <div className="text-right">일시</div>
                    </div>

                    {/* Content */}
                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="py-20 text-center">
                                <RefreshCw className="animate-spin text-primary inline-block mb-2" size={32} />
                                <p className="text-text-muted font-bold">주문을 동기화하는 중...</p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="py-20 text-center text-text-muted italic">조회된 주문 내역이 없습니다.</div>
                        ) : (
                            filteredOrders.map(order => (
                                <React.Fragment key={order.id}>
                                    {/* Mobile Card View */}
                                    <div
                                        onClick={() => toggleExpand(order)}
                                        className={`md:hidden p-5 space-y-4 cursor-pointer transition-all ${expandedOrderId === order.id ? 'bg-primary/5' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {getStatusLabel(order.status)}
                                                </span>
                                                <span className="text-[10px] text-text-muted font-mono self-center">
                                                    {new Date(order.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="font-mono font-bold text-primary">{order.total_amount.toLocaleString()}원</div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="font-bold text-lg">{order.customer_name}</div>
                                            <div className="text-xs text-text-muted flex items-center gap-1">
                                                <Phone size={10} /> {order.customer_phone}
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-lg p-3 space-y-2">
                                            <div className="text-sm font-medium text-white/90 line-clamp-1">
                                                {order.Items && order.Items.length > 0
                                                    ? `${order.Items[0].item_name} ${order.Items.length > 1 ? `외 ${order.Items.length - 1}건` : ''}`
                                                    : (order.custom_data?.selected_product?.name || '상품 정보 없음')
                                                }
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {getDisplayFields(order).slice(0, 3).map((c: any, i: number) => (
                                                    <span key={i} className="text-[10px] bg-white/5 text-text-muted px-2 py-0.5 rounded border border-white/5">{c.value}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Table Row */}
                                    <div
                                        onClick={() => toggleExpand(order)}
                                        className={`hidden md:grid grid-cols-[1fr_2fr_3fr_1fr_1fr] gap-4 px-6 py-5 items-center cursor-pointer transition-all ${expandedOrderId === order.id ? 'bg-primary/5' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        <div>
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{order.customer_name}</div>
                                            <div className="text-xs text-text-muted flex items-center gap-1"><Phone size={10} /> {order.customer_phone}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white/90">
                                                {order.Items && order.Items.length > 0
                                                    ? `${order.Items[0].item_name} ${order.Items.length > 1 ? `외 ${order.Items.length - 1}건` : ''}`
                                                    : (order.custom_data?.selected_product?.name || '상품 정보 없음')
                                                }
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {getDisplayFields(order).slice(0, 2).map((c: any, i: number) => (
                                                    <span key={i} className="text-[10px] bg-white/5 text-text-muted px-2 py-0.5 rounded border border-white/5">{c.value}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-lg text-primary">{order.total_amount.toLocaleString()}원</div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-xs font-bold text-white/70">{new Date(order.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</span>
                                            <span className="text-[10px] text-text-muted font-mono">{new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                        </div>
                                    </div>

                                    {/* Expanded Details Panel (Shared) */}
                                    <AnimatePresence>
                                        {expandedOrderId === order.id && (
                                            <div className="border-b border-primary/20">
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-primary/[0.03]"
                                                >
                                                    <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                        <div className="lg:col-span-2 space-y-6">
                                                            <div className="flex justify-between items-center">
                                                                <h3 className="font-bold flex items-center gap-2"><CreditCard className="text-primary" size={18} /> 주문 품목 상세</h3>
                                                                {!isEditMode && <button onClick={() => setIsEditMode(true)} className="text-xs font-bold text-primary hover:underline">수정 모드</button>}
                                                            </div>

                                                            <div className="glass p-4 divide-y divide-white/5 space-y-4">
                                                                {isEditMode && (
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-text-muted">고객명</label>
                                                                            <input
                                                                                className="input-field h-9 text-sm"
                                                                                value={editingOrder?.customer_name}
                                                                                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, customer_name: e.target.value } : null)}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-text-muted">연락처</label>
                                                                            <input
                                                                                className="input-field h-9 text-sm"
                                                                                value={editingOrder?.customer_phone}
                                                                                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, customer_phone: e.target.value } : null)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {editingItems.length > 0 ? (
                                                                    editingItems.map((pItem) => (
                                                                        <div key={pItem.id} className="flex justify-between items-center pt-4 first:pt-0">
                                                                            <div>
                                                                                <div className="font-bold">{pItem.item_name}</div>
                                                                                <div className="text-xs text-text-muted">{pItem.price.toLocaleString()}원</div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                {isEditMode ? (
                                                                                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                                                                                        <input
                                                                                            type="number"
                                                                                            className="w-12 bg-transparent text-center font-bold text-sm outline-none"
                                                                                            value={pItem.quantity}
                                                                                            onChange={(e) => handleUpdateQty(pItem.id, Number(e.target.value))}
                                                                                        />
                                                                                        <span className="text-xs text-text-muted pr-2">개</span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="font-bold underline underline-offset-4 decoration-primary">{pItem.quantity}개</div>
                                                                                )}
                                                                                <div className="text-sm font-mono text-right w-24">{(pItem.price * pItem.quantity).toLocaleString()}원</div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    editingOrder?.custom_data?.selected_product && (
                                                                        <div className="flex justify-between items-center pt-4 first:pt-0">
                                                                            <div>
                                                                                <div className="font-bold">{editingOrder.custom_data.selected_product.name}</div>
                                                                                <div className="text-xs text-text-muted">{editingOrder.custom_data.selected_product.selling_price.toLocaleString()}원</div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="font-bold text-sm text-primary border border-primary/30 px-2 py-1 rounded bg-primary/5">
                                                                                    간편 주문 상품
                                                                                </div>
                                                                                <div className="text-sm font-mono text-right w-24">
                                                                                    {editingOrder.total_amount.toLocaleString()}원
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}

                                                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                                                    <span className="font-bold text-primary">합계 금액</span>
                                                                    {isEditMode ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="number"
                                                                                className="input-field h-10 w-32 text-right font-black text-primary"
                                                                                value={editingOrder?.total_amount}
                                                                                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, total_amount: Number(e.target.value) } : null)}
                                                                            />
                                                                            <span>원</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xl font-black text-primary">{order.total_amount.toLocaleString()}원</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <h3 className="font-bold flex items-center gap-2 text-text-muted"><ChevronRight size={18} /> 고객 선택 정보</h3>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                    {getDisplayFields(order).map((f: any, i: number) => (
                                                                        <div key={i} className="glass p-3 space-y-1">
                                                                            <div className="text-[10px] font-bold text-text-muted uppercase">{f.label}</div>
                                                                            <div className="text-sm font-bold">{f.value}</div>
                                                                        </div>
                                                                    ))}
                                                                    {order.request_note && (
                                                                        <div className="col-span-full glass p-3 border-l-2 border-l-amber-400">
                                                                            <div className="text-[10px] font-bold text-amber-400 uppercase">요청 사항</div>
                                                                            <div className="text-sm">{order.request_note}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="space-y-2">
                                                                <h3 className="font-bold flex items-center gap-2"><Edit className="text-primary" size={18} /> 관리자 메모</h3>
                                                                <textarea
                                                                    className="input-field min-h-[150px] py-4 text-sm"
                                                                    placeholder="사장님만 볼 수 있는 메모..."
                                                                    value={currentRemarks}
                                                                    onChange={(e) => setCurrentRemarks(e.target.value)}
                                                                />
                                                            </div>

                                                            <div className="grid gap-3">
                                                                {isEditMode ? (
                                                                    <>
                                                                        <button onClick={saveChanges} className="btn btn-primary w-full py-4 shadow-xl shadow-primary/20"><Save size={18} /> 수정 내용 저장</button>
                                                                        <button onClick={() => setIsEditMode(false)} className="btn w-full py-4 bg-white/5 hover:bg-white/10">취소</button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {order.status !== '완료' && (
                                                                            <button
                                                                                onClick={() => handleStatusChange(order, '완료')}
                                                                                className="btn w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10"
                                                                            >
                                                                                <CheckCircle2 size={18} /> 처리 완료 및 저장
                                                                            </button>
                                                                        )}
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <button onClick={() => handleStatusChange(order, '확인')} className="btn py-4 bg-white/5 border border-white/5 text-xs">확인 중으로</button>
                                                                            <button onClick={() => handleStatusChange(order, '취소')} className="btn py-4 bg-red-400/10 text-red-400 border border-red-400/20 text-xs hover:bg-red-400 hover:text-white transition-all">주문 취소</button>
                                                                        </div>
                                                                        {(['신규', 'Pending', 'pending'].includes(order.status)) && (
                                                                            <button
                                                                                onClick={async (e) => {
                                                                                    e.stopPropagation();
                                                                                    if (confirm('정말로 이 주문을 완전히 삭제하시겠습니까?\n삭제된 주문은 복구할 수 없습니다.')) {
                                                                                        await deleteOrder(order.id);
                                                                                        setExpandedOrderId(null);
                                                                                    }
                                                                                }}
                                                                                className="btn w-full py-3 bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white border border-red-500/10 text-xs flex items-center justify-center gap-2 mt-2"
                                                                            >
                                                                                <Trash2 size={14} /> 주문 영구 삭제
                                                                            </button>
                                                                        )}
                                                                        {order.status === '완료' && (
                                                                            <button onClick={saveChanges} className="btn w-full py-4 bg-primary/10 text-primary border border-primary/20"><Save size={18} /> 메모만 수정 저장</button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
