export type ItemType = 'Material' | 'Component' | 'Product';

export interface Item {
    id: number;
    name: string;
    type: ItemType;
    selling_price: number;
    cost_price: number;
    created_at: string;
    estimated_monthly_sales: number;
    purchase_price: number;
    purchase_qty: number;
    purchase_unit?: string;
    usage_qty: number;
    extra_1?: string;
    extra_2?: string;
    extra_3?: string;
    extra_4?: string;
    extra_5?: string;
    remarks?: string;
    // UI only
    showDetail?: boolean;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    company_name?: string;
    representative_name?: string;
    business_number?: string;
    address?: string;
    business_type?: string;
    phone_number?: string;
    shop_notice?: string;
    bank_account?: string;
    subscription_end_date?: string;
    order_form_config?: string; // JSON string
}

export interface BOM {
    id: number;
    parent_item_id: number;
    child_item_id: number;
    quantity: number;
    created_at: string;
    extra_1?: string;
    extra_2?: string;
    extra_3?: string;
    extra_4?: string;
    extra_5?: string;
    remarks?: string;
    // UI only / Joined
    child_item?: Item;
}

export interface Order {
    id: string;
    shop_id: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    status: string;
    request_note: string;
    created_at: string;
    custom_data?: any;
    remarks?: string;
    Items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: string;
    item_name: string;
    quantity: number;
    price: number;
}

export interface FixedCost {
    id: number;
    name: string;
    amount: number;
    payment_day: number;
    description?: string;
    created_at: string;
    extra_1?: string;
    extra_2?: string;
    extra_3?: string;
    extra_4?: string;
    extra_5?: string;
    remarks?: string;
}

export interface Expense {
    id: number;
    expense_date: string;
    category: string;
    name: string;
    amount: number;
    description?: string;
    created_at: string;
}

export interface FormElement {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    options: string; // Comma separated for selection types, or base64 for images
}
