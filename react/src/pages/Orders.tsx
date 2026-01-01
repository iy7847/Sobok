import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../contexts/AuthContext';
import {
    ClipboardList,
    ExternalLink,
    Share2,
    MessageSquare,
    Copy,
    RefreshCw
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import type { Order, OrderItem } from '../types';
import { shareKakao } from '../utils/kakao';

// New Components
import OrderFilters from '../components/orders/OrderFilters';
import OrderCard from '../components/orders/OrderCard';
import OrderTableRow from '../components/orders/OrderTableRow';
import OrderDetailsPanel from '../components/orders/OrderDetailsPanel';

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

    const handleShareViaKakao = () => {
        shareKakao(
            profile?.company_name || '소복 주문서',
            '간편하게 주문하고 소복하게 받아 가세요~~',
            'https://ypyogighzmdgzxpwlmof.supabase.co/storage/v1/object/public/assets/logo_sq.png',
            shopLink
        );
    };

    const formConfigMap = useMemo(() => {
        if (!profile?.order_form_config) return {};
        try {
            const config = JSON.parse(profile.order_form_config);
            return config.reduce((acc: any, el: any) => {
                acc[el.id] = { label: el.label, type: el.type };
                return acc;
            }, {});
        } catch {
            return {};
        }
    }, [profile]);

    const getDisplayFields = useCallback((order: Order) => {
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
            return Object.entries(parsed.answers).map(([key, value]) => {
                const config = formConfigMap[key];
                return {
                    label: config?.label || '추가 정보',
                    value: String(value),
                    type: config?.type || 'Text'
                };
            });
        }

        return [];
    }, [formConfigMap]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
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
    }, [orders, searchQuery, statusFilter, activeTab]);

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
                    <h1 className="text-2xl xs:text-3xl md:text-5xl font-black tracking-tighter flex items-center gap-3 md:gap-4">
                        <ClipboardList className="text-primary shrink-0" size={32} />
                        <span className="truncate">주문 관리</span>
                    </h1>
                    <p className="text-text-muted font-medium">실시간 접수된 주문을 확인하고 프로세스를 관리하세요.</p>
                </div>
            </div>

            {/* Shop Link Sharing Container */}
            {/* Shop Link Sharing Container */}
            <div className="glass p-4 md:p-6 border-l-4 border-l-primary space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                        <Share2 className="text-primary" size={18} />
                        내 가게 주문서 공유
                    </h3>
                    <button
                        onClick={handleShareViaKakao}
                        className="btn h-9 px-4 rounded-xl bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90 font-bold flex items-center gap-2 text-xs md:text-sm shadow-sm ml-auto sm:ml-0"
                    >
                        <MessageSquare size={16} fill="currentColor" />
                        <span className="whitespace-nowrap">카카오톡 공유</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 group w-full bg-white/5 p-2 rounded-xl border border-white/5">
                    <code className="px-2 text-primary text-sm font-mono truncate flex-1 min-w-0 bg-transparent">
                        {shopLink}
                    </code>
                    <div className="shrink-0 flex gap-1 border-l border-white/10 pl-2">
                        <button onClick={handleCopyLink} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all" title="링크 복사">
                            <Copy size={16} />
                        </button>
                        <a href={shopLink} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all" title="새 탭에서 열기">
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>

            <OrderFilters
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                activeTab={activeTab} setActiveTab={setActiveTab}
            />

            <div className="glass overflow-hidden">
                <div className="overflow-hidden">
                    {/* Desktop Table Header */}
                    <div className="hidden md:grid grid-cols-[1fr_2fr_3fr_1fr_1fr] gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-black text-text-muted uppercase tracking-widest bg-white/[0.02]">
                        <div>상태</div>
                        <div>고객명 / 연락처</div>
                        <div>주문 요약</div>
                        <div className="text-right">총 금액</div>
                        <div className="text-right">일시</div>
                    </div>

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
                                    <OrderCard
                                        order={order}
                                        expanded={expandedOrderId === order.id}
                                        onClick={() => toggleExpand(order)}
                                        displayFields={getDisplayFields(order)}
                                    />
                                    <OrderTableRow
                                        order={order}
                                        expanded={expandedOrderId === order.id}
                                        onClick={() => toggleExpand(order)}
                                        displayFields={getDisplayFields(order)}
                                    />

                                    <AnimatePresence>
                                        {expandedOrderId === order.id && (
                                            <OrderDetailsPanel
                                                order={order}
                                                isEditMode={isEditMode}
                                                setIsEditMode={setIsEditMode}
                                                editingOrder={editingOrder}
                                                setEditingOrder={setEditingOrder}
                                                editingItems={editingItems}
                                                handleUpdateQty={handleUpdateQty}
                                                currentRemarks={currentRemarks}
                                                setCurrentRemarks={setCurrentRemarks}
                                                saveChanges={saveChanges}
                                                handleStatusChange={handleStatusChange}
                                                deleteOrder={deleteOrder}
                                                displayFields={getDisplayFields(order)}
                                                onClose={() => setExpandedOrderId(null)}
                                            />
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
