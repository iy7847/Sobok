import React from 'react';
import { CreditCard, Save, CheckCircle2, Trash2, Edit, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Order, OrderItem } from '../../types';

interface OrderDetailsPanelProps {
    order: Order;
    isEditMode: boolean;
    setIsEditMode: (val: boolean) => void;
    editingOrder: Order | null;
    setEditingOrder: React.Dispatch<React.SetStateAction<Order | null>>;
    editingItems: OrderItem[];
    handleUpdateQty: (itemId: number, qty: number) => void;
    currentRemarks: string;
    setCurrentRemarks: (val: string) => void;
    saveChanges: () => Promise<void>;
    handleStatusChange: (order: Order, newStatus: string) => Promise<void>;
    deleteOrder: (id: string) => Promise<any>;
    displayFields: { label: string; value: string }[];
    onClose: () => void;
}

const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({
    order, isEditMode, setIsEditMode, editingOrder, setEditingOrder,
    editingItems, handleUpdateQty, currentRemarks, setCurrentRemarks,
    saveChanges, handleStatusChange, deleteOrder, displayFields, onClose
}) => {
    return (
        <div className="border-b border-gray-200 dark:border-primary/20">
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-gray-50 dark:bg-white/[0.02]"
            >
                <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><CreditCard className="text-primary" size={18} /> 주문 품목 상세</h3>
                            {!isEditMode && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditMode(true)}
                                >
                                    수정 모드
                                </Button>
                            )}
                        </div>

                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-4 divide-y divide-gray-200 dark:divide-white/5 space-y-4">
                            {isEditMode && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                                    <Input
                                        label="고객명"
                                        value={editingOrder?.customer_name}
                                        onChange={(e) => setEditingOrder(prev => prev ? { ...prev, customer_name: e.target.value } : null)}
                                        className="h-9 text-sm"
                                        containerClassName="space-y-1"
                                    />
                                    <Input
                                        label="연락처"
                                        value={editingOrder?.customer_phone}
                                        onChange={(e) => setEditingOrder(prev => prev ? { ...prev, customer_phone: e.target.value } : null)}
                                        className="h-9 text-sm"
                                        containerClassName="space-y-1"
                                    />
                                </div>
                            )}

                            {editingItems.length > 0 ? (
                                editingItems.map((pItem) => (
                                    <div key={pItem.id} className="flex justify-between items-center pt-4 first:pt-0">
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold truncate">{pItem.item_name}</div>
                                            <div className="text-xs text-text-muted">{pItem.price.toLocaleString()}원</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {isEditMode ? (
                                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/10">
                                                    <input
                                                        type="number"
                                                        className="w-12 bg-transparent text-center font-bold text-sm outline-none text-black dark:text-white"
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
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold truncate">{editingOrder.custom_data.selected_product.name}</div>
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

                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/10">
                                <span className="font-bold text-primary">합계 금액</span>
                                {isEditMode ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="h-10 w-32 text-right font-black text-primary border-none bg-transparent"
                                            value={editingOrder?.total_amount}
                                            onChange={(e) => setEditingOrder(prev => prev ? { ...prev, total_amount: Number(e.target.value) } : null)}
                                            containerClassName="!space-y-0"
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
                                {displayFields.map((f, i) => (
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
                                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg min-h-[150px] p-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-black dark:text-white"
                                placeholder="사장님만 볼 수 있는 메모..."
                                value={currentRemarks}
                                onChange={(e) => setCurrentRemarks(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-3">
                            {isEditMode ? (
                                <>
                                    <Button
                                        onClick={saveChanges}
                                        variant="primary"
                                        className="w-full py-4 shadow-xl shadow-primary/20"
                                        leftIcon={<Save size={18} />}
                                    >
                                        수정 내용 저장
                                    </Button>
                                    <Button
                                        onClick={() => setIsEditMode(false)}
                                        variant="secondary"
                                        className="w-full py-4"
                                    >
                                        취소
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {order.status !== '완료' && (
                                        <Button
                                            onClick={() => handleStatusChange(order, '완료')}
                                            className="w-full py-4 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10"
                                            leftIcon={<CheckCircle2 size={18} />}
                                        >
                                            처리 완료 및 저장
                                        </Button>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            onClick={() => handleStatusChange(order, '확인')}
                                            variant="secondary"
                                            className="py-4 text-xs font-bold text-text-main hover:bg-gray-200 dark:hover:bg-white/10"
                                        >
                                            확인 중으로
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusChange(order, '취소')}
                                            variant="ghost"
                                            className="py-4 bg-red-400/10 text-red-600 dark:text-red-400 border border-red-400/20 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            주문 취소
                                        </Button>
                                    </div>
                                    {(['신규', 'Pending', 'pending'].includes(order.status)) && (
                                        <Button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (confirm('정말로 이 주문을 완전히 삭제하시겠습니까?\n삭제된 주문은 복구할 수 없습니다.')) {
                                                    await deleteOrder(order.id);
                                                    onClose();
                                                }
                                            }}
                                            variant="ghost"
                                            className="w-full py-3 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10 text-xs mt-2 font-bold"
                                            leftIcon={<Trash2 size={14} />}
                                        >
                                            주문 영구 삭제
                                        </Button>
                                    )}
                                    {order.status === '완료' && (
                                        <Button
                                            onClick={saveChanges}
                                            className="w-full py-4 bg-primary/10 text-primary border border-primary/20"
                                            leftIcon={<Save size={18} />}
                                        >
                                            메모만 수정 저장
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderDetailsPanel;
