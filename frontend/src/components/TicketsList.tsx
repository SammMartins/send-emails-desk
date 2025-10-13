import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ticketService } from '../services/api';
import { TicketListItem, TicketFilters, PRIORITY_COLORS, STATUS_COLORS } from '../types';

interface TicketsListProps {
  tickets?: TicketListItem[];
  title?: string;
  showPagination?: boolean;
  onTicketClick?: (ticket: TicketListItem) => void;
}

const TicketsList: React.FC<TicketsListProps> = ({
  tickets: propTickets,
  title = 'Tickets',
  showPagination = true,
  onTicketClick,
}) => {
  const [tickets, setTickets] = useState<TicketListItem[]>(propTickets || []);
  const [loading, setLoading] = useState(!propTickets);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketListItem | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadTickets = async () => {
    if (propTickets) return; // Se tickets foram passados como prop, não carregar

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm,
        ...filters,
      };

      const response = await ticketService.getTickets(params);
      setTickets(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [page, rowsPerPage, filters, searchTerm]);

  useEffect(() => {
    if (propTickets) {
      setTickets(propTickets);
      setTotalCount(propTickets.length);
    }
  }, [propTickets]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, ticket: TicketListItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicket(null);
  };

  const handleTicketClick = (ticket: TicketListItem) => {
    if (onTicketClick) {
      onTicketClick(ticket);
    }
  };

  const handleFilterChange = (field: keyof TicketFilters) => (
    event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value || undefined,
    }));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || '#757575';
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#757575';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={handleFilterChange('status')}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="open">Aberto</MenuItem>
              <MenuItem value="in_progress">Em Andamento</MenuItem>
              <MenuItem value="waiting_customer">Aguardando Cliente</MenuItem>
              <MenuItem value="resolved">Resolvido</MenuItem>
              <MenuItem value="closed">Fechado</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={filters.priority || ''}
              label="Prioridade"
              onChange={handleFilterChange('priority')}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="low">Baixa</MenuItem>
              <MenuItem value="medium">Média</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
              <MenuItem value="urgent">Urgente</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Atribuído</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell>SLA</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                hover
                onClick={() => handleTicketClick(ticket)}
                sx={{ cursor: onTicketClick ? 'pointer' : 'default' }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <AssignmentIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    #{ticket.id}
                    {ticket.is_overdue && (
                      <Tooltip title="Ticket atrasado">
                        <WarningIcon fontSize="small" color="warning" sx={{ ml: 1 }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {ticket.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{ticket.contact_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.contact_email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.priority_display}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(ticket.priority),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status_display}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: getStatusColor(ticket.status),
                      color: getStatusColor(ticket.status),
                    }}
                  />
                </TableCell>
                <TableCell>
                  {ticket.assigned_to_name || (
                    <Typography variant="body2" color="text.secondary">
                      Não atribuído
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(ticket.created_at)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {ticket.sla_deadline ? (
                    <Typography
                      variant="body2"
                      color={ticket.is_overdue ? 'error' : 'text.primary'}
                    >
                      {formatDate(ticket.sla_deadline)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      N/A
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(e, ticket);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedTicket && onTicketClick) {
            onTicketClick(selectedTicket);
          }
          handleMenuClose();
        }}>
          Ver Detalhes
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Editar
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Atribuir
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Alterar Status
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TicketsList;