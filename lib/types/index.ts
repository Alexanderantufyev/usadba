export type BookingStatus = 'draft' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled' | 'no_show'
export type BookingType   = 'event' | 'rental' | 'private' | 'recurring' | 'blocked'
export type UserRole      = 'owner' | 'manager' | 'staff' | 'accountant'
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'online' | 'other'

export interface Location {
  id:          string
  name:        string
  slug:        string
  description: string | null
  capacity:    number | null
  area_sqm:    number | null
  color:       string
  hourly_rate: number
  daily_rate:  number
  is_active:   boolean
  sort_order:  number
  created_at:  string
}

export interface Customer {
  id:         string
  name:       string
  phone:      string | null
  email:      string | null
  company:    string | null
  is_vip:     boolean
  tags:       string[]
  created_at: string
}

export interface Booking {
  id:               string
  location_id:      string
  customer_id:      string | null
  title:            string
  description:      string | null
  type:             BookingType
  status:           BookingStatus
  starts_at:        string
  ends_at:          string
  setup_minutes:    number
  cleanup_minutes:  number
  all_day:          boolean
  base_price:       number
  discount_amount:  number
  final_price:      number
  deposit_amount:   number
  deposit_paid_at:  string | null
  guests_count:     number | null
  color:            string | null
  notes:            string | null
  created_at:       string
  // joined
  location?:        Location
  customer?:        Customer
}

export interface Payment {
  id:         string
  booking_id: string | null
  invoice_id: string | null
  amount:     number
  method:     PaymentMethod
  is_deposit: boolean
  is_refund:  boolean
  paid_at:    string
  notes:      string | null
}

export interface Expense {
  id:          string
  booking_id:  string | null
  category:    string
  amount:      number
  vendor:      string | null
  description: string | null
  date:        string
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  draft:        'Черновик',
  confirmed:    'Подтверждено',
  deposit_paid: 'Депозит',
  completed:    'Завершено',
  cancelled:    'Отменено',
  no_show:      'Не явился',
}

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  event:     'Мероприятие',
  rental:    'Аренда',
  private:   'Частное',
  recurring: 'Регулярное',
  blocked:   'Заблокировано',
}
