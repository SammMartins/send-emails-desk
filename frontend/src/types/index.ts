// Tipos para autenticação
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Tipos para contatos
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  created_by_name?: string;
  is_active: boolean;
  notes?: string;
  tickets_count: number;
}

export interface ContactHistory {
  id: number;
  contact: number;
  interaction_type: string;
  interaction_type_display: string;
  description: string;
  created_at: string;
  created_by?: number;
  created_by_name?: string;
  related_ticket?: number;
}

// Tipos para tickets
export interface TicketCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  tickets_count: number;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_display: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'waiting_approval' | 'resolved' | 'closed' | 'cancelled';
  status_display: string;
  contact: Contact;
  assigned_to?: User;
  category?: TicketCategory;
  created_at: string;
  updated_at: string;
  sla_deadline?: string;
  resolved_at?: string;
  closed_at?: string;
  created_by?: User;
  email_thread_id?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  tags?: string;
  is_overdue: boolean;
  time_to_resolution?: number;
  comments?: TicketComment[];
  attachments?: TicketAttachment[];
}

export interface TicketListItem {
  id: number;
  title: string;
  priority: string;
  priority_display: string;
  status: string;
  status_display: string;
  contact_name: string;
  contact_email: string;
  assigned_to_name?: string;
  category_name?: string;
  created_at: string;
  updated_at: string;
  sla_deadline?: string;
  is_overdue: boolean;
}

export interface TicketComment {
  id: number;
  ticket: number;
  comment_type: 'internal' | 'public' | 'system';
  comment_type_display: string;
  content: string;
  created_at: string;
  created_by?: number;
  created_by_name?: string;
  email_message_id?: string;
  is_email_response: boolean;
}

export interface TicketAttachment {
  id: number;
  ticket: number;
  file: string;
  file_url: string;
  filename: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
  uploaded_by?: number;
  uploaded_by_name?: string;
}

export interface TicketLog {
  id: number;
  ticket: number;
  action: string;
  action_display: string;
  description: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  created_by?: number;
  created_by_name?: string;
  ip_address?: string;
}

// Tipos para estatísticas
export interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  overdue_tickets: number;
  avg_resolution_time: number;
  tickets_by_priority: Record<string, number>;
  tickets_by_status: Record<string, number>;
  tickets_by_category: Record<string, number>;
  sla_compliance: number;
}

// Tipos para formulários
export interface TicketCreateData {
  title: string;
  description: string;
  priority: string;
  contact: number;
  assigned_to?: number;
  category?: number;
  tags?: string;
}

export interface TicketUpdateData {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  assigned_to?: number;
  category?: number;
  tags?: string;
}

export interface ContactCreateData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  department?: string;
  notes?: string;
}

export interface CommentCreateData {
  content: string;
  comment_type: 'internal' | 'public';
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Tipos para filtros
export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: number;
  assigned_to?: number;
  contact?: number;
  overdue?: boolean;
  days?: number;
  sentiment?: string;
  search?: string;
  ordering?: string;
}

export interface ContactFilters {
  is_active?: boolean;
  company?: string;
  department?: string;
  search?: string;
  ordering?: string;
}

// Tipos para dashboard
export interface DashboardData {
  stats: TicketStats;
  recentTickets: TicketListItem[];
  overdueTickets: TicketListItem[];
  myTickets: TicketListItem[];
}

// Constantes
export const PRIORITY_COLORS = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  urgent: '#d32f2f',
} as const;

export const STATUS_COLORS = {
  open: '#2196f3',
  in_progress: '#ff9800',
  waiting_customer: '#9c27b0',
  waiting_approval: '#795548',
  resolved: '#4caf50',
  closed: '#757575',
  cancelled: '#f44336',
} as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export const STATUS_OPTIONS = [
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'waiting_customer', label: 'Aguardando Cliente' },
  { value: 'waiting_approval', label: 'Aguardando Aprovação' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
  { value: 'cancelled', label: 'Cancelado' },
];